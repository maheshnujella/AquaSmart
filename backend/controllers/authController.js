const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// ─── Generate JWT ─────────────────────────────────────────────────────────────
const generateToken = (id) => {
  if (!process.env.JWT_SECRET) {
    console.warn('⚠️  JWT_SECRET is not set! Using fallback. Set it in production env.');
  }
  return jwt.sign({ id }, process.env.JWT_SECRET || 'aquasmart_fallback_secret_change_me', {
    expiresIn: '30d',
  });
};

// ─── Set Auth Cookie ──────────────────────────────────────────────────────────
const setTokenCookie = (res, token) => {
  const IS_PROD = process.env.NODE_ENV === 'production';
  res.cookie('token', token, {
    httpOnly: true,
    secure: IS_PROD,            // HTTPS only in production
    sameSite: IS_PROD ? 'none' : 'lax', // 'none' required for cross-origin (Vercel ↔ Render)
    maxAge: 30 * 24 * 60 * 60 * 1000,   // 30 days
  });
};

// ─── @desc    Register user
// ─── @route   POST /api/auth/register
// ─── @access  Public ──────────────────────────────────────────────────────────
const registerUser = async (req, res) => {
  try {
    // ── Debug Logging ────────────────────────────────────────────────────────
    console.log('\n📥 [REGISTER] Request received');
    console.log('[REGISTER] Body:', {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      role: req.body.role,
      password: req.body.password ? '******' : 'MISSING',
    });

    const { name, email, phone, password, role, shopName, vehicleType, vehicleNumber } = req.body;

    // ── Field validation ─────────────────────────────────────────────────────
    if (!name || !name.trim()) {
      console.log('[REGISTER] Validation failed: name missing');
      return res.status(400).json({ success: false, message: 'Name is required' });
    }
    if (!email && !phone) {
      console.log('[REGISTER] Validation failed: neither email nor phone provided');
      return res.status(400).json({
        success: false,
        message: 'Please provide either an email or phone number',
      });
    }
    if (!password) {
      console.log('[REGISTER] Validation failed: password missing');
      return res.status(400).json({ success: false, message: 'Password is required' });
    }

    // ── Password complexity (mirrors model validation) ────────────────────────
    const pwdErrors = [];
    if (password.length < 6 || password.length > 10)
      pwdErrors.push('Password must be 6–10 characters');
    if (!/[A-Z]/.test(password)) pwdErrors.push('must include an uppercase letter');
    if (!/[0-9]/.test(password)) pwdErrors.push('must include a number');
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password))
      pwdErrors.push('must include a special character');

    if (pwdErrors.length > 0) {
      console.log('[REGISTER] Password validation failed:', pwdErrors);
      return res.status(400).json({
        success: false,
        message: `Password too weak: ${pwdErrors.join(', ')}`,
      });
    }

    // ── Check for existing user ───────────────────────────────────────────────
    const orQuery = [];
    if (email) orQuery.push({ email: email.toLowerCase().trim() });
    if (phone) orQuery.push({ phone: phone.trim() });

    const userExists = await User.findOne({ $or: orQuery });
    if (userExists) {
      console.log('[REGISTER] Duplicate user found:', userExists.email || userExists.phone);
      if (email && userExists.email === email.toLowerCase().trim()) {
        return res.status(409).json({
          success: false,
          message: 'An account with this email already exists. Please login.',
        });
      }
      if (phone && userExists.phone === phone.trim()) {
        return res.status(409).json({
          success: false,
          message: 'An account with this phone number already exists. Please login.',
        });
      }
      return res.status(409).json({
        success: false,
        message: 'User already exists. Please login.',
      });
    }

    // ── Create user ───────────────────────────────────────────────────────────
    console.log('[REGISTER] Creating new user...');
    const user = await User.create({
      name: name.trim(),
      email: email ? email.toLowerCase().trim() : undefined,
      phone: phone ? phone.trim() : undefined,
      password,
      role: role || 'Customer',
      shopName: shopName || undefined,
      vehicleType: vehicleType || undefined,
      vehicleNumber: vehicleNumber || undefined,
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid user data' });
    }

    const token = generateToken(user._id);
    setTokenCookie(res, token);

    console.log(`[REGISTER] ✅ User registered: ${user._id} | role: ${user.role}`);

    return res.status(201).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    // ── MongoDB duplicate key ────────────────────────────────────────────────
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue || {})[0];
      const label = field === 'email' ? 'email' : field === 'phone' ? 'phone number' : field;
      console.error(`[REGISTER] Duplicate key error on field: ${field}`);
      return res.status(409).json({
        success: false,
        message: `An account with this ${label} already exists. Please login.`,
      });
    }

    // ── Mongoose validation error ────────────────────────────────────────────
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      console.error('[REGISTER] Mongoose ValidationError:', messages);
      return res.status(400).json({ success: false, message: messages.join('. ') });
    }

    console.error('[REGISTER] ❌ Unexpected error:', error.message);
    console.error(error.stack);
    return res.status(500).json({
      success: false,
      message: 'Server error during registration. Please try again.',
    });
  }
};

