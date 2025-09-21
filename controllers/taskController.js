const { Task, User } = require('../models');
const { Op } = require('sequelize');

// Get tasks assigned to the currently logged-in user
const getMyTasks = async (req, res) => {
  try {
    const assigneeId = req.user.id;
    const { page = 1, limit = 10, search = '', status = '', priority = '' } = req.query;

    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const searchLimit = parseInt(limit, 10);

    const whereClause = { assigneeId };

    if (status) {
      whereClause.status = status;
    }
    if (priority) {
      whereClause.priority = priority;
    }
    if (search) {
      whereClause.title = { [Op.iLike]: `%${search}%` };
    }

    const { count, rows: tasks } = await Task.findAndCountAll({
      where: whereClause,
      include: [
        { model: User, as: 'assigner', attributes: ['id', 'firstName', 'lastName'] },
        { model: User, as: 'assignee', attributes: ['id', 'firstName', 'lastName'] },
      ],
      order: [['createdAt', 'DESC']],
      limit: searchLimit,
      offset: offset,
    });

    const totalPages = Math.ceil(count / searchLimit);

    res.json({
      success: true,
      data: {
        tasks,
        pagination: {
          total: count,
          page: parseInt(page, 10),
          limit: searchLimit,
          totalPages,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch tasks', error: error.message });
  }
};

const createTask = async (req, res) => {
  try {
    const { title, description, assigneeId, dueDate, priority } = req.body;
    const assignerId = req.user.id;
    const task = await Task.create({
      title,
      description,
      assigneeId,
      assignerId,
      dueDate,
      priority: priority || 'medium',
      status: 'assigned',
    });
    res.status(201).json({ success: true, message: 'Task created successfully', data: task });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create task', error: error.message });
  }
};

const getAllTasks = async (req, res) => {
    try {
        const { user } = req;
        const { page = 1, limit = 10, search = '', status = '', priority = '' } = req.query;

        const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);
        const searchLimit = parseInt(limit, 10);

        let whereClause = {};
        const andConditions = [];

        if (status) andConditions.push({ status: status });
        if (priority) andConditions.push({ priority: priority });
        if (search) andConditions.push({ title: { [Op.iLike]: `%${search}%` } });

        if (user.role === 'team_lead') {
            const myInterns = await User.findAll({
                where: { teamLeadId: user.id, role: 'internee' },
                attributes: ['id'],
            });
            const internIds = myInterns.map(intern => intern.id);
            
            const orConditions = [
                { assignerId: user.id },
                { assigneeId: user.id },
            ];
            if (internIds.length > 0) {
                orConditions.push({ assigneeId: { [Op.in]: internIds } });
            }
            andConditions.push({ [Op.or]: orConditions });

        } else if (user.role === 'internee' || user.role === 'employee') {
            andConditions.push({ assigneeId: user.id });
        }

        if (andConditions.length > 0) {
            whereClause = { [Op.and]: andConditions };
        }

        const { count, rows: tasks } = await Task.findAndCountAll({
            where: whereClause,
            include: [
                { model: User, as: 'assigner', attributes: ['id', 'firstName', 'lastName'] },
                { model: User, as: 'assignee', attributes: ['id', 'firstName', 'lastName'] },
            ],
            order: [['createdAt', 'DESC']],
            limit: searchLimit,
            offset: offset,
        });

        const totalPages = Math.ceil(count / searchLimit);

        res.json({
            success: true,
            data: {
                tasks,
                pagination: {
                    total: count,
                    page: parseInt(page, 10),
                    limit: searchLimit,
                    totalPages,
                },
            },
        });
    } catch (error) {
        console.error("Error in getAllTasks:", error);
        res.status(500).json({ success: false, message: 'Failed to fetch tasks', error: error.message });
    }
};

const getTaskById = async (req, res) => {
  try {
    const { id } = req.params;
    const { id: userId, role } = req.user;

    const task = await Task.findByPk(id, {
      include: [
        { model: User, as: 'assigner', attributes: ['id', 'firstName', 'lastName'] },
        { model: User, as: 'assignee', attributes: ['id', 'firstName', 'lastName', 'role', 'teamLeadId'] },
      ],
    });

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    let canView = false;
    if (role === 'admin') {
      canView = true;
    } else if (role === 'team_lead') {
      const isAssigner = String(task.assignerId) === String(userId);
      const isAssignee = String(task.assigneeId) === String(userId); 
      const isInternsTask = task.assignee &&
                            task.assignee.role === 'internee' &&
                            String(task.assignee.teamLeadId) === String(userId);
      if (isAssigner || isInternsTask || isAssignee) { 
        canView = true;
      }
    } else { 
      if (String(task.assigneeId) === String(userId)) {
        canView = true;
      }
    }

    if (canView) {
      res.json({ success: true, data: task });
    } else {
      res.status(403).json({ success: false, message: 'Access Denied to page' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch task', error: error.message });
  }
};

const updateTaskStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const task = await Task.findByPk(id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }
    task.status = status;
    await task.save();
    res.json({ success: true, message: 'Task status updated successfully', data: task });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update task status', error: error.message });
  }
};

const submitTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { submissionNotes } = req.body;
    const submissionFile = req.file ? req.file.filename : null;
    const task = await Task.findByPk(id);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }
    if (String(task.assigneeId) !== String(req.user.id)) {
      return res.status(403).json({ success: false, message: 'You can only submit your own tasks' });
    }

    task.status = 'submitted';
    task.submissionNotes = submissionNotes;
    task.submissionFile = submissionFile;
    task.submittedAt = new Date();
    await task.save();
    res.json({ success: true, message: 'Task submitted successfully', data: task });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to submit task', error: error.message });
  }
};

const acceptTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { feedback } = req.body;
    const task = await Task.findByPk(id);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }
    if (task.status !== 'submitted') {
      return res.status(400).json({ success: false, message: 'Task must be in a submitted state to be accepted' });
    }

    task.status = 'accepted';
    task.feedback = feedback || null;
    await task.save();
    res.json({ success: true, message: 'Task accepted successfully', data: task });
  } catch (error) {
    console.error('Error accepting task:', error);
    res.status(500).json({ success: false, message: 'Failed to reject task', error: error.message });
  }
};

const rejectTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { feedback } = req.body;
    const task = await Task.findByPk(id);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }
    if (task.status !== 'submitted') {
      return res.status(400).json({ success: false, message: 'Task must be in a submitted state to be rejected' });
    }

    task.status = 'rejected';
    task.feedback = feedback || null;
    await task.save();
    res.json({ success: true, message: 'Task rejected successfully', data: task });
  } catch (error) {
    console.error('Error rejecting task:', error);
    res.status(500).json({ success: false, message: 'Failed to reject task', error: error.message });
  }
};

const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const task = await Task.findByPk(id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }
    await task.destroy();
    res.json({ success: true, message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete task', error: a.message });
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
  deleteTask,
  getMyTasks,
};