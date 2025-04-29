const express = require('express');
const knex = require('./knex');  // Ensure this is the correct path to knex.js
const bodyParser = require('body-parser');
const authRoutes = require('./routes/auth');  // Import the auth routes
const app = express();
const PORT = process.env.PORT || 3005;

app.use(bodyParser.json()); // Middleware to parse incoming JSON

// Test MySQL connection
knex.raw('SELECT 1')
  .then(() => {
    console.log('MySQL connection successful');
  })
  .catch((err) => {
    console.error('Error connecting to MySQL:', err);
  });

// Root route
app.get('/', (req, res) => {
  res.send('Hello World!');
});

// Use the auth routes for handling user-related operations
app.use('/auth', authRoutes);

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
