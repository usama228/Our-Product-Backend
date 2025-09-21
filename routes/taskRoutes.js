const express = require('express');
const {
  createTask,
  getAllTasks,
  getMyTasks,
  getTaskById,
  updateTaskStatus,
  submitTask,
  acceptTask,
  rejectTask,
  deleteTask
} = require('../controllers/taskController');

const {
  authenticateToken,
  authorizeRoles,
  requireAdmin,
} = require('../middleware/auth');

// Correctly import the specific middleware for task submissions
const { uploadTaskSubmission } = require('../middleware/upload'); 

const router = express.Router();

// Create task (team lead or admin)
router.post('/', authenticateToken, authorizeRoles('admin', 'team_lead'), createTask);

// Get all tasks (all authenticated users)
router.get('/', authenticateToken, getAllTasks);

// Get tasks for the logged-in user
router.get('/my-tasks', authenticateToken, getMyTasks);

// Get single task by ID (all authenticated users)
router.get('/:id', authenticateToken, getTaskById);

// Update task status (team lead or admin)
router.patch('/:id/status', authenticateToken, authorizeRoles('admin', 'team_lead'), updateTaskStatus);

// Submit task (employee or internee) - USES THE CORRECT MIDDLEWARE
router.post('/:id/submit', authenticateToken, authorizeRoles('employee', 'internee'), uploadTaskSubmission.single('submissionFile'), submitTask);

// Accept task (team lead or admin)
router.post('/:id/accept', authenticateToken, authorizeRoles('admin', 'team_lead'), acceptTask);

// Reject task (team lead or admin)
router.post('/:id/reject', authenticateToken, authorizeRoles('admin', 'team_lead'), rejectTask);

// Delete task (admin only)
router.delete('/:id', authenticateToken, requireAdmin, deleteTask);

module.exports = router;
