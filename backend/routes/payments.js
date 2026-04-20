const express = require('express');
const router = express.Router();
const { initiatePayment, requestRefund, processRefund } = require('../controllers/paymentController');
const { protect, authorize } = require('../middleware/auth');

router.post('/initiate', protect, initiatePayment);
router.post('/refund/request', protect, requestRefund);
router.put('/refund/process/:orderId', protect, authorize('Admin'), processRefund);

module.exports = router;
