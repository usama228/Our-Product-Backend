const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Attendance = sequelize.define('Attendance', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  checkInTime: {
    type: DataTypes.DATE,
    allowNull: false
  },
  checkOutTime: {
    type: DataTypes.DATE,
    allowNull: true
  },
  breakTime: {
    type: DataTypes.INTEGER, // in minutes
    defaultValue: 0
  },
  workingHours: {
    type: DataTypes.VIRTUAL,
    get() {
      if (this.checkInTime && this.checkOutTime) {
        const diff = new Date(this.checkOutTime) - new Date(this.checkInTime);
        return Math.round((diff / (1000 * 60 * 60)) * 100) / 100; // hours with 2 decimal places
      }
      return null;
    }
  }
}, {
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['userId', 'date']
    }
  ]
});

Attendance.associate = (models) => {
  Attendance.belongsTo(models.User, {
    foreignKey: 'userId',
    as: 'user'
  });
};

module.exports = Attendance;