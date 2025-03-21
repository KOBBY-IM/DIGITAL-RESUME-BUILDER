// Import required modules
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');

// Import routes
const authRoutes = require('./ROUTES/auth_Routes');
const templateRoutes = require('./ROUTES/templateRoutes');
const resumeRoutes = require('./ROUTES/resumeRoutes');
const connectDB = require('./CONFIGURATION/db');

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '.env') });

// Create an Express app
const app = express();

// Middlewares
app.use(express.json());

// Connect to MongoDB
connectDB();

// Enable CORS
app.use(cors({
  origin: `http://localhost:${process.env.PORT || 3000}`,
  credentials: true,
}));

// Serve static files from the FRONTEND directory
app.use(express.static(path.join(__dirname, '../FRONTEND')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/resumes', resumeRoutes);

// Catch-all route to serve the frontend's index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../FRONTEND/test.html'));
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});