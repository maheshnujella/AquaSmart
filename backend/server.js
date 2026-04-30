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

// ─── Load environment variables FIRST ────────────────────────────────────────
dotenv.config();

const IS_PROD = process.env.NODE_ENV === 'production';

// ─── Validate critical env vars ───────────────────────────────────────────────
if (!process.env.MONGO_URI) console.error('❌ MONGO_URI is not set!');
if (!process.env.JWT_SECRET) console.error('❌ JWT_SECRET is not set!');
console.log(`🌍 NODE_ENV: ${process.env.NODE_ENV}`);
console.log(`🔗 FRONTEND_URL: ${process.env.FRONTEND_URL}`);

// ─── Express App ─────────────────────────────────────────────
const app = express();
const server = http.createServer(app);

// ─── Allowed Origins ─────────────────────────────────────────
const ALLOWED_ORIGINS = [
  "http://localhost:5173",
  "https://aquasmart23.vercel.app",
];

// ─── CORS CONFIG (ONLY ONE BLOCK) ────────────────────────────
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);

    if (
      origin.includes("vercel.app") ||
      origin === "http://localhost:5173"
    ) {
      return callback(null, true);
    }

    console.log("⛔ Blocked by CORS:", origin);
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
};

app.use(cors(corsOptions));
// ─── Connect MongoDB ──────────────────────────────────────────────────────────
connectDB();


// ─── Socket.IO (no wildcard CORS) ────────────────────────────────────────────
const io = new Server(server, {
  cors: {
    origin: ALLOWED_ORIGINS,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// ─── Security headers ─────────────────────────────────────────────────────────
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);


// ─── Body parsers ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// ─── Request logger ───────────────────────────────────────────────────────────
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} | origin: ${req.headers.origin || 'none'}`);
  next();
});

// ─── Rate limiter ─────────────────────────────────────────────────────────────
app.use(
  rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many requests, please slow down.' },
  })
);

// ─── Socket.IO events ─────────────────────────────────────────────────────────
io.on('connection', (socket) => {
  console.log('🔌 Socket connected:', socket.id);

  // Delivery boy joins a room for a specific order
  socket.on('joinOrderRoom', ({ orderId }) => {
    socket.join(`order:${orderId}`);
    console.log(`📍 Socket ${socket.id} joined room: order:${orderId}`);
  });

  // Delivery boy leaves the room
  socket.on('leaveOrderRoom', ({ orderId }) => {
    socket.leave(`order:${orderId}`);
  });

  // Delivery boy emits live location
  socket.on('updateLocation', (data) => {
    // Broadcast to all in the order's room (customer listening)
    io.to(`order:${data.orderId}`).emit(`locationUpdate:${data.orderId}`, data);
    // Also broadcast globally for backward-compat
    io.emit(`locationUpdate:${data.orderId}`, data);
  });

  // Order status changed (admin/shopkeeper triggers)
  socket.on('orderStatusChange', ({ orderId, status }) => {
    io.to(`order:${orderId}`).emit(`orderStatus:${orderId}`, { status });
    io.emit(`orderStatus:${orderId}`, { status });
  });

  socket.on('disconnect', () => {
    console.log('🔌 Socket disconnected:', socket.id);
  });
});

// Expose io so controllers can emit events
app.set('io', io);

// ─── Health / Test endpoints ──────────────────────────────────────────────────
app.get('/', (_req, res) => {
  res.json({
    success: true,
    message: 'AquaSmart API is running ✅',
    env: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/test', (_req, res) => {
  const mongoose = require('mongoose');
  res.json({
    success: true,
    message: 'API working ✅',
    env: process.env.NODE_ENV,
    mongo: mongoose.connection.readyState === 1 ? 'connected ✅' : 'disconnected ❌',
    timestamp: new Date().toISOString(),
  });
});

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/auth',     require('./routes/auth'));
app.use('/api/users',    require('./routes/auth'));    // mirrors auth for profile
app.use('/api/products', require('./routes/products'));
app.use('/api/orders',   require('./routes/orders'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/listings', require('./routes/listings'));
app.use('/api/admin',    require('./routes/admin'));
app.use('/api/upload',   require('./routes/upload'));
app.use('/api/doctors',  require('./routes/doctors'));
app.use('/api/repair',   require('./routes/repair'));
app.use('/api/market',   require('./routes/market'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/tracking', require('./routes/tracking'));
app.use('/api/delivery', require('./routes/delivery'));

// ─── Static uploads ──────────────────────────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ─── Seed market data (non-blocking, runs 5s after start) ────────────────────
setTimeout(async () => {
  try {
    await require('./controllers/marketController').seedMarketData();
  } catch (e) {
    console.warn('⚠️  Market seed skipped:', e.message);
  }
}, 5000);

// ─── 404 handler (NO wildcard '*' — use middleware fallback instead) ──────────
// This catches any unmatched route safely in Express 5
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.originalUrl}` });
});

// ─── Global error handler ─────────────────────────────────────────────────────
app.use((err, req, res, _next) => {
  console.error('🔥 Unhandled error:', err.message);

  if (err.message && err.message.startsWith('CORS')) {
    return res.status(403).json({ success: false, message: err.message });
  }

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(IS_PROD ? {} : { stack: err.stack }),
  });
});

// ─── Start server ─────────────────────────────────────────────────────────────
// Render requires binding to process.env.PORT
const PORT = process.env.PORT || 5000;

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use. Run: taskkill /F /IM node.exe`);
    process.exit(1);
  } else {
    throw err;
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT} [${process.env.NODE_ENV}]`);
  console.log(`📡 Accepting connections from: ${ALLOWED_ORIGINS.join(', ')}`);
});