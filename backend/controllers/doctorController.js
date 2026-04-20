const User = require('../models/User');
const DoctorRequest = require('../models/DoctorRequest');
const Log = require('../models/Log');

// @desc    Register a doctor (Awaiting Admin approval)
// @route   POST /api/doctors/register
// @access  Public
const registerDoctor = async (req, res) => {
  try {
    const { 
      name, email, phone, password, experience, specialization, 
      courses, certifications, availability, fees, shopLocation 
    } = req.body;

    const userExists = await User.findOne({ $or: [{ email }, { phone }] });
    if (userExists) {
      return res.status(400).json({ message: 'User with this email or phone already exists' });
    }

    const doctor = await User.create({
      name, email, phone, password,
      role: 'Doctor',
      experience,
      specialization,
      courses,
      certifications,
      availability,
      fees,
      shopLocation,
      isVerified: false
    });

    res.status(201).json({
      message: 'Doctor registered successfully. Awaiting Admin verification.',
      doctor: { id: doctor._id, name: doctor.name }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all verified doctors
// @route   GET /api/doctors
// @access  Public
const getDoctors = async (req, res) => {
  try {
    const doctors = await User.find({ role: 'Doctor', isVerified: true }).select('-password');
    res.json(doctors);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Book a doctor consultation
// @route   POST /api/doctors/book
// @access  Private
const bookConsultation = async (req, res) => {
  try {
    const { 
      doctorId, serviceType, description, images, location, distance 
    } = req.body;

    const doctor = await User.findById(doctorId);
    if (!doctor || doctor.role !== 'Doctor' || !doctor.isVerified) {
      return res.status(404).json({ message: 'Doctor not found or not verified' });
    }

    // Dynamic Pricing Logic
    let baseCost = 0;
    if (serviceType === 'Water Testing') baseCost = doctor.fees.waterTesting;
    else if (serviceType === 'Soil Testing') baseCost = doctor.fees.soilTesting;
    else if (serviceType === 'Field Visit') baseCost = doctor.fees.fieldVisitBase;

    const travelCost = (distance || 0) * (doctor.fees.perKmCharge || 0);
    const totalCost = baseCost + travelCost;

    const request = await DoctorRequest.create({
      customer: req.user._id,
      doctor: doctorId,
      serviceType,
      description,
      images,
      location,
      distance,
      baseCost,
      travelCost,
      totalCost,
      status: 'Pending'
    });

    res.status(201).json(request);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Doctor: Accept or Reject request
// @route   PUT /api/doctors/requests/:id/status
// @access  Private/Doctor
const updateRequestStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const request = await DoctorRequest.findById(req.params.id);

    if (!request || request.doctor.toString() !== req.user._id.toString()) {
      return res.status(404).json({ message: 'Request not found or unauthorized' });
    }

    request.status = status;
    await request.save();

    res.json(request);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Doctor: Upload report
// @route   PUT /api/doctors/requests/:id/report
// @access  Private/Doctor
const uploadReport = async (req, res) => {
  try {
    const { content, file } = req.body;
    const request = await DoctorRequest.findById(req.params.id);

    if (!request || request.doctor.toString() !== req.user._id.toString()) {
      return res.status(404).json({ message: 'Request not found' });
    }

    request.report = { content, file };
    request.status = 'Completed';
    await request.save();

    res.json(request);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Customer: Submit feedback
// @route   PUT /api/doctors/requests/:id/feedback
// @access  Private/Customer
const submitFeedback = async (req, res) => {
  try {
    const { accuracy, responseTime, helpfulness, comment } = req.body;
    const request = await DoctorRequest.findById(req.params.id);

    if (!request || request.customer.toString() !== req.user._id.toString()) {
      return res.status(404).json({ message: 'Request not found' });
    }

    request.feedback = {
      rating: { accuracy, responseTime, helpfulness },
      comment,
      createdAt: Date.now()
    };

    await request.save();
    res.json({ message: 'Feedback submitted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  registerDoctor,
  getDoctors,
  bookConsultation,
  updateRequestStatus,
  uploadReport,
  submitFeedback
};
