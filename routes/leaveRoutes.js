const express = require('express');
const router = express.Router();
const leaveController = require('../controllers/leaveController');
const { authenticateToken } = require('../middleware/auth');

// Create leave request
router.post('/', authenticateToken, leaveController.createLeave);

// Get leaves by user
router.get('/user/:userId', authenticateToken, leaveController.getLeavesByUser);

// Get all leaves (admin/team lead)
router.get('/', authenticateToken, leaveController.getAllLeaves);

// Update leave status
router.patch('/:leaveId/status', authenticateToken, leaveController.updateLeaveStatus);

// Delete leave request
router.delete('/:leaveId', authenticateToken, leaveController.deleteLeave);

module.exports = router;