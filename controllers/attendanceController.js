const { Attendance, User } = require('../models');
const { Op } = require('sequelize');

// Check In
exports.checkIn = async (req, res) => {
  try {
    const { userId } = req.body;
    const today = new Date().toISOString().split('T')[0];

    // Check if user already checked in today
    const existingAttendance = await Attendance.findOne({
      where: { userId, date: today }
    });

    if (existingAttendance) {
      return res.status(400).json({
        success: false,
        message: 'You have already checked in today'
      });
    }

    const attendance = await Attendance.create({
      userId,
      date: today,
      checkInTime: new Date()
    });

    res.status(201).json({
      success: true,
      message: 'Checked in successfully',
      data: attendance
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error checking in',
      error: error.message
    });
  }
};

// Check Out
exports.checkOut = async (req, res) => {
  try {
    const { userId } = req.body;
    const today = new Date().toISOString().split('T')[0];

    const attendance = await Attendance.findOne({
      where: { userId, date: today }
    });

    if (!attendance) {
      return res.status(400).json({
        success: false,
        message: 'No check-in record found for today'
      });
    }

    if (attendance.checkOutTime) {
      return res.status(400).json({
        success: false,
        message: 'You have already checked out today'
      });
    }

    attendance.checkOutTime = new Date();
    await attendance.save();

    res.json({
      success: true,
      message: 'Checked out successfully',
      data: attendance
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error checking out',
      error: error.message
    });
  }
};

// Get attendance by user
exports.getAttendanceByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { startDate, endDate } = req.query;

    const whereClause = { userId };
    
    if (startDate && endDate) {
      whereClause.date = {
        [Op.between]: [startDate, endDate]
      };
    }

    const attendance = await Attendance.findAll({
      where: whereClause,
      include: [{
        model: User,
        as: 'user',
        attributes: ['firstName', 'lastName', 'email']
      }],
      order: [['date', 'DESC']]
    });

    res.json({
      success: true,
      data: attendance
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching attendance',
      error: error.message
    });
  }
};

// Get attendance by date
exports.getAttendanceByDate = async (req, res) => {
  try {
    const { date } = req.params;

    const attendance = await Attendance.findAll({
      where: { date },
      include: [{
        model: User,
        as: 'user',
        attributes: ['firstName', 'lastName', 'email']
      }],
      order: [['checkInTime', 'ASC']]
    });

    res.json({
      success: true,
      data: attendance
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching attendance',
      error: error.message
    });
  }
};

// Update break time
exports.updateBreakTime = async (req, res) => {
  try {
    const { userId, breakTime } = req.body;
    const today = new Date().toISOString().split('T')[0];

    const attendance = await Attendance.findOne({
      where: { userId, date: today }
    });

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: 'No attendance record found for today'
      });
    }

    attendance.breakTime = breakTime;
    await attendance.save();

    res.json({
      success: true,
      message: 'Break time updated successfully',
      data: attendance
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating break time',
      error: error.message
    });
  }
};

// Get all attendance (admin/team lead)
exports.getAllAttendance = async (req, res) => {
  try {
    const { startDate, endDate, userId } = req.query;
    const whereClause = {};

    if (startDate && endDate) {
      whereClause.date = {
        [Op.between]: [startDate, endDate]
      };
    }

    if (userId) {
      whereClause.userId = userId;
    }

    const attendance = await Attendance.findAll({
      where: whereClause,
      include: [{
        model: User,
        as: 'user',
        attributes: ['firstName', 'lastName', 'email', 'role']
      }],
      order: [['date', 'DESC'], ['checkInTime', 'ASC']]
    });

    res.json({
      success: true,
      data: attendance
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching attendance',
      error: error.message
    });
  }
};