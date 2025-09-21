const express = require('express');
const router = express.Router();
const {
    getAllUsers,
    getUserById,
    updateUser,
    getTeamLeads,
    getInternees,
    updateUserStatus,
    updateUserRole,
    getDashboardStats,
    deleteUser
} = require('../controllers/userController');
const { register } = require('../controllers/authController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { uploadUserFiles } = require('../middleware/upload');

// All routes in this file are protected and require authentication
router.use(authenticateToken);

// Create a new user (Admin only)
router.post(
    '/',
    authorizeRoles('admin'),
    uploadUserFiles.fields([
        { name: 'profilePicture', maxCount: 1 },
        { name: 'idCardFrontPic', maxCount: 1 },
        { name: 'idCardBackPic', maxCount: 1 }
    ]),
    register
);

// Dashboard stats route (accessible to all authenticated users)
router.get('/dashboard', getDashboardStats);

// Team lead routes (accessible to Admin for assignment)
router.get('/team-leads', authorizeRoles('admin'), getTeamLeads);

// User management routes (accessible to Admin and Team Lead)
router.get('/', authorizeRoles('admin', 'team_lead'), getAllUsers);

// Internee routes (accessible to Admin and Team Lead)
router.get('/internees', authorizeRoles('admin', 'team_lead'), getInternees);
router.get('/internees/:teamLeadId', authorizeRoles('admin', 'team_lead'), getInternees);

// Get a single user by ID
router.get('/:userId', getUserById);

// Update a user's profile
router.put(
    '/:userId',
    uploadUserFiles.fields([
        { name: 'profilePicture', maxCount: 1 },
        { name: 'idCardFrontPic', maxCount: 1 },
        { name: 'idCardBackPic', maxCount: 1 }
    ]),
    updateUser
);

// Admin-only routes for user status and role updates
router.put('/:userId/status', authorizeRoles('admin'), updateUserStatus);
router.put('/:userId/role', authorizeRoles('admin'), updateUserRole);

// Admin-only route for deleting a user
router.delete('/:userId', authorizeRoles('admin'), deleteUser);

module.exports = router;
