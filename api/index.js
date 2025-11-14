const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Express instance
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Import routes
app.use('/auth', require('../routes/auth'));
app.use('/profile', require('../routes/profile'));
app.use('/experience', require('../routes/experience'));
app.use('/projects', require('../routes/projects'));
app.use('/certifications', require('../routes/certifications'));
app.use('/education', require('../routes/education'));
app.use('/contact', require('../routes/contact'));
app.use('/about', require('../routes/about'));
app.use('/portfolio-context', require('../routes/portfolioContext'));
app.use('/chat', require('../routes/chat'));

// Test
app.get('/', (req, res) => {
  res.send('Portfolio API running...');
});

// ❗ WAJIB → export sebagai serverless function
module.exports = (req, res) => {
  app(req, res);
};
