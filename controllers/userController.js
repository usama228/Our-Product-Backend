
const { User, Task } = require("../models");
const { Op } = require("sequelize");

// Get all users (Admin or Team Lead)
const getAllUsers = async (req, res) => {
  try {
    const { user } = req;
    const { page = 1, limit = 10, search = '', role = '', status = '' } = req.query;

    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const searchLimit = parseInt(limit, 10);

    let whereClause = {};

    // Role-based access control
    if (user.role === 'admin') {
      if (role) {
        whereClause.role = role;
      }
    } else if (user.role === 'team_lead') {
      // Team leads can ONLY see their own internees. 
      whereClause.role = 'internee';
      whereClause.teamLeadId = user.id;
      if (role && role !== 'internee') {
          return res.json({ 
              success: true, 
              data: { users: [], pagination: { total: 0, page: 1, limit: searchLimit, totalPages: 1 } } 
          });
      }
    } else {
      return res.status(403).json({ success: false, message: 'Access Denied' });
    }

    if (status) {
      whereClause.isActive = status === 'active';
    }

    if (search) {
      whereClause[Op.or] = [
        { firstName: { [Op.iLike]: `%${search}%` } },
        { lastName: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const { count, rows: users } = await User.findAndCountAll({
      where: whereClause,
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
        "profilePicture",
      ],
      include: [
        {
          model: Task,
          as: "assignedTasks",
          attributes: ["id", "title", "status"],
          required: false,
        },
        {
          model: User,
          as: "teamLead",
          attributes: ["id", "firstName", "lastName"],
          required: false,
        },
      ],
      limit: searchLimit,
      offset: offset,
      order: [['createdAt', 'DESC']],
      distinct: true,
    });

    const totalPages = Math.ceil(count / searchLimit);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          total: count,
          page: parseInt(page, 10),
          limit: searchLimit,
          totalPages,
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

// Get a single user by ID
const getUserById = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findByPk(userId, {
      attributes: [
        "id",
        "firstName",
        "lastName",
        "email",
        "phone",
        "idCardNumber",
        "profilePicture",
        "idCardFrontPic",
        "idCardBackPic",
        "role",
        "teamLeadId",
        "isActive",
        "createdAt",
      ],
      include: [
        {
          model: User,
          as: "teamLead",
          attributes: ["id", "firstName", "lastName"],
          required: false,
        },
      ],
    });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({ success: true, data: { user } });
  } catch (error) {
    console.error("Get user by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch user",
      stack: error.stack,
      error: error.message,
    });
  }
};

// Update a user's profile
const updateUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const { firstName, lastName, phone, idCardNumber, password } = req.body;

        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const updateData = {
            firstName,
            lastName,
            phone,
            idCardNumber,
        };
        
        if (password) {
            updateData.password = password; // The model hook will hash it
        }

        if (req.files) {
            if (req.files.profilePicture) {
                updateData.profilePicture = '/uploads/profiles/' + req.files.profilePicture[0].filename;
            }
            if (req.files.idCardFrontPic) {
                updateData.idCardFrontPic = '/uploads/documents/' + req.files.idCardFrontPic[0].filename;
            }
            if (req.files.idCardBackPic) {
                updateData.idCardBackPic = '/uploads/documents/' + req.files.idCardBackPic[0].filename;
            }
        }

        await user.update(updateData);

        res.json({ success: true, message: "User profile updated successfully" });

    } catch (error) {
        console.error("Update user error:", error);
        res.status(500).json({ success: false, message: "Failed to update user profile", error: error.message });
    }
};


// Get team leads (for assignment dropdown)
const getTeamLeads = async (req, res) => {
  try {
    const teamLeads = await User.findAll({
      where: { role: "team_lead" },
      attributes: ["id", "firstName", "lastName", "email", "profilePicture"],
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

const getInternees = async (req, res) => {
  try {
      const { user } = req;
      const teamLeadId = req.params.teamLeadId || user.id;

      let whereClause = { role: 'internee' };

      if (user.role === 'team_lead') {
          whereClause.teamLeadId = teamLeadId;
      } 
      else if (user.role === 'admin') {
          if (req.params.teamLeadId) {
              whereClause.teamLeadId = req.params.teamLeadId;
          }
      } 
      else {
          return res.json({ success: true, data: { users: [] } });
      }

      const internees = await User.findAll({
          where: whereClause,
          attributes: ["id", "firstName", "lastName", "email", "isActive", "role", "teamLeadId", "profilePicture"],
          include: [
              {
                  model: User,
                  as: 'teamLead',
                  attributes: ['id', 'firstName', 'lastName'],
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

    await User.update(
      { isActive },
      { where: { id: userId } }
    );

    res.json({
      success: true,
      message: `User ${isActive ? "activated" : "deactivated"} successfully`,
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

    const updateData = { role };
    if (role === "internee" && teamLeadId) {
      updateData.teamLeadId = teamLeadId;
    } else {
      updateData.teamLeadId = null;
    }

    await User.update(updateData, { where: { id: userId } });

    res.json({
      success: true,
      message: "User role updated successfully",
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
                    Task.count({ where: { status: 'accepted' } }),
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

                const [totalInternees, activeInternees, totalTasks, pendingTasks] = await Promise.all([
                    User.count({ where: { id: { [Op.in]: interneeIds } } }),
                    User.count({ where: { id: { [Op.in]: interneeIds }, isActive: true } }),
                    Task.count({ where: { assigneeId: { [Op.in]: interneeIds } } }),
                    Task.count({ where: { assigneeId: { [Op.in]: interneeIds }, status: 'submitted' } })
                ]);
                stats = { totalInternees, activeInternees, totalTasks, pendingTasks };
                break;
            }
            case 'employee':
            case 'internee': {
                 const [totalTasks, pendingTasks, completedTasks, acceptedTasks] = await Promise.all([
                    Task.count({ where: { assigneeId: user.id } }),
                    Task.count({ where: { assigneeId: user.id, status: 'assigned' } }),
                    Task.count({ where: { assigneeId: user.id, status: 'accepted' } }),
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

// Delete a user (Admin only)
const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    await user.destroy();

    res.json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete user",
      error: error.message,
    });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUser,
  getTeamLeads,
  getInternees,
  updateUserStatus,
  updateUserRole,
  getDashboardStats,
  deleteUser,
};
