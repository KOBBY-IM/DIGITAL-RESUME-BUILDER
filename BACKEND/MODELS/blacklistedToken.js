const mongoose = require('mongoose');

const blacklistedTokenSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
    unique: true, // Ensure each token is stored only once
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: '1h', // Automatically delete tokens after 1 hour
  },
});

module.exports = mongoose.model('BlacklistedToken', blacklistedTokenSchema);