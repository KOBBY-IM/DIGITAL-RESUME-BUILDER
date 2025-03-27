const express = require('express');
const router = express.Router();
const authController = require('../CONTROLLERS/authControl');
const { authenticate } = require('../MIDDLEWARE/auth_Middleware');
const AIService = require('../UTILS/aiService');

// Registration route
router.post('/register', authController.register);

// Login route
router.post('/login', authController.login);

// Logout route
router.post('/logout', authenticate, authController.logout);

// AI Assistance route
router.post('/ai/assist', authenticate, async (req, res) => {
  try {
    const { prompt, context } = req.body;
    const result = await AIService.generateResumeContent(prompt, context);
    res.json({ result });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;