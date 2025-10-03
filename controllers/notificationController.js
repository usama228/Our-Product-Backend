
const { Notification, User } = require('../models');

// @desc    Get all notifications for the logged-in user
// @route   GET /api/notifications
// @access  Private
const getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.findAll({
            where: { recipient: req.user.id },
            order: [['createdAt', 'DESC']],
            include: [{ model: User, as: 'senderUser', attributes: ['firstName', 'lastName'] }]
        });
        const unreadCount = notifications.filter(n => !n.isRead).length;
        res.json({ success: true, data: { notifications, unreadCount } });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch notifications', error: error.message });
    }
};

// @desc    Mark a notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
const markAsRead = async (req, res) => {
    try {
        const notification = await Notification.findOne({ where: { id: req.params.id, recipient: req.user.id } });
        if (!notification) {
            return res.status(404).json({ success: false, message: 'Notification not found' });
        }
        notification.isRead = true;
        await notification.save();
        res.json({ success: true, message: 'Notification marked as read', data: notification });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to mark notification as read', error: error.message });
    }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
const markAllAsRead = async (req, res) => {
    try {
        await Notification.update({ isRead: true }, { where: { recipient: req.user.id } });
        res.json({ success: true, message: 'All notifications marked as read' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to mark all notifications as read', error: error.message });
    }
};

module.exports = {
    getNotifications,
    markAsRead,
    markAllAsRead,
};
