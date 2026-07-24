const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// Import routes
const authRoutes = require('./src/routes/auth');
const placeRoutes = require('./src/routes/placeRoutes');
const tripRoutes = require('./src/routes/tripRoutes');
const priceUpdateRoutes = require('./src/routes/priceUpdateRoutes');
const placeholderRoutes = require('./src/routes/placeholderRoutes');
const categoryRoutes = require('./src/routes/categoryRoutes');

const app = express();
const PORT = process.env.PORT || 5001;

// Database connection (serverless-friendly: cache connection, wait before handling requests)
let isConnected = false;

async function connectDB() {
  if (isConnected) return;
  await mongoose.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 20000,
  });
  isConnected = true;
  console.log('MongoDB connected');
}

app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('MongoDB connection error:', err);
    res.status(500).json({ success: false, message: 'Database connection failed' });
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (uploads)
app.use('/uploads', express.static('uploads'));

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to teawinai API' });
});

// API routes
app.use('/api/places', placeRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/price-updates', priceUpdateRoutes);
app.use('/api/placeholder', placeholderRoutes);
app.use('/api/categories', categoryRoutes);

// Global error handler middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Start server (only when running locally, not on Vercel)
if (process.env.VERCEL !== '1') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
