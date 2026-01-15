
const sequelize = require('../config/db');
const User = require('./userModel');
const Task = require('./taskModel');
const Attendance = require('./attendanceModel');
const Leave = require('./leaveModel');
const Notification = require('./NotificationModel')(sequelize, require('sequelize').DataTypes);

// Initialize associations
const models = {
  User,
  Task,
  Attendance,
  Leave,
  Notification
};

// Set up associations
Object.keys(models).forEach(modelName => {
  if (models[modelName] && models[modelName].associate) {
    models[modelName].associate(models);
  }
});

module.exports = {
  sequelize,
  User,
  Task,
  Attendance,
  Leave,
  Notification
};
