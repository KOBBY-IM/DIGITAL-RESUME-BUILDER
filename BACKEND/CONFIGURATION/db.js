const mongoose = require('mongoose');

// Enable Mongoose debugging (logs all queries and operations to the console)
mongoose.set('debug', true);

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_KEY,{
    });
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1); // Exit the process if the connection fails
  }
};

module.exports = connectDB;