const sequelize = require('../config/db');
const User = require('./userModel');
const Task = require('./taskModel');

// Initialize associations
const models = {
  User,
  Task
};

// Set up associations
Object.keys(models).forEach(modelName => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

module.exports = {
  sequelize,
  User,
  Task
};