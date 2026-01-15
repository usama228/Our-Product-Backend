const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const bcrypt = require('bcrypt');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [2, 50]
    }
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [2, 50]
    }
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [6, 100]
    }
  },
  role: {
    type: DataTypes.ENUM('admin', 'team_lead', 'employee', 'internee'),
    allowNull: false,
    defaultValue: 'internee'
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [10, 15]
    }
  },
  idCardNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true,
      len: [5, 20]
    }
  },
  idCardFrontPic: {
    type: DataTypes.STRING,
    allowNull: false
  },
  idCardBackPic: {
    type: DataTypes.STRING,
    allowNull: false
  },
  profilePicture: {
    type: DataTypes.STRING,
    allowNull: true
  },
  coverPhoto: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  teamLeadId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  timestamps: true,
  hooks: {
    beforeSave: async (user) => {
        user.password = await bcrypt.hash(user.password, 12);
    }
  }
});

// Instance method to check password
User.prototype.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Define associations
User.associate = (models) => {
  // Team Lead has many internees
  User.hasMany(models.User, {
    as: 'internees',
    foreignKey: 'teamLeadId'
  });
  
  // Internee belongs to Team Lead
  User.belongsTo(models.User, {
    as: 'teamLead',
    foreignKey: 'teamLeadId'
  });
  
  // User has many tasks (as assignee)
  User.hasMany(models.Task, {
    as: 'assignedTasks',
    foreignKey: 'assigneeId'
  });
  
  // User has many tasks (as assigner)
  User.hasMany(models.Task, {
    as: 'createdTasks',
    foreignKey: 'assignerId'
  });
  
  // User has many attendance records
  User.hasMany(models.Attendance, {
    as: 'attendanceRecords',
    foreignKey: 'userId'
  });
  
  // User has many leave requests
  User.hasMany(models.Leave, {
    as: 'leaveRequests',
    foreignKey: 'userId'
  });
  
  // User has many approved leaves (as approver)
  User.hasMany(models.Leave, {
    as: 'approvedLeaves',
    foreignKey: 'approvedBy'
  });
};

module.exports = User;