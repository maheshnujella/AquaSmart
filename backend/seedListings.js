const mongoose = require('mongoose');
const Listing = require('./models/Listing');
const User = require('./models/User');
const dotenv = require('dotenv');

dotenv.config();

const seedListings = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected for seeding listings...');

    // Find a user to act as seller (Admin or any existing user)
    const seller = await User.findOne({ role: 'Admin' }) || await User.findOne();
    if (!seller) {
      console.log('No user found to assign as seller. Please register a user first.');
      process.exit();
    }

    // Clear existing listings to start fresh
    await Listing.deleteMany();

    const sampleListings = [
      {
        seller: seller._id,
        title: 'Fresh Vannamei Prawns - High Quality',
        cropType: 'Prawn',
        quantity: 500,
        pricePerUnit: 480,
        location: 'Nellore, Andhra Pradesh',
        description: 'Harvested today, 30 count size, high protein feed used.',
        status: 'Active'
      },
      {
        seller: seller._id,
        title: 'Large Rohu Fish Harvest',
        cropType: 'Fish',
        quantity: 1200,
        pricePerUnit: 220,
        location: 'Bhimavaram, Andhra Pradesh',
        description: 'Average weight 1.5kg - 2kg per fish. Healthy stock.',
        status: 'Active'
      },
      {
        seller: seller._id,
        title: 'Premium Black Tiger Shrimp',
        cropType: 'Prawn',
        quantity: 300,
        pricePerUnit: 650,
        location: 'Kakinada, Andhra Pradesh',
        description: '20 count size, export quality black tiger shrimp.',
        status: 'Active'
      }
    ];

    await Listing.insertMany(sampleListings);
    console.log('Marketplace listings seeded successfully!');
    process.exit();
  } catch (error) {
    console.error('Error seeding listings:', error);
    process.exit(1);
  }
};

seedListings();
