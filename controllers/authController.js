const jwt = require('jsonwebtoken');
const { User } = require('../models');
const sendEmail = require('../utils/sendEmail');
const { sequelize } = require('../models');

const generateToken = (userId) => {
 return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: '7d'
  });
};

// Register new user (Admin only)
const register = async (req, res) => {
  // Start a transaction
  const t = await sequelize.transaction();

  try {
    const { firstName, lastName, email, password, phone, idCardNumber, role, teamLeadId } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !password || !phone || !idCardNumber) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: 'All required fields must be provided'
      });
    }

    // Corrected Phone Number Regex
    const phoneRegex = /^((\+92)|(0092))\d{10}$|^0\d{10}$/;
    if (!phoneRegex.test(phone)) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: 'Invalid phone number format. Use 03xxxxxxxxx, +923xxxxxxxxx, or 00923xxxxxxxxx.'
      });
    }

    // Check for existing user/email/phone/ID
    const [existingUser, existingPhone, existingIdCard] = await Promise.all([
      User.findOne({ where: { email } }),
      User.findOne({ where: { phone } }),
      User.findOne({ where: { idCardNumber } })
    ]);

    if (existingUser || existingPhone || existingIdCard) {
      await t.rollback();
      let message = '';
      if (existingUser) message = 'User with this email already exists';
      else if (existingPhone) message = 'User with this phone number already exists';
      else message = 'User with this ID card number already exists';
      return res.status(400).json({ success: false, message });
    }

    // Validate team lead assignment for internees
    if (role === 'internee' && teamLeadId) {
      const teamLead = await User.findOne({ where: { id: teamLeadId, role: 'team_lead' } });
      if (!teamLead) {
        await t.rollback();
        return res.status(400).json({ success: false, message: 'Invalid team lead assignment' });
      }
    }

    // Handle file uploads
    let profilePicture = null;
    let idCardFrontPic = null;
    let idCardBackPic = null;

    if (req.files) {
      if (req.files.profilePicture) profilePicture = `/uploads/profiles/${req.files.profilePicture[0].filename}`;
      if (req.files.idCardFrontPic) idCardFrontPic = `/uploads/documents/${req.files.idCardFrontPic[0].filename}`;
      if (req.files.idCardBackPic) idCardBackPic = `/uploads/documents/${req.files.idCardBackPic[0].filename}`;
    }

    if (!idCardFrontPic || !idCardBackPic) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: 'Both ID card front and back pictures are required'
      });
    }

    // Create user inside transaction
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
    }, { transaction: t });

    // Prepare user data
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

    // Generate token
    const token = generateToken(user.id);

    // Prepare email message
    const message = `Your login credentials are:\nEmail: ${email}\nPassword: ${password}\n\nPlease log in and change your password as soon as possible.`;

    // Send email (await here so failure can rollback)
    try {
      await sendEmail({
        email: user.email,
        subject: `Welcome to the Team, ${firstName}!`,
        message
      });
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
      await t.rollback(); // rollback user creation
      return res.status(500).json({
        success: false,
        message: 'User registration failed because email could not be sent',
        error: emailError.message
      });
    }

    // Commit transaction after successful email
    await t.commit();

    // Send success response
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: userData,
        token
      }
    });

  } catch (error) {
    await t.rollback();
    res.status(500).json({
      success: false,
      message: error.message || 'Registration failed',
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
      // Corrected Phone Number Regex
      const phoneRegex = /^((\+92)|(0092))\d{10}$|^0\d{10}$/;
      if (!phoneRegex.test(phone)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid phone number format. Use 03xxxxxxxxx, +923xxxxxxxxx, or 00923xxxxxxxxx.'
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
        updateData.profilePicture = `/uploads/profiles/${req.files.profilePicture[0].filename}`;
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

        // Update password and save user
        user.set('password', newPassword);
        await user.save();

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


// Admin change password
const adminChangePassword = async (req, res) => {
    try {
        const { userId, newPassword } = req.body;
        const requesterId = req.user.id; // ID of the user making the request

        // Validate input
        if (!userId || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'User ID and new password are required'
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'New password must be at least 6 characters long'
            });
        }

        // Get the user whose password is being changed
        const userToUpdate = await User.findByPk(userId);
        if (!userToUpdate) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Get the user who is making the request
        const requester = await User.findByPk(requesterId);
        if (!requester) {
            return res.status(404).json({
                success: false,
                message: 'Requesting user not found'
            });
        }

        // Authorization check
        if (requester.role === 'team_lead') {
            if (userToUpdate.role !== 'internee' || userToUpdate.teamLeadId !== requesterId) {
                return res.status(403).json({
                    success: false,
                    message: 'You are not authorized to change this user\'s password'
                });
            }
        } else if (requester.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to perform this action'
            });
        }

        // Set the new password and save the user
        userToUpdate.set('password', newPassword);
        await userToUpdate.save();

        res.json({
            success: true,
            message: `Password for ${userToUpdate.email} changed successfully`
        });

    } catch (error) {
        console.error('Admin change password error:', error);
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
  changePassword,
  adminChangePassword,
};