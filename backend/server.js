const express    = require('express');
const mongoose   = require('mongoose');
const cors       = require('cors');
const dotenv     = require('dotenv');
const path       = require('path');

dotenv.config();

const app = express();

// ─────────────────────────────────────────
//  SECURITY & PERFORMANCE MIDDLEWARE
// ─────────────────────────────────────────

// Try loading optional security packages (graceful degradation)
try {
  const helmet = require('helmet');
  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' }, contentSecurityPolicy: false }));
} catch (_) {}

try {
  const compression = require('compression');
  app.use(compression());
} catch (_) {}

try {
  const mongoSanitize = require('express-mongo-sanitize');
  app.use(mongoSanitize());
} catch (_) {}

// HTTP logging
try {
  const morgan = require('morgan');
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
} catch (_) {}

// ─────────────────────────────────────────
//  RATE LIMITING
// ─────────────────────────────────────────
try {
  const rateLimit = require('express-rate-limit');

  // General API limit
  app.use('/api/', rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 300,
    message: { success: false, message: 'Too many requests, please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
  }));

  // Stricter limit on auth routes
  app.use('/api/auth/login',    rateLimit({ windowMs: 15 * 60 * 1000, max: 10,  message: { success: false, message: 'Too many login attempts, please wait 15 minutes.' } }));
  app.use('/api/auth/register', rateLimit({ windowMs: 60 * 60 * 1000, max: 5,   message: { success: false, message: 'Too many registrations from this IP.' } }));
} catch (_) {}

// ─────────────────────────────────────────
//  CORS
// ─────────────────────────────────────────
app.use(cors({
  origin: (process.env.FRONTEND_URL || 'http://localhost:3000').split(','),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ─────────────────────────────────────────
//  BODY PARSING
// ─────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files (product images if uploaded locally)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ─────────────────────────────────────────
//  API ROUTES
// ─────────────────────────────────────────
app.use('/api/auth',     require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/cart',     require('./routes/cart'));
app.use('/api/orders',   require('./routes/orders'));
app.use('/api/wishlist', require('./routes/wishlist'));
app.use('/api/admin',    require('./routes/admin'));
app.use('/api/payment',  require('./routes/payment'));
app.use('/api/reviews',  require('./routes/reviews'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Torts & Twirls API is running',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development',
  });
});

// ─────────────────────────────────────────
//  404 HANDLER
// ─────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// ─────────────────────────────────────────
//  GLOBAL ERROR HANDLER
// ─────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('🔴 Error:', err.stack || err.message);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({ success: false, message: messages.join(', ') });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({ success: false, message: `${field} already exists` });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ success: false, message: 'Token expired, please login again' });
  }

  res.status(err.status || 500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
  });
});

// ─────────────────────────────────────────
//  DATABASE + SERVER START
// ─────────────────────────────────────────
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/torts-and-twirls';
const PORT      = process.env.PORT || 5000;

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
      console.log(`🔗 API: http://localhost:${PORT}/api/health`);
    });
  })
  .catch(err => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason) => {
  console.error('⚠️  Unhandled Rejection:', reason);
});

module.exports = app;
