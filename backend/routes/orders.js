const express = require('express');
const router = express.Router();
const {
  createOrder,
  acceptOrder,
  requestDeliveryCompletion,
  verifyOtp,
  getMyOrders,
  getOrderById
} = require('../controllers/orderController');
const { generateDeliveryOTP, verifyDeliveryOTP } = require('../controllers/otpController');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .post(protect, createOrder);

router.get('/myorders', protect, getMyOrders);

router.get('/:id', protect, getOrderById);

router.put('/:id/accept', protect, authorize('Shopkeeper', 'Admin'), acceptOrder);

// Secure OTP Delivery Logic
router.post('/:id/otp/generate', protect, authorize('Delivery', 'Admin'), generateDeliveryOTP);
router.post('/:id/otp/verify', protect, authorize('Delivery', 'Admin'), verifyDeliveryOTP);

module.exports = router;
