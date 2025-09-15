const { User, Task } = require("../models");
const { Op } = require("sequelize");

// Get all users (Admin only)
const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: [
        "id",
        "firstName",
        "lastName",
        "email",
        "phone",
        "idCardNumber",
        "role",
        "teamLeadId",
        "isActive",
        "createdAt",
      ],
      include: [
        {
          model: Task,
          as: "assignedTasks",
          attributes: ["id", "title", "status", "priority", "dueDate"],
          required: false,
        },
        {
          model: User,
          as: "teamLead",
          attributes: ["id", "firstName", "lastName"],
          required: false,
        },
      ],
    });

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          total: users.length,
          page: 1,
          limit: users.length,
          totalPages: 1,
        },
      },
    });
  } catch (error) {
    console.error("Get all users error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch users",
      error: error.message,
    });
  }
};

// Get team leads (for assignment dropdown)
const getTeamLeads = async (req, res) => {
  try {
    const teamLeads = await User.findAll({
      where: { role: "team_lead" },
      attributes: ["id", "firstName", "lastName", "email"],
    });

    res.json({
      success: true,
      data: { teamLeads },
    });
  } catch (error) {
    console.error("Get team leads error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch team leads",
      error: error.message,
    });
  }
};

// Get internees under a team lead
const getInternees = async (req, res) => {
  try {
    const { user } = req;
    const teamLeadId = req.params.teamLeadId || user.id;

    let whereClause = { role: 'internee' };

    if (user.role === 'team_lead') {
      whereClause.teamLeadId = teamLeadId;
    } else if (user.role !== 'admin') {
      // If not an admin or a team lead, return empty list
      return res.json({ success: true, data: { users: [] } });
    }

    const internees = await User.findAll({
      where: whereClause,
      attributes: ["id", "firstName", "lastName", "email", "isActive", "role", "teamLeadId"],
      include: [
        {
          model: Task,
          as: 'assignedTasks',
          attributes: ['id', 'title', 'status', 'priority', 'dueDate'],
          required: false
        }
      ]
    });

    res.json({
      success: true,
      data: { users: internees },
    });
  } catch (error) {
    console.error("Get internees error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch internees",
      error: error.message,
    });
  }
};

// Update user status (Admin only)
const updateUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { isActive } = req.body;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    await User.update(
      { isActive },
      { where: { id: userId } }
    );

    const updatedUser = await User.findByPk(userId, {
      attributes: { exclude: ["password"] },
    });

    res.json({
      success: true,
      message: `User ${isActive ? "activated" : "deactivated"} successfully`,
      data: { user: updatedUser },
    });
  } catch (error) {
    console.error("Update user status error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update user status",
      error: error.message,
    });
  }
};

// Update user role (Admin only)
const updateUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role, teamLeadId } = req.body;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Validate role
    const validRoles = ["admin", "team_lead", "employee", "internee"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role specified",
      });
    }

    // Validate team lead assignment for internees
    if (role === "internee" && teamLeadId) {
      const teamLead = await User.findOne({
        where: { id: teamLeadId, role: "team_lead" },
      });
      if (!teamLead) {
        return res.status(400).json({
          success: false,
          message: "Invalid team lead assignment",
        });
      }
    }

    const updateData = { role };
    if (role === "internee" && teamLeadId) {
      updateData.teamLeadId = teamLeadId;
    } else if (role !== "internee") {
      updateData.teamLeadId = null;
    }

    await User.update(updateData, { where: { id: userId } });

    const updatedUser = await User.findByPk(userId, {
      attributes: { exclude: ["password"] },
      include: [
        {
          model: User,
          as: "teamLead",
          attributes: ["id", "firstName", "lastName"],
          required: false,
        },
      ],
    });

    res.json({
      success: true,
      message: "User role updated successfully",
      data: { user: updatedUser },
    });
  } catch (error) {
    console.error("Update user role error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update user role",
      error: error.message,
    });
  }
};

// Get dashboard stats based on user role
const getDashboardStats = async (req, res) => {
    const { user } = req;
    let stats = {};

    try {
        switch (user.role) {
            case 'admin': {
                const [totalUsers, totalInternees, totalTeamLeads, totalEmployees, totalTasks, pendingTasks, completedTasks, rejectedTasks] = await Promise.all([
                    User.count(),
                    User.count({ where: { role: "internee" } }),
                    User.count({ where: { role: "team_lead" } }),
                    User.count({ where: { role: "employee" } }),
                    Task.count(),
                    Task.count({ where: { status: 'submitted' } }),
                    Task.count({ where: { status: 'accepted' } }), // Corrected value
                    Task.count({ where: { status: 'rejected' } })
                ]);
                stats = { totalUsers, totalInternees, totalTeamLeads, totalEmployees, totalTasks, pendingTasks, completedTasks, rejectedTasks };
                break;
            }
            case 'team_lead': {
                const myInternees = await User.findAll({ 
                    where: { role: 'internee', teamLeadId: user.id },
                    attributes: ['id']
                });
                const interneeIds = myInternees.map(i => i.id);

                if (interneeIds.length > 0) {
                    const [totalInternees, activeInternees, totalTasks, pendingTasks] = await Promise.all([
                        User.count({ where: { id: { [Op.in]: interneeIds } } }),
                        User.count({ where: { id: { [Op.in]: interneeIds }, isActive: true } }),
                        Task.count({ where: { assigneeId: { [Op.in]: interneeIds } } }),
                        Task.count({ where: { assigneeId: { [Op.in]: interneeIds }, status: 'submitted' } })
                    ]);
                    stats = { totalInternees, activeInternees, totalTasks, pendingTasks };
                } else {
                    stats = { totalInternees: 0, activeInternees: 0, totalTasks: 0, pendingTasks: 0 };
                }
                break;
            }
            case 'employee':
            case 'internee': {
                 const [totalTasks, pendingTasks, completedTasks, acceptedTasks] = await Promise.all([
                    Task.count({ where: { assigneeId: user.id } }),
                    Task.count({ where: { assigneeId: user.id, status: 'assigned' } }),
                    Task.count({ where: { assigneeId: user.id, status: 'accepted' } }), // Corrected value
                    Task.count({ where: { assigneeId: user.id, status: 'accepted' } })
                ]);
                stats = { totalTasks, pendingTasks, completedTasks, acceptedTasks };
                break;
            }
        }

        res.json({
            success: true,
            data: { stats },
        });

    } catch (error) {
        console.error("Get dashboard stats error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch dashboard stats",
            error: error.message,
        });
    }
};

module.exports = {
  getAllUsers,
  getTeamLeads,
  getInternees,
  updateUserStatus,
  updateUserRole,
  getDashboardStats,
};