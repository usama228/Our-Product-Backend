const express = require('express');
const { register, login, getProfile, updateProfile, changePassword } = require('../controllers/authController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { uploadProfile, uploadDocuments } = require('../middleware/upload');

const router = express.Router();

// Public routes
router.post('/login', login);

// Admin only routes
router.post('/register', authenticateToken, requireAdmin, uploadDocuments.fields([
  { name: 'profilePicture', maxCount: 1 },
  { name: 'idCardFrontPic', maxCount: 1 },
  { name: 'idCardBackPic', maxCount: 1 }
]), register);

// Protected routes
router.get('/profile', authenticateToken, getProfile);
router.put('/profile', authenticateToken, uploadDocuments.fields([
  { name: 'profilePicture', maxCount: 1 },
  { name: 'idCardFrontPic', maxCount: 1 },
  { name: 'idCardBackPic', maxCount: 1 }
]), updateProfile);
router.put('/change-password', authenticateToken, changePassword);

module.exports = router;