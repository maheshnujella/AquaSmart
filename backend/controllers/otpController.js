const Order = require('../models/Order');
const bcrypt = require('bcryptjs');

// @desc    Generate and send OTP for delivery
// @route   POST /api/orders/:id/otp/generate
// @access  Private/Delivery
const generateDeliveryOTP = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = await bcrypt.hash(otp, 10);

    order.otpVerification = {
      otp: hashedOtp,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
      attempts: 0,
      verified: false
    };

    await order.save();

    // In production, send SMS via Twilio/Msg91
    console.log(`DELIVERY OTP for Order ${order._id}: ${otp}`);
    res.json({ message: 'OTP sent to customer', otp: process.env.NODE_ENV === 'development' ? otp : undefined });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Verify OTP and complete delivery
// @route   POST /api/orders/:id/otp/verify
// @access  Private/Delivery
const verifyDeliveryOTP = async (req, res) => {
  try {
    const { otp, lat, lng } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order || !order.otpVerification.otp) {
      return res.status(404).json({ message: 'OTP not generated or order not found' });
    }

    // 1. Check Expiry
    if (new Date() > order.otpVerification.expiresAt) {
      return res.status(400).json({ message: 'OTP expired' });
    }

    // 2. Check Attempts
    if (order.otpVerification.attempts >= 3) {
      return res.status(400).json({ message: 'Max attempts reached. Generate new OTP.' });
    }

    // 3. Verify GPS (Within 500 meters)
    const distance = calculateDistance(lat, lng, order.shippingAddress.coordinates.lat, order.shippingAddress.coordinates.lng);
    if (distance > 0.5) { // 500 meters
      return res.status(400).json({ message: 'GPS mismatch. Must be at delivery location.' });
    }

    // 4. Verify OTP
    const isMatch = await bcrypt.compare(otp, order.otpVerification.otp);
    if (!isMatch) {
      order.otpVerification.attempts += 1;
      await order.save();
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    // 5. Success
    order.otpVerification.verified = true;
    order.status = 'Delivered';
    order.paymentStatus = 'Paid'; // Release from Escrow
    await order.save();

    res.json({ message: 'Delivery verified and completed successfully', order });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Haversine formula for distance
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

module.exports = {
  generateDeliveryOTP,
  verifyDeliveryOTP
};
