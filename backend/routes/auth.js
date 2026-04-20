const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');
const { registerUser, loginUser, logoutUser, getUserProfile, forgotPassword, resetPassword } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// Rate limiting for auth routes to prevent brute force
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per windowMs for auth
  message: 'Too many login attempts from this IP, please try again after 15 minutes'
});

// Middleware to handle validation errors
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

router.post(
  '/register',
  [
    body('name', 'Name is required').not().isEmpty(),
    body('password', 'Password must be 6-10 characters with uppercase, number, and special symbol').isLength({ min: 6, max: 10 })
  ],
  validate,
  registerUser
);

router.post(
  '/login',
  authLimiter,
  [
    body('login', 'Login identifier (email or phone) is required').exists(),
    body('password', 'Password is required').exists()
  ],
  validate,
  loginUser
);

router.post('/logout', logoutUser);

router.get('/profile', protect, getUserProfile);

module.exports = router;
