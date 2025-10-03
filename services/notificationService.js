
const { Notification } = require('../models');

/**
 * Creates a notification.
 * @param {number} senderId - The ID of the user sending the notification.
 * @param {number} recipientId - The ID of the user receiving the notification.
 * @param {string} message - The notification message.
 * @param {object} transaction - The Sequelize transaction object.
 */
const createNotification = async (senderId, recipientId, message, link = null, transaction = null) => {
  try {
    await Notification.create({
      sender: senderId,
      recipient: recipientId,
      message,
      link,
    }, { transaction });
  } catch (error) {
    console.error(`Error creating notification for recipient ${recipientId}:`, error);
    throw error;
  }
};

/**
 * Creates notifications for multiple recipients.
 * @param {number} senderId - The ID of the user sending the notification.
 * @param {number[]} recipientIds - An array of recipient user IDs.
 * @param {string} message - The notification message.
 * @param {object} transaction - The Sequelize transaction object.
 */
const createBulkNotifications = async (senderId, recipientIds, message, link = null, transaction = null) => {
  try {
    const notifications = recipientIds.map(recipientId => ({
      sender: senderId,
      recipient: recipientId,
      message,
      link,
    }));
    await Notification.bulkCreate(notifications, { transaction });
  } catch (error) {
    console.error('Error creating bulk notifications:', error);
    throw error;
  }
};

module.exports = {
  createNotification,
  createBulkNotifications,
};
