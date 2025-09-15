const express = require('express');
const { 
  getAllUsers, 
  getTeamLeads, 
  getInternees,
  updateUserStatus,
  updateUserRole,
  getDashboardStats 
} = require('../controllers/userController');
const { authenticateToken, authorizeRoles, requireAdmin, requireTeamLead } = require('../middleware/auth');

const router = express.Router();

// Protected routes
router.get('/dashboard', authenticateToken, getDashboardStats);
router.get('/team-leads', authenticateToken, authorizeRoles('admin', 'team_lead'), getTeamLeads);

router.get('/internees', authenticateToken, requireTeamLead, getInternees);
router.get('/internees/:teamLeadId', authenticateToken, requireTeamLead, getInternees);

router.get('/', authenticateToken, requireAdmin, getAllUsers);

// Admin only user management routes
router.put('/:userId/status', authenticateToken, requireAdmin, updateUserStatus);
router.put('/:userId/role', authenticateToken, requireAdmin, updateUserRole);

module.exports = router;
