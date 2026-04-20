const express = require('express');
const router = express.Router();
const {
  registerDoctor,
  getDoctors,
  bookConsultation,
  updateRequestStatus,
  uploadReport,
  submitFeedback
} = require('../controllers/doctorController');
const { protect, authorize } = require('../middleware/auth');

// Public routes
router.post('/register', registerDoctor);
router.get('/', getDoctors);

// Private routes (Customers)
router.post('/book', protect, authorize('Customer', 'Admin'), bookConsultation);
router.put('/requests/:id/feedback', protect, authorize('Customer', 'Admin'), submitFeedback);

// Private routes (Doctors)
router.get('/requests', protect, authorize('Doctor', 'Admin'), async (req, res) => {
  try {
    const requests = await require('../models/DoctorRequest').find({ doctor: req.user._id }).populate('customer', 'name email');
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/requests/:id/status', protect, authorize('Doctor', 'Admin'), updateRequestStatus);
router.put('/requests/:id/report', protect, authorize('Doctor', 'Admin'), uploadReport);

module.exports = router;
