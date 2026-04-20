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

// Load env
dotenv.config();

const app = express();
const server = http.createServer(app);

const IS_PROD = process.env.NODE_ENV === 'production';

// ✅ Allowed frontend URLs
const ALLOWED_ORIGINS = [
  'https://aquasmart123.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000',
];

console.log('✅ Allowed Origins:', ALLOWED_ORIGINS);

// Connect DB
connectDB();

// ─────────────────────────────────────────────
// ✅ CORS (ONLY ONCE — FIXED)
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);

    if (ALLOWED_ORIGINS.includes(origin)) {
      return callback(null, true);
    } else {
      console.warn(`⛔ Blocked CORS: ${origin}`);
      return callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));
app.options('/*', cors(corsOptions)); // ✅ preflight fix

// ─────────────────────────────────────────────
// Security
app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);

// Cookies + Body
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limit
app.use(
  rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 200,
  })
);

// ─────────────────────────────────────────────
// Socket.IO
const io = new Server(server, {
  cors: {
    origin: ALLOWED_ORIGINS,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id);

  socket.on('updateLocation', (data) => {
    io.emit(`locationUpdate:${data.orderId}`, data);
  });

  socket.on('disconnect', () => {
    console.log('Socket disconnected');
  });
});

// ─────────────────────────────────────────────
// Routes
app.get('/', (req, res) => {
  res.json({ message: 'AquaSmart API running ✅' });
});

app.get('/api/test', (req, res) => {
  res.json({ message: 'API working ✅' });
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/auth'));
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

// Static
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

// 404
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Global error
app.use((err, req, res, next) => {
  console.error(err.message);
  res.status(500).json({ success: false, message: err.message });
});

// ─────────────────────────────────────────────
// Start server
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});