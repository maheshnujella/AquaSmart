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

// ─── Load environment variables ───────────────────────────────────────────────
dotenv.config();

const IS_PROD = process.env.NODE_ENV === 'production';

// ─── Allowed CORS origins ─────────────────────────────────────────────────────
const ALLOWED_ORIGINS = [
  'https://aquasmart123.vercel.app',  // Production Vercel frontend
  'http://localhost:5173',             // Vite dev server
  'http://localhost:3000',             // CRA dev server (fallback)
];

// Extra origins from env (comma-separated)
if (process.env.FRONTEND_URL) {
  process.env.FRONTEND_URL.split(',').forEach((url) => {
    const trimmed = url.trim();
    if (trimmed && !ALLOWED_ORIGINS.includes(trimmed)) ALLOWED_ORIGINS.push(trimmed);
  });
}

console.log('✅ Allowed CORS Origins:', ALLOWED_ORIGINS);

// ─── Connect to MongoDB ───────────────────────────────────────────────────────
connectDB();

const app = express();
const server = http.createServer(app);

// ─── Socket.IO ────────────────────────────────────────────────────────────────
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

// ─── CORS middleware ──────────────────────────────────────────────────────────
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (server-to-server, Postman, curl)
      if (!origin) return callback(null, true);
      if (ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
      console.warn(`⛔ CORS blocked origin: ${origin}`);
      return callback(new Error(`CORS policy: Origin "${origin}" is not allowed`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

// Pre-flight for all routes
app.options('*', cors());

// ─── Cookie parser ────────────────────────────────────────────────────────────
app.use(cookieParser());

// ─── Body parser ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── Request logger (debug) ──────────────────────────────────────────────────
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const ms = Date.now() - start;
    console.log(
      `[${new Date().toISOString()}] ${req.method} ${req.originalUrl} → ${res.statusCode} (${ms}ms) | Origin: ${req.headers.origin || 'none'}`
    );
  });
  next();
});

// ─── Global rate limiter ──────────────────────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
});
app.use(globalLimiter);

// ─── Socket.IO events ─────────────────────────────────────────────────────────
io.on('connection', (socket) => {
  console.log('🔌 Socket connected:', socket.id);

  socket.on('updateLocation', (data) => {
    io.emit(`locationUpdate:${data.orderId}`, data);
  });

  socket.on('disconnect', () => {
    console.log('🔌 Socket disconnected:', socket.id);
  });
});

// ─── Health / Test endpoints ──────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'AquaSmart API is running ✅',
    env: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'API working ✅',
    env: process.env.NODE_ENV,
    mongo: require('mongoose').connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
  });
});

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/auth'));   // mirrors auth for profile access
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

// ─── Static uploads ──────────────────────────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

// ─── Seed market data (non-blocking) ─────────────────────────────────────────
setTimeout(async () => {
  try {
    await require('./controllers/marketController').seedMarketData();
  } catch (e) {
    console.warn('⚠️  Market seed skipped:', e.message);
  }
}, 5000);

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// ─── Global error handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('🔥 Global error:', err.message);
  console.error(err.stack);

  // CORS errors
  if (err.message && err.message.startsWith('CORS policy')) {
    return res.status(403).json({ success: false, message: err.message });
  }

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(IS_PROD ? {} : { stack: err.stack }),
  });
});

// ─── Start server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running in [${process.env.NODE_ENV}] mode on port ${PORT}`);
  console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
});
