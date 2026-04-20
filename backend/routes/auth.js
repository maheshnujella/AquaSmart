const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const {
  registerUser,
  loginUser,
  logoutUser,
  getUserProfile,
  updateUserProfile,
  forgotPassword,
  resetPassword,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// ─── Rate limiter for auth endpoints ─────────────────────────────────────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many attempts from this IP. Please try again after 15 minutes.',
  },
});

// ─── POST /api/auth/register ──────────────────────────────────────────────────
router.post('/register', authLimiter, registerUser);

// ─── POST /api/auth/login ─────────────────────────────────────────────────────
router.post('/login', authLimiter, loginUser);

// ─── POST /api/auth/logout ────────────────────────────────────────────────────
router.post('/logout', logoutUser);

// ─── GET  /api/auth/profile ───────────────────────────────────────────────────
router.get('/profile', protect, getUserProfile);

// ─── PUT  /api/auth/profile ───────────────────────────────────────────────────
router.put('/profile', protect, updateUserProfile);

// ─── POST /api/auth/forgot-password ──────────────────────────────────────────
router.post('/forgot-password', authLimiter, forgotPassword);

// ─── POST /api/auth/reset-password/:token ────────────────────────────────────
router.post('/reset-password/:token', resetPassword);

module.exports = router;
