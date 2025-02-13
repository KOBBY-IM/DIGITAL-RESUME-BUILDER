// Import Express
const express = require('express');

// Create an Express app
const app = express();

// Define a basic route
app.get('/', (req, res) => {
  res.send('Hello, the server is running!');
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});