const express = require('express');
const router = express.Router();
const {
  createRepairRequest,
  getNearbyRepairRequests,
  acceptRepairRequest,
  updateRepairStatus,
  getProviderJobs
} = require('../controllers/repairController');
const { protect, authorize } = require('../middleware/auth');

// Customer routes
router.post('/requests', protect, authorize('Customer', 'Admin'), createRepairRequest);

// Provider routes (Shopkeeper / Repair Expert)
router.get('/nearby', protect, authorize('Shopkeeper', 'Admin', 'Repair'), getNearbyRepairRequests);
router.get('/my-jobs', protect, authorize('Shopkeeper', 'Admin', 'Repair'), getProviderJobs);
router.put('/requests/:id/accept', protect, authorize('Shopkeeper', 'Admin', 'Repair'), acceptRepairRequest);
router.put('/requests/:id/status', protect, authorize('Shopkeeper', 'Admin', 'Repair'), updateRepairStatus);

module.exports = router;
