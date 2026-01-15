const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const { authenticateToken } = require('../middleware/auth');

// Check in
router.post('/checkin', authenticateToken, attendanceController.checkIn);

// Check out
router.post('/checkout', authenticateToken, attendanceController.checkOut);

// Update break time
router.patch('/break', authenticateToken, attendanceController.updateBreakTime);

// Get attendance by user
router.get('/user/:userId', authenticateToken, attendanceController.getAttendanceByUser);

// Get attendance by date
router.get('/date/:date', authenticateToken, attendanceController.getAttendanceByDate);

// Get all attendance (admin/team lead)
router.get('/', authenticateToken, attendanceController.getAllAttendance);

module.exports = router;