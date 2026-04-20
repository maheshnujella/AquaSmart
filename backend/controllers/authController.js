const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret123', {
    expiresIn: '30d',
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { name, email, phone, password, role, shopName, vehicleType, vehicleNumber } = req.body;

    // Validation: Require either email or phone
    if (!email && !phone) {
      return res.status(400).json({ message: 'Please provide either an email or phone number' });
    }

    // Check if user already exists by email OR phone (check both)
    const orQuery = [];
    if (email) orQuery.push({ email });
    if (phone) orQuery.push({ phone });

    const userExists = await User.findOne({ $or: orQuery });
    if (userExists) {
      if (email && userExists.email === email) {
        return res.status(400).json({ message: 'An account with this email already exists. Please login.' });
      }
      if (phone && userExists.phone === phone) {
        return res.status(400).json({ message: 'An account with this phone number already exists. Please login.' });
      }
      return res.status(400).json({ message: 'User already exists. Please login.' });
    }

    // Create user
    const user = await User.create({
      name,
      email: email || undefined,
      phone: phone || undefined,
      password,
      role: role || 'Customer',
      shopName,
      vehicleType,
      vehicleNumber
    });

    if (user) {
      const token = generateToken(user._id);
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
      });
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        token: token,
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error('Register error:', error.message);

    // Handle MongoDB duplicate key error
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue || {})[0];
      const fieldName = field === 'email' ? 'email' : field === 'phone' ? 'phone number' : field;
      return res.status(400).json({ message: `An account with this ${fieldName} already exists. Please login.` });
    }

    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ message: messages.join(', ') });
    }

    res.status(500).json({ message: 'Server error. Please try again.' });
  }
};


// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { login, password } = req.body; // 'login' can be email or phone

    if (!login || !password) {
      return res.status(400).json({ message: 'Please provide login and password' });
    }

    // Search by email OR phone
    const user = await User.findOne({
      $or: [{ email: login }, { phone: login }]
    }).select('+password');

    if (user && (await user.matchPassword(password))) {
      const token = generateToken(user._id);
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
      });
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        token: token,
      });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Public
const logoutUser = (req, res) => {
  res.cookie('token', '', {
    httpOnly: true,
    expires: new Date(0)
  });
  res.status(200).json({ message: 'Logged out successfully' });
};

// @desc    Forgot password - generate reset token
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
  try {
    const { login } = req.body; // email or phone
    if (!login) {
      return res.status(400).json({ message: 'Please provide your email or phone number' });
    }

    const user = await User.findOne({
      $or: [{ email: login }, { phone: login }]
    });

    if (!user) {
      return res.status(404).json({ message: 'No account found with that email or phone number' });
    }

    // Generate a random reset token
    const resetToken = crypto.randomBytes(32).toString('hex');

    // Hash it before storing in DB
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 minutes

    await user.save({ validateBeforeSave: false });

    // Build reset URL (frontend route)
    const resetUrl = `/reset-password/${resetToken}`;

    console.log(`🔑 Password reset token for ${user.email || user.phone}: ${resetToken}`);

    res.json({
      message: 'Password reset link generated successfully',
      resetToken,        // Return token so frontend can build the link
      resetUrl,          // Relative URL for frontend
      expiresIn: '15 minutes'
    });
  } catch (error) {
    console.error('Forgot password error:', error.message);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
};

// @desc    Reset password using token
// @route   POST /api/auth/reset-password/:token
// @access  Public
const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ message: 'Please provide a new password' });
    }

    // Hash the incoming token and compare with stored hash
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() } // Not expired
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset link. Please request a new one.' });
    }

    // Set new password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    // Auto-login after reset
    const authToken = generateToken(user._id);
    res.cookie('token', authToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000
    });

    res.json({
      message: 'Password reset successful! You are now logged in.',
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      token: authToken,
    });
  } catch (error) {
    console.error('Reset password error:', error.message);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
};

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  getUserProfile,
  forgotPassword,
  resetPassword,
};
