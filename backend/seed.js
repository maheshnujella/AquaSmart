const mongoose = require('mongoose');
const User = require('./models/User');
const Product = require('./models/Product');
const dotenv = require('dotenv');

dotenv.config();

const seedAll = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected');

    // --- SEED ADMIN ---
    const adminExists = await User.findOne({ role: 'Admin' });
    if (!adminExists) {
      await User.create({
        name: 'Admin',
        email: 'admin@aquasmart.com',
        password: 'Admin@123', // satisfies: 6-10 chars, uppercase, number, special
        role: 'Admin',
      });
      console.log('✅ Admin seeded: admin@aquasmart.com / Admin@123');
    } else {
      console.log('ℹ️  Admin already exists');
    }

    // --- SEED PRODUCTS ---
    const productCount = await Product.countDocuments();
    if (productCount === 0) {
      const admin = await User.findOne({ role: 'Admin' });
      await Product.insertMany([
        { name: 'Premium Vannamei Feed 50kg', category: 'Feed', subCategory: 'Vanami Feed', price: 2200, stock: 80, description: 'High protein Vannamei shrimp feed for all stages.', user: admin._id },
        { name: 'Sadhya Fish Feed 30kg', category: 'Feed', subCategory: 'Sadhya Feed', price: 1450, stock: 60, description: 'Balanced diet fish feed for fast growth.', user: admin._id },
        { name: 'Growth Booster Feed 25kg', category: 'Feed', subCategory: 'Vanami Feed', price: 1800, stock: 40, description: 'Formulated for rapid weight gain in prawns.', user: admin._id },
        { name: 'Aqua Probiotic 1L', category: 'Medicine', subCategory: 'Water Treatment', price: 450, stock: 100, description: 'Beneficial bacteria for healthy pond water.', user: admin._id },
        { name: 'Pond Disinfectant 5L', category: 'Medicine', subCategory: 'Water Treatment', price: 850, stock: 50, description: 'Kills harmful pathogens and purifies pond water.', user: admin._id },
        { name: 'Calcium Mineral Supplement', category: 'Medicine', subCategory: 'Minerals', price: 320, stock: 200, description: 'Essential calcium for shell and bone development.', user: admin._id },
        { name: 'Vitamin C Supplement 500g', category: 'Medicine', subCategory: 'Fish Medicine', price: 280, stock: 120, description: 'Boosts immunity and reduces mortality.', user: admin._id },
      ]);
      console.log('✅ Products seeded (7 items)');
    } else {
      console.log('ℹ️  Products already exist, skipping');
    }

    console.log('\n🚀 AquaSmart seed complete!');
    console.log('-----------------------------------');
    console.log('Login: admin@aquasmart.com');
    console.log('Password: Admin@123');
    console.log('-----------------------------------');
    process.exit();
  } catch (error) {
    console.error('❌ Seed failed:', error.message);
    process.exit(1);
  }
};

seedAll();
