const express = require('express');
const { 
  getAllUsers, 
  getTeamLeads, 
  getInternees, 
  getDashboardStats 
} = require('../controllers/userController');
const { authenticateToken, requireAdmin, requireTeamLead } = require('../middleware/auth');

const router = express.Router();

// Protected routes
router.get('/dashboard-stats', authenticateToken, getDashboardStats);
router.get('/team-leads', authenticateToken, getTeamLeads);

router.get('/internees', authenticateToken, requireTeamLead, getInternees);
router.get('/internees/:teamLeadId', authenticateToken, requireTeamLead, getInternees);

router.get('/', authenticateToken, requireAdmin, getAllUsers);

module.exports = router;
