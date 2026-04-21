const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name']
  },
  email: {
    type: String,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  phone: {
    type: String,
    unique: true,
    sparse: true // Allow null for email-only users
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  role: {
    type: String,
    enum: ['Customer', 'Admin', 'Shopkeeper', 'Delivery', 'Doctor'],
    default: 'Customer'
  },
  // Shopkeeper Specific Fields
  shopName: String,
  shopImage: String,
  shopLocation: {
    address: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },

  // Doctor Specific Fields
  doctorProfile: {
    experience: Number,
    specialization: {
      type: [String],
      enum: ['Aquaculture', 'Fish Health', 'Prawn Culture']
    },
    courses: [
      {
        courseName: String,
        institutionName: String,
        year: Number
      }
    ],
    certifications: [String],
    isVerified: {
      type: Boolean,
      default: false
    },
    fees: {
      waterTesting: { type: Number, default: 0 },
      soilTesting: { type: Number, default: 0 },
      fieldVisitBase: { type: Number, default: 0 },
      perKmCharge: { type: Number, default: 0 }
    }
  },
  // Delivery Specific Fields
  deliveryProfile: {
    vehicleType: {
      type: String,
      enum: ['Bike', 'Auto', 'Van', 'Lorry']
    },
    vehicleNumber: String,
    profilePhoto: String,
    isAvailable: {
      type: Boolean,
      default: true
    }
  },
  vehicleType: {
    type: String,
    enum: ['Bike', 'Auto/Van', 'Lorry']
  },
  vehicleNumber: String,
  profilePhoto: String,
  // Customer specific fields
  cultureType: {
    type: String,
    enum: ['Fish', 'Prawns', 'None'],
    default: 'None'
  },
  // Password Reset Fields
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Password complexity validation removed to allow simple 6+ char passwords
// Encrypt password using bcrypt
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
