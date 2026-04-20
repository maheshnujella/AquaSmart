// FIX: Was importing './authMiddleware' which doesn't exist.
// The correct file is './auth' (auth.js in the same middleware folder).
const { protect, authorize } = require('./auth');

module.exports = { protect, authorize };
