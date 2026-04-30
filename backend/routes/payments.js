const express = require('express');
const router  = express.Router();
const {
  initiateUPIPayment,
  confirmPayment,
  getOrderPayment,
  getAllPayments,
  initiatePayment,
  requestRefund,
  processRefund,
} = require('../controllers/paymentController');
const { protect, authorize } = require('../middleware/auth');

// ─── New UPI routes ───────────────────────────────────────────────────────────
router.post('/initiate-upi',       protect, initiateUPIPayment);
router.post('/confirm',            protect, confirmPayment);
router.get('/order/:orderId',      protect, getOrderPayment);
router.get('/all',                 protect, authorize('Admin'), getAllPayments);

// ─── Legacy routes (kept for backward-compat) ─────────────────────────────────
router.post('/initiate',           protect, initiatePayment);
router.post('/refund/request',     protect, requestRefund);
router.put('/refund/process/:orderId', protect, authorize('Admin'), processRefund);

module.exports = router;
