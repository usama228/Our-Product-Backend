const jwt = require('jsonwebtoken');
const { User } = require('../models');
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: '7d'
  });
};

// Register new user
const register = async (req, res) => {
  try {
    const { firstName, lastName, email, password, role, teamLeadId } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Validate team lead assignment for internees
    if (role === 'internee' && teamLeadId) {
      const teamLead = await User.findOne({
        where: { id: teamLeadId, role: 'team_lead' }
      });
      if (!teamLead) {
        return res.status(400).json({
          success: false,
          message: 'Invalid team lead assignment'
        });
      }
    }

    // Handle profile picture upload
    let profilePicture = null;
    if (req.file) {
      profilePicture = `/uploads/profiles/${req.file.filename}`;
    }

    // Create new user
    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      role: role || 'internee',
      teamLeadId: role === 'internee' ? teamLeadId : null,
      profilePicture
    });

    // Generate token
    const token = generateToken(user.id);

    // Return user data without password
    const userData = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      profilePicture: user.profilePicture,
      teamLeadId: user.teamLeadId,
      isActive: user.isActive
    };

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: userData,
        token
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message
    });
  }
};

// Login user
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ 
      where: { email, isActive: true },
      include: [{
        model: User,
        as: 'teamLead',
        attributes: ['id', 'firstName', 'lastName', 'email']
      }]
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate token
    const token = generateToken(user.id);

    // Return user data without password
    const userData = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      profilePicture: user.profilePicture,
      teamLeadId: user.teamLeadId,
      teamLead: user.teamLead,
      isActive: user.isActive
    };

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: userData,
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
};

// Get current user profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] },
      include: [{
        model: User,
        as: 'teamLead',
        attributes: ['id', 'firstName', 'lastName', 'email']
      }]
    });

    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile',
      error: error.message
    });
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  try {
    const { firstName, lastName } = req.body;
    const userId = req.user.id;

    const updateData = {};
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;

    // Handle profile picture upload
    if (req.file) {
      updateData.profilePicture = `/uploads/profiles/${req.file.filename}`;
    }

    await User.update(updateData, {
      where: { id: userId }
    });

    const updatedUser = await User.findByPk(userId, {
      attributes: { exclude: ['password'] }
    });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { user: updatedUser }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message
    });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile
};