const RepairRequest = require('../models/RepairRequest');
const User = require('../models/User');

// Helper to calculate distance (Haversine formula)
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
};

const deg2rad = (deg) => deg * (Math.PI / 180);

// @desc    Create a new repair request with live location
// @route   POST /api/repair/requests
// @access  Private
const createRepairRequest = async (req, res) => {
  try {
    const { category, issueTitle, description, images, location } = req.body;

    if (!location || !location.latitude || !location.longitude) {
      return res.status(400).json({ message: 'Live location is mandatory for repair requests' });
    }

    const request = await RepairRequest.create({
      customer: req.user._id,
      category,
      issueTitle,
      description,
      images,
      location,
      status: 'Pending'
    });

    res.status(201).json(request);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get nearby repair requests (for providers)
// @route   GET /api/repair/nearby
// @access  Private/Shopkeeper
const getNearbyRepairRequests = async (req, res) => {
  try {
    const provider = req.user;
    if (!provider.shopLocation || !provider.shopLocation.latitude) {
      return res.status(400).json({ message: 'Provider location not set' });
    }

    const requests = await RepairRequest.find({ status: 'Pending' });
    
    // Calculate distance for each request
    const nearbyRequests = requests.map(request => {
      const distance = calculateDistance(
        provider.shopLocation.latitude,
        provider.shopLocation.longitude,
        request.location.latitude,
        request.location.longitude
      );
      return { ...request._doc, distance: distance.toFixed(2) };
    }).sort((a, b) => a.distance - b.distance);

    res.json(nearbyRequests);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Accept repair request
// @route   PUT /api/repair/requests/:id/accept
// @access  Private/Shopkeeper
const acceptRepairRequest = async (req, res) => {
  try {
    const request = await RepairRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found' });

    request.provider = req.user._id;
    request.status = 'Accepted';
    
    // Calculate final distance for storage
    request.distance = calculateDistance(
      req.user.shopLocation.latitude,
      req.user.shopLocation.longitude,
      request.location.latitude,
      request.location.longitude
    );

    await request.save();
    res.json(request);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update status (In Progress, Completed)
// @route   PUT /api/repair/requests/:id/status
const updateRepairStatus = async (req, res) => {
  try {
    const { status, finalCost } = req.body;
    const request = await RepairRequest.findById(req.params.id);

    if (!request || request.provider.toString() !== req.user._id.toString()) {
      return res.status(404).json({ message: 'Request not found or unauthorized' });
    }

    request.status = status;
    if (finalCost) request.finalCost = finalCost;
    
    await request.save();
    res.json(request);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createRepairRequest,
  getNearbyRepairRequests,
  acceptRepairRequest,
  updateRepairStatus
};
