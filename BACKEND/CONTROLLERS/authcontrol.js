const User = require('../MODELS/user');
const { validateRegistration, validateLogin } = require('../UTILS/validation');
const BlacklistedToken = require('../MODELS/blacklistedToken')
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Register a new user
exports.register = async (req, res) => {
  const { error } = validateRegistration(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  const { name, email, password } = req.body;

  try {
    const normalizedEmail = email.toLowerCase();

    // Check if user already exists
    let user = await User.findOne({ email: normalizedEmail });
    if (user) return res.status(400).json({ message: 'User already exists' });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    user = new User({ name, email: normalizedEmail, password: hashedPassword });
    await user.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Login user
exports.login = async (req, res) => {
  const { error } = validateLogin(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  const { email, password } = req.body;

  try {
    const normalizedEmail = email.toLowerCase();

    // Check if user exists
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    // Validate password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    console.log('Token generated:', token); // Debugging

    res.status(200).json({ token });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

 // Logout user
exports.logout = async (req, res) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (token) {
    try {
      // Add the token to the blacklist
      const blacklistedToken = new BlacklistedToken({ token });
      await blacklistedToken.save();
      res.status(200).json({ message: 'User logged out successfully' });
    } catch (error) {
      console.error('Error blacklisting token:', error);
      res.status(500).json({ message: 'Server error' });
    }
  } else {
    res.status(400).json({ message: 'No token provided' });
  }
};