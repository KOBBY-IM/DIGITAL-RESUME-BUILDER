const jwt = require('jsonwebtoken');
const BlacklistedToken = require('../MODELS/blacklistedToken'); // Import the BlacklistedToken model

exports.authenticate = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    // Check if the token is blacklisted
    const isBlacklisted = await BlacklistedToken.findOne({ token });
    if (isBlacklisted) {
      return res.status(401).json({ message: 'Token is invalidated. Please log in again.' });
    }

    // Verify the token and get the user ID
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    res.status(400).json({ message: 'Invalid token' });
  }
};