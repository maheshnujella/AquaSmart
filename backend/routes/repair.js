const express = require('express');
const router = express.Router();
const {
  createRepairRequest,
  getNearbyRepairRequests,
  acceptRepairRequest,
  updateRepairStatus
} = require('../controllers/repairController');
const { protect, authorize } = require('../middleware/auth');

// Customer routes
router.post('/requests', protect, authorize('Customer', 'Admin'), createRepairRequest);

// Provider routes (Shopkeeper / Repair Expert)
router.get('/nearby', protect, authorize('Shopkeeper', 'Admin'), getNearbyRepairRequests);
router.put('/requests/:id/accept', protect, authorize('Shopkeeper', 'Admin'), acceptRepairRequest);
router.put('/requests/:id/status', protect, authorize('Shopkeeper', 'Admin'), updateRepairStatus);

module.exports = router;
