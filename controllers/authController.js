const jwt = require('jsonwebtoken');
const { User } = require('../models');
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: '7d'
  });
};

// Register new user (Admin only)
const register = async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone, idCardNumber, role, teamLeadId } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !password || !phone || !idCardNumber) {
      return res.status(400).json({
        success: false,
        message: 'All required fields must be provided'
      });
    }

    // Validate phone number format (basic validation)
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid phone number format'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Check if phone number already exists
    const existingPhone = await User.findOne({ where: { phone } });
    if (existingPhone) {
      return res.status(400).json({
        success: false,
        message: 'User with this phone number already exists'
      });
    }

    // Check if ID card number already exists
    const existingIdCard = await User.findOne({ where: { idCardNumber } });
    if (existingIdCard) {
      return res.status(400).json({
        success: false,
        message: 'User with this ID card number already exists'
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

    // Handle file uploads
    let profilePicture = null;
    let idCardFrontPic = null;
    let idCardBackPic = null;

    if (req.files) {
      if (req.files.profilePicture) {
        profilePicture = `/uploads/profiles/${req.files.profilePicture[0].filename}`;
      }
      if (req.files.idCardFrontPic) {
        idCardFrontPic = `/uploads/documents/${req.files.idCardFrontPic[0].filename}`;
      }
      if (req.files.idCardBackPic) {
        idCardBackPic = `/uploads/documents/${req.files.idCardBackPic[0].filename}`;
      }
    }

    // Validate required ID card pictures
    if (!idCardFrontPic || !idCardBackPic) {
      return res.status(400).json({
        success: false,
        message: 'Both ID card front and back pictures are required'
      });
    }

    // Create new user
    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      phone,
      idCardNumber,
      idCardFrontPic,
      idCardBackPic,
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
    const { firstName, lastName, phone } = req.body;
    const userId = req.user.id;

    // Validate phone number format if provided
    if (phone) {
      const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
      if (!phoneRegex.test(phone)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid phone number format'
        });
      }

      // Check if phone number already exists for another user
      const existingPhone = await User.findOne({ 
        where: { 
          phone,
          id: { [require('sequelize').Op.ne]: userId }
        } 
      });
      if (existingPhone) {
        return res.status(400).json({
          success: false,
          message: 'Phone number already exists'
        });
      }
    }

    const updateData = {};
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (phone) updateData.phone = phone;

    // Handle file uploads
    if (req.files) {
      if (req.files.profilePicture) {
        updateData.profilePicture = `/uploads/documents/${req.files.profilePicture[0].filename}`;
      }
      if (req.files.idCardFrontPic) {
        updateData.idCardFrontPic = `/uploads/documents/${req.files.idCardFrontPic[0].filename}`;
      }
      if (req.files.idCardBackPic) {
        updateData.idCardBackPic = `/uploads/documents/${req.files.idCardBackPic[0].filename}`;
      }
    }

    // If no data to update
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid fields provided for update'
      });
    }

    await User.update(updateData, {
      where: { id: userId }
    });

    const updatedUser = await User.findByPk(userId, {
      attributes: { exclude: ['password'] },
      include: [{
        model: User,
        as: 'teamLead',
        attributes: ['id', 'firstName', 'lastName', 'email'],
        required: false
      }]
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

// Change password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long'
      });
    }

    // Get user with password
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password (will be hashed by the model hook)
    await User.update(
      { password: newPassword },
      { where: { id: userId } }
    );

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to change password',
      error: error.message
    });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword
};