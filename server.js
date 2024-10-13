const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const databaseconnection = require('./config/db.js');
const cookieParser = require('cookie-parser');
const router = require('./routes/userRoutes.js');
const path = require('path');

dotenv.config();

const app = express();

// Serve uploads folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(express.urlencoded({
  extended: true
}));

// Initialize database
databaseconnection();

// Allow cross-origin requests (CORS)
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use(cookieParser()); 

// Define routes
app.use('/api/auth', router);

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

// Handle undefined routes (404)
app.get('*', (req, res) => {
  res.status(404).json({
    message: 'Route not found'
  });
});
