// Import required modules
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const authRoutes = require('./ROUTES/auth_Routes');
const connectDB = require('./CONFIGURATION/db');

// Load environment variables from .env file
dotenv.config();

// Create an Express app
const app = express();
app.use(express.json());

// Connect to MongoDB
connectDB(); // Use the connectDB function from the CONFIGURATION/db.js file

// Routes
app.use('/api/auth', authRoutes);

// Define a basic route
app.get('/', (req, res) => {
  res.send('Hello, the server is running!');
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});