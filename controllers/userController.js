const { User, Task } = require("../models");

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
    const { teamLeadId } = req.params;

    let condition = { role: "internee" };
    if (teamLeadId) {
      condition.teamLeadId = teamLeadId;
    }

    const internees = await User.findAll({
      where: condition,
      attributes: ["id", "firstName", "lastName", "email"],
    });

    res.json({
      success: true,
      data: { internees },
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

// Get dashboard stats
const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.count();
    const totalInternees = await User.count({ where: { role: "internee" } });
    const totalTeamLeads = await User.count({ where: { role: "team_lead" } });
    const totalEmployees = await User.count({ where: { role: "employee" } });
    const activeUsers = await User.count({ where: { isActive: true } });

    const totalTasks = await Task.count();
    const assignedTasks = await Task.count({ where: { status: "assigned" } });
    const submittedTasks = await Task.count({ where: { status: "submitted" } });
    const acceptedTasks = await Task.count({ where: { status: "accepted" } });
    const rejectedTasks = await Task.count({ where: { status: "rejected" } });

    res.json({
      success: true,
      data: {
        stats: {
          totalUsers,
          totalInternees,
          totalTeamLeads,
          totalEmployees,
          activeUsers,
          totalTasks,
          assignedTasks,
          submittedTasks,
          acceptedTasks,
          rejectedTasks,
        },
      },
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
