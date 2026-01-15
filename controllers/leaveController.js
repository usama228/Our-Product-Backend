const { Leave, User } = require('../models');
const { Op } = require('sequelize');

// Create leave request
exports.createLeave = async (req, res) => {
  try {
    const { userId, leaveType, startDate, endDate, reason } = req.body;

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (start < today) {
      return res.status(400).json({
        success: false,
        message: 'Start date cannot be in the past'
      });
    }

    if (end < start) {
      return res.status(400).json({
        success: false,
        message: 'End date cannot be before start date'
      });
    }

    // Check for overlapping leaves
    const overlappingLeave = await Leave.findOne({
      where: {
        userId,
        status: { [Op.in]: ['pending', 'approved'] },
        [Op.or]: [
          {
            startDate: { [Op.between]: [startDate, endDate] }
          },
          {
            endDate: { [Op.between]: [startDate, endDate] }
          },
          {
            [Op.and]: [
              { startDate: { [Op.lte]: startDate } },
              { endDate: { [Op.gte]: endDate } }
            ]
          }
        ]
      }
    });

    if (overlappingLeave) {
      return res.status(400).json({
        success: false,
        message: 'You already have a leave request for this period'
      });
    }

    const leave = await Leave.create({
      userId,
      leaveType,
      startDate,
      endDate,
      reason
    });

    const leaveWithUser = await Leave.findByPk(leave.id, {
      include: [{
        model: User,
        as: 'user',
        attributes: ['firstName', 'lastName', 'email']
      }]
    });

    res.status(201).json({
      success: true,
      message: 'Leave request submitted successfully',
      data: leaveWithUser
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating leave request',
      error: error.message
    });
  }
};

// Get leaves by user
exports.getLeavesByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const leaves = await Leave.findAll({
      where: { userId },
      include: [{
        model: User,
        as: 'user',
        attributes: ['firstName', 'lastName', 'email']
      }, {
        model: User,
        as: 'approver',
        attributes: ['firstName', 'lastName', 'email']
      }],
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: leaves
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching leaves',
      error: error.message
    });
  }
};

// Get all leaves (admin/team lead)
exports.getAllLeaves = async (req, res) => {
  try {
    const { status, userId, startDate, endDate } = req.query;
    const whereClause = {};

    if (status) {
      whereClause.status = status;
    }

    if (userId) {
      whereClause.userId = userId;
    }

    if (startDate && endDate) {
      whereClause[Op.or] = [
        {
          startDate: { [Op.between]: [startDate, endDate] }
        },
        {
          endDate: { [Op.between]: [startDate, endDate] }
        }
      ];
    }

    const leaves = await Leave.findAll({
      where: whereClause,
      include: [{
        model: User,
        as: 'user',
        attributes: ['firstName', 'lastName', 'email', 'role']
      }, {
        model: User,
        as: 'approver',
        attributes: ['firstName', 'lastName', 'email']
      }],
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: leaves
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching leaves',
      error: error.message
    });
  }
};

// Update leave status
exports.updateLeaveStatus = async (req, res) => {
  try {
    const { leaveId } = req.params;
    const { status, rejectionReason } = req.body;
    const approverId = req.user.id; // From auth middleware

    const leave = await Leave.findByPk(leaveId);

    if (!leave) {
      return res.status(404).json({
        success: false,
        message: 'Leave request not found'
      });
    }

    if (leave.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Leave request has already been processed'
      });
    }

    leave.status = status;
    leave.approvedBy = approverId;
    leave.approvedAt = new Date();

    if (status === 'rejected' && rejectionReason) {
      leave.rejectionReason = rejectionReason;
    }

    await leave.save();

    const updatedLeave = await Leave.findByPk(leaveId, {
      include: [{
        model: User,
        as: 'user',
        attributes: ['firstName', 'lastName', 'email']
      }, {
        model: User,
        as: 'approver',
        attributes: ['firstName', 'lastName', 'email']
      }]
    });

    res.json({
      success: true,
      message: `Leave request ${status} successfully`,
      data: updatedLeave
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating leave status',
      error: error.message
    });
  }
};

// Delete leave request
exports.deleteLeave = async (req, res) => {
  try {
    const { leaveId } = req.params;
    const userId = req.user.id; // From auth middleware

    const leave = await Leave.findByPk(leaveId);

    if (!leave) {
      return res.status(404).json({
        success: false,
        message: 'Leave request not found'
      });
    }

    // Only allow deletion by the user who created it and only if pending
    if (leave.userId !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own leave requests'
      });
    }

    if (leave.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete processed leave requests'
      });
    }

    await leave.destroy();

    res.json({
      success: true,
      message: 'Leave request deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting leave request',
      error: error.message
    });
  }
};