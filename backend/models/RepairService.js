const mongoose = require('mongoose');

const repairServiceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Service name is required'],
      trim: true,
    },
    type: {
      type: String,
      required: [true, 'Service type is required'],
      enum: ['Generator Repair', 'Motor Repair', 'Electrical Repair', 'Pump Repair', 'Plumbing', 'Other'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: 0,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    image: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('RepairService', repairServiceSchema);
