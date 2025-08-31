const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Task = sequelize.define(
  "Task",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [3, 200],
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    status: {
      type: DataTypes.ENUM("assigned", "submitted", "accepted", "rejected"),
      allowNull: false,
      defaultValue: "assigned",
    },
    priority: {
      type: DataTypes.ENUM("low", "medium", "high", "urgent"),
      allowNull: false,
      defaultValue: "medium",
    },
    dueDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    assignerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Users",
        key: "id",
      },
    },
    assigneeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Users",
        key: "id",
      },
    },
    submissionFile: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    submissionNotes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    submittedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    feedback: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    timestamps: true,
  }
);

// Define associations
Task.associate = (models) => {
  // Task belongs to assigner (admin/team_lead)
  Task.belongsTo(models.User, {
    as: "assigner",
    foreignKey: "assignerId",
  });

  // Task belongs to assignee (internee)
  Task.belongsTo(models.User, {
    as: "assignee",
    foreignKey: "assigneeId",
  });
};

module.exports = Task;
