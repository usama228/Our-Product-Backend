const express = require('express');
const { register, login, getProfile, updateProfile } = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');
const { uploadProfile } = require('../middleware/upload');

const router = express.Router();

// Public routes
router.post('/register', uploadProfile.single('profilePicture'), register);
router.post('/login', login);

// Protected routes
router.get('/profile', authenticateToken, getProfile);
router.put('/profile', authenticateToken, uploadProfile.single('profilePicture'), updateProfile);

module.exports = router;