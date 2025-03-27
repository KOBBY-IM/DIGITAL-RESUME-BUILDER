const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const morgan = require('morgan');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '.env') });

// Create Express app
const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false
}));

// Standard middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(compression({
  level: 6,
  threshold: 0
}));

// CORS configuration
app.use(cors({
  origin: process.env.CLIENT_URL || `http://localhost:${process.env.PORT || 3000}`,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Logging
app.use(morgan('dev'));

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  standardHeaders: true,
  message: { success: false, message: 'Too many requests, please try again later' }
});

// Apply rate limiting to API routes
app.use('/api/', apiLimiter);

// Specific rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  message: { success: false, message: 'Too many auth attempts, please try again later' }
});

app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// Database connection
mongoose.connect(process.env.MONGO_KEY, {
  useNewUrlParser: true,
  useUnifiedTopology: true
  // Remove poolSize option as it's no longer supported in MongoDB driver 6.x
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

// Routes
const authRoutes = require('./ROUTES/auth_Routes');
const templateRoutes = require('./ROUTES/templateRoutes');
const resumeRoutes = require('./ROUTES/resumeRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/resumes', resumeRoutes);

// Serve static files from FRONTEND
app.use(express.static(path.join(__dirname, '../FRONTEND')));

// Handle all other routes by serving index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../FRONTEND/test.html'));
});

// Central error handling middleware
app.use((err, req, res, next) => {
  console.error(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}:`, err);
  
  // Handle different types of errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: Object.values(err.errors).map(e => e.message)
    });
  }
  
  if (err.name === 'MongoError' && err.code === 11000) {
    return res.status(409).json({
      success: false,
      message: 'Duplicate entry exists'
    });
  }
  
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
  
  // Default error response
  res.status(err.statusCode || 500).json({ 
    success: false,
    message: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Start server
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION:', err);
  // Close server & exit process
  server.close(() => process.exit(1));
});

module.exports = app;