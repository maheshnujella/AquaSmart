const mongoose = require('mongoose');

const connectDB = async () => {
  const connect = async () => {
    try {
      const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/aquasmart', {
        serverSelectionTimeoutMS: 10000,
      });
      console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
      console.error(`⚠️  MongoDB connection failed: ${error.message}`);
      console.error('👉 Fix: Go to MongoDB Atlas → Network Access → Add IP → Allow 0.0.0.0/0');
      console.log('🔄 Retrying in 10 seconds...');
      setTimeout(connect, 10000); // Retry every 10s instead of crashing
    }
  };
  await connect();
};

module.exports = connectDB;
