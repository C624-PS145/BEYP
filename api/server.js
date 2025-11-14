const express = require('express');
const cors = require('cors');
const serverless = require('serverless-http');
require('dotenv').config();

// Express App
const app = express();
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});


app.use(express.json());

// Import Routes
const profileRoutes = require('../routes/profile');
const experienceRoutes = require('../routes/experience');
const projectRoutes = require('../routes/projects');
const certificationRoutes = require('../routes/certifications');
const educationRoutes = require('../routes/education');
const contactRoutes = require('../routes/contact');
const aboutRoutes = require('../routes/about');
const portfolioContextRoutes = require('../routes/portfolioContext');
const chatRoutes = require('../routes/chat');
const authRoutes = require('../routes/auth');

// Register routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/experience', experienceRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/certifications', certificationRoutes);
app.use('/api/education', educationRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/about', aboutRoutes);
app.use('/api/portfolio-context', portfolioContextRoutes);
app.use('/api/chat', chatRoutes);

// Test route
app.get('/', (req, res) => {
  res.send('Vercel Express API is running...');
});

module.exports = serverless(app);
