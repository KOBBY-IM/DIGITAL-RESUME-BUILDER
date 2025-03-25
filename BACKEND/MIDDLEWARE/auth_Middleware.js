const jwt = require('jsonwebtoken');
const BlacklistedToken = require('../MODELS/blacklistedToken');

const authenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required' 
      });
    }

    // Check if the token is blacklisted
    const isBlacklisted = await BlacklistedToken.findOne({ token });
    if (isBlacklisted) {
      return res.status(401).json({ 
        success: false, 
        message: 'Session expired. Please log in again.' 
      });
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check token expiration
    if (decoded.exp && Date.now() >= decoded.exp * 1000) {
      return res.status(401).json({ 
        success: false, 
        message: 'Token expired' 
      });
    }
    
    req.userId = decoded.userId;
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid token' 
      });
    }
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Token expired' 
      });
    }
    return res.status(500).json({ 
      success: false, 
      message: 'Authentication error' 
    });
  }
};

module.exports = { authenticate };