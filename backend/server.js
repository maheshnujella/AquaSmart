const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const cookieParser = require('cookie-parser');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: true, // allow all origins in dev (tunnel support)
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Security middlewares
app.use(helmet({
  contentSecurityPolicy: false, // Disable for easier dev with external resources if needed
})); 
app.use(cors({ origin: true, credentials: true })); // allow all origins for tunnel/dev access
app.use(cookieParser());

// Global rate limiting
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 mins
  max: 100 
});
app.use(limiter);

// Body parser
app.use(express.json());

// Socket.io logic
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  socket.on('updateLocation', (data) => {
    // data: { orderId, lat, lng, role }
    io.emit(`locationUpdate:${data.orderId}`, data);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/auth'));   // /api/users mirrors auth for profile access
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/listings', require('./routes/listings'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/doctors', require('./routes/doctors'));
app.use('/api/repair', require('./routes/repair'));
app.use('/api/market', require('./routes/market'));
app.use('/api/payments', require('./routes/payments'));

// Seed market data safely after DB connects (non-blocking)
const trySeeding = async () => {
  try {
    await require('./controllers/marketController').seedMarketData();
  } catch (e) {
    console.warn('Market seed skipped (DB not ready):', e.message);
  }
};
setTimeout(trySeeding, 5000); // Wait 5s for DB connection

// Serve static files from the uploads folder
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

// Basic route
app.get('/', (req, res) => {
  res.send('AquaSmart API is running with Socket.IO...');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Server Error', error: err.message });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
