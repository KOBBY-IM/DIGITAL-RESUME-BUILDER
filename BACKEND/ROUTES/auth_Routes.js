const express = require('express');
const router = express.Router();
const authController = require('../CONTROLLERS/authcontrol');
const authMiddleware = require('../MIDDLEWARE/auth_Middleware');

// Register a new user
router.post('/register', authController.register);

// Login user
router.post('/login', authController.login);

// Logout user
router.post('/logout', authMiddleware.authenticate, authController.logout);



module.exports = router;