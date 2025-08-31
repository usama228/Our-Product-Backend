const express = require('express');
const {
  createTask,
  getAllTasks,
  getTaskById,
  updateTaskStatus,
  submitTask,
  acceptTask,
  rejectTask,
  deleteTask
} = require('../controllers/taskController');

const { authenticateToken, requireAdmin, requireTeamLead } = require('../middleware/auth');
const { uploadTaskFile } = require('../middleware/upload');

const router = express.Router();

// Create task (admin only)
router.post('/', authenticateToken, requireAdmin, createTask);

// Get all tasks (team lead + admin)
router.get('/', authenticateToken, requireTeamLead, getAllTasks);

// Get single task by ID
router.get('/:id', authenticateToken, getTaskById);

// Update task status (team lead)
router.patch('/:id/status', authenticateToken, requireTeamLead, updateTaskStatus);

// Submit task (internee)
router.post('/:id/submit', authenticateToken, uploadTaskFile.single('submissionFile'), submitTask);

// Accept task (admin only)
router.post('/:id/accept', authenticateToken, requireAdmin, acceptTask);

// Reject task (admin only)
router.post('/:id/reject', authenticateToken, requireAdmin, rejectTask);

// Delete task (admin only)
router.delete('/:id', authenticateToken, requireAdmin, deleteTask);

module.exports = router;
