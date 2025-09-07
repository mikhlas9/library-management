const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const { body } = require('express-validator');

// Load env vars
dotenv.config();

const app = express();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const authRoutes = require('./routes/auth');
const bookRoutes = require('./routes/books');

app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);

// Welcome route
app.get('/', (req, res) => {
  res.json({
    message: 'Library Management System API',
    version: '1.0.0'
  });
});

// Error handler
app.use((err, req, res, next) => {
  res.status(500).json({
    success: false,
    message: 'Server error'
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