// ─── @desc    Authenticate user
// ─── @route   POST /api/auth/login
// ─── @access  Public ──────────────────────────────────────────────────────────
const loginUser = async (req, res) => {
  try {
    console.log('\n📥 [LOGIN] Request received');
    const { login, password } = req.body; // 'login' = email or phone

    if (!login || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide your email/phone and password',
      });
    }

    const user = await User.findOne({
      $or: [{ email: login.toLowerCase().trim() }, { phone: login.trim() }],
    }).select('+password');

    if (!user) {
      console.log(`[LOGIN] No user found for: ${login}`);
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      console.log(`[LOGIN] Wrong password for: ${login}`);
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = generateToken(user._id);
    setTokenCookie(res, token);

    console.log(`[LOGIN] ✅ User logged in: ${user._id} | role: ${user.role}`);

    return res.json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('[LOGIN] ❌ Error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
};

// ─── @desc    Get user profile
// ─── @route   GET /api/auth/profile
// ─── @access  Private ─────────────────────────────────────────────────────────
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    return res.json({ success: true, user });
  } catch (error) {
    console.error('[PROFILE] ❌ Error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─── @desc    Logout user
// ─── @route   POST /api/auth/logout
// ─── @access  Public ──────────────────────────────────────────────────────────
const logoutUser = (req, res) => {
  res.cookie('token', '', {
    httpOnly: true,
    expires: new Date(0),
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  });
  return res.status(200).json({ success: true, message: 'Logged out successfully' });
};

// ─── @desc    Forgot password
// ─── @route   POST /api/auth/forgot-password
// ─── @access  Public ──────────────────────────────────────────────────────────
const forgotPassword = async (req, res) => {
  try {
    const { login } = req.body;
    if (!login) {
      return res
        .status(400)
        .json({ success: false, message: 'Please provide your email or phone number' });
    }

    const user = await User.findOne({
      $or: [{ email: login }, { phone: login }],
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account found with that email or phone number',
      });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 minutes
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.FRONTEND_URL || 'https://aquasmart123.vercel.app'}/reset-password/${resetToken}`;
    console.log(`🔑 [FORGOT-PWD] Reset token for ${user.email || user.phone}: ${resetToken}`);

    return res.json({
      success: true,
      message: 'Password reset link generated',
      resetToken,
      resetUrl,
      expiresIn: '15 minutes',
    });
  } catch (error) {
    console.error('[FORGOT-PWD] ❌ Error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
};

// ─── @desc    Reset password
// ─── @route   POST /api/auth/reset-password/:token
// ─── @access  Public ──────────────────────────────────────────────────────────
const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password) {
      return res
        .status(400)
        .json({ success: false, message: 'Please provide a new password' });
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset link. Please request a new one.',
      });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    const authToken = generateToken(user._id);
    setTokenCookie(res, authToken);

    return res.json({
      success: true,
      message: 'Password reset successful! You are now logged in.',
      token: authToken,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('[RESET-PWD] ❌ Error:', error.message);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join('. ') });
    }
    return res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
};

// ─── @desc    Update user profile
// ─── @route   PUT /api/auth/profile
// ─── @access  Private ─────────────────────────────────────────────────────────
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const { name, email, phone, cultureType, shopName, profilePhoto } = req.body;
    if (name) user.name = name.trim();
    if (email) user.email = email.toLowerCase().trim();
    if (phone) user.phone = phone.trim();
    if (cultureType) user.cultureType = cultureType;
    if (shopName) user.shopName = shopName;
    if (profilePhoto) user.profilePhoto = profilePhoto;

    const updatedUser = await user.save();
    return res.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error('[UPDATE-PROFILE] ❌ Error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  getUserProfile,
  updateUserProfile,
  forgotPassword,
  resetPassword,
};
