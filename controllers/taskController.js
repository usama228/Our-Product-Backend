const { Task, User } = require('../models');

const createTask = async (req, res) => {
  try {
    const { title, description, assigneeId, dueDate, priority } = req.body;
    const assignerId = req.user.id; // Get from authenticated user
    
    const task = await Task.create({ 
      title, 
      description, 
      assigneeId, 
      assignerId,
      dueDate, 
      priority: priority || 'medium',
      status: 'assigned' 
    });
    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: { task }
    });
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create task',
      error: error.message
    });
  }
};


const getAllTasks = async (req, res) => {
  try {
    const tasks = await Task.findAll({
      include: [
        {
          model: User,
          as: 'assigner',
          attributes: ['id', 'firstName', 'lastName']
        },
        {
          model: User,
          as: 'assignee',
          attributes: ['id', 'firstName', 'lastName']
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    res.json({
      success: true,
      data: { tasks }
    });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tasks',
      error: error.message
    });
  }
};


const getTaskById = async (req, res) => {
  try {
    const { id } = req.params;
    const task = await Task.findByPk(id, {
      include: [
        {
          model: User,
          as: 'assigner',
          attributes: ['id', 'firstName', 'lastName']
        },
        {
          model: User,
          as: 'assignee',
          attributes: ['id', 'firstName', 'lastName']
        }
      ]
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    res.json({
      success: true,
      data: { task }
    });
  } catch (error) {
    console.error('Error fetching task:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch task',
      error: error.message
    });
  }
};


const updateTaskStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const task = await Task.findByPk(id);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    task.status = status;
    await task.save();

    res.json({
      success: true,
      message: 'Task status updated successfully',
      data: { task }
    });
  } catch (error) {
    console.error('Error updating task status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update task status',
      error: error.message
    });
  }
};

// Submit task (internee action)
const submitTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { submissionNotes } = req.body;
    const submissionFile = req.file ? req.file.filename : null;

    const task = await Task.findByPk(id);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    if (task.assigneeId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only submit your own tasks'
      });
    }

    task.status = 'submitted';
    task.submissionNotes = submissionNotes;
    task.submissionFile = submissionFile;
    task.submittedAt = new Date();
    await task.save();

    res.json({
      success: true,
      message: 'Task submitted successfully',
      data: { task }
    });
  } catch (error) {
    console.error('Error submitting task:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit task',
      error: error.message
    });
  }
};

// Accept task (admin action)
const acceptTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { feedback } = req.body;

    const task = await Task.findByPk(id);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    if (task.status !== 'submitted') {
      return res.status(400).json({
        success: false,
        message: 'Task must be submitted before it can be accepted'
      });
    }

    task.status = 'accepted';
    task.feedback = feedback;
    await task.save();

    res.json({
      success: true,
      message: 'Task accepted successfully',
      data: { task }
    });
  } catch (error) {
    console.error('Error accepting task:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to accept task',
      error: error.message
    });
  }
};

// Reject task (admin action)
const rejectTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { feedback } = req.body;

    const task = await Task.findByPk(id);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    if (task.status !== 'submitted') {
      return res.status(400).json({
        success: false,
        message: 'Task must be submitted before it can be rejected'
      });
    }

    task.status = 'rejected';
    task.feedback = feedback;
    await task.save();

    res.json({
      success: true,
      message: 'Task rejected successfully',
      data: { task }
    });
  } catch (error) {
    console.error('Error rejecting task:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject task',
      error: error.message
    });
  }
};

// Delete task
const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const task = await Task.findByPk(id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    await task.destroy();
    res.json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete task',
      error: error.message
    });
  }
};

module.exports = {
  createTask,
  getAllTasks,
  getTaskById,
  updateTaskStatus,
  submitTask,
  acceptTask,
  rejectTask,
  deleteTask
};
