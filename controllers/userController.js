const { User, Task } = require('../models');

// Get all users (Admin only)
const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'firstName', 'lastName', 'email', 'role', 'teamLeadId', 'isActive', 'createdAt'],
      include: [
        {
          model: Task,
          as: 'assignedTasks',
          attributes: ['id', 'title', 'status', 'priority', 'dueDate'],
          required: false
        },
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
      data: {
        users,
        pagination: {
          total: users.length,
          page: 1,
          limit: users.length,
          totalPages: 1
        }
      }
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      error: error.message
    });
  }
};

// Get team leads (for assignment dropdown)
const getTeamLeads = async (req, res) => {
  try {
    const teamLeads = await User.findAll({
      where: { role: 'team_lead' },
      attributes: ['id', 'firstName', 'lastName', 'email']
    });

    res.json({
      success: true,
      data: { teamLeads }
    });
  } catch (error) {
    console.error('Get team leads error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch team leads',
      error: error.message
    });
  }
};

// Get internees under a team lead
const getInternees = async (req, res) => {
  try {
    const { teamLeadId } = req.params;

    let condition = { role: 'internee' };
    if (teamLeadId) {
      condition.teamLeadId = teamLeadId;
    }

    const internees = await User.findAll({
      where: condition,
      attributes: ['id', 'firstName', 'lastName', 'email']
    });

    res.json({
      success: true,
      data: { internees }
    });
  } catch (error) {
    console.error('Get internees error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch internees',
      error: error.message
    });
  }
};

// Get dashboard stats
const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.count();
    const totalInternees = await User.count({ where: { role: 'internee' } });
    const totalTeamLeads = await User.count({ where: { role: 'team_lead' } });

    const totalTasks = await Task.count();
    const assignedTasks = await Task.count({ where: { status: 'assigned' } });
    const submittedTasks = await Task.count({ where: { status: 'submitted' } });
    const acceptedTasks = await Task.count({ where: { status: 'accepted' } });
    const rejectedTasks = await Task.count({ where: { status: 'rejected' } });

    res.json({
      success: true,
      data: { 
        stats: {
          totalUsers,
          totalInternees,
          totalTeamLeads,
          totalTasks,
          assignedTasks,
          submittedTasks,
          acceptedTasks,
          rejectedTasks
        }
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard stats',
      error: error.message
    });
  }
};

module.exports = {
  getAllUsers,
  getTeamLeads,
  getInternees,
  getDashboardStats
};
