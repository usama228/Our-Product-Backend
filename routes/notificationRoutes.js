
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { getNotifications, markAsRead, markAllAsRead } = require('../controllers/notificationController');

// @desc    Get all notifications for the logged-in user
// @route   GET /api/notifications
// @access  Private
router.get('/', authenticateToken, getNotifications);

// @desc    Mark a notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
router.put('/:id/read', authenticateToken, markAsRead);

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
router.put('/read-all', authenticateToken, markAllAsRead);

module.exports = router;
