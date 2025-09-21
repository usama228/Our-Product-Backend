const express = require('express');
const { register, login, getProfile, updateProfile, changePassword, adminChangePassword } = require('../controllers/authController');
const { authenticateToken, requireAdmin, requireTeamLead } = require('../middleware/auth');
const { uploadUserFiles } = require('../middleware/upload'); // Correctly import the specific middleware

const router = express.Router();

// Public routes
router.post('/login', login);

// Admin only routes
router.post('/register', authenticateToken, requireAdmin, uploadUserFiles.fields([
  { name: 'profilePicture', maxCount: 1 },
  { name: 'idCardFrontPic', maxCount: 1 },
  { name: 'idCardBackPic', maxCount: 1 }
]), register);

// Protected routes
router.get('/profile', authenticateToken, getProfile);
router.put('/profile', authenticateToken, uploadUserFiles.fields([
  { name: 'profilePicture', maxCount: 1 },
  { name: 'idCardFrontPic', maxCount: 1 },
  { name: 'idCardBackPic', maxCount: 1 }
]), updateProfile);
router.put('/change-password', authenticateToken, changePassword);
router.put('/admin/change-password', authenticateToken, requireTeamLead, adminChangePassword);

module.exports = router;
