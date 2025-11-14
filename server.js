const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Import Routes
const profileRoutes = require('./routes/profile');
const experienceRoutes = require('./routes/experience');
const projectRoutes = require('./routes/projects');
const certificationRoutes = require('./routes/certifications');
const educationRoutes = require('./routes/education');
const contactRoutes = require('./routes/contact');
const aboutRoutes = require('./routes/about');
const portfolioContextRoutes = require('./routes/portfolioContext');
const chatRoutes = require('./routes/chat');
const authRoutes = require('./routes/auth');

// API Routes
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

// Root route for testing
app.get('/', (req, res) => {
  res.send('Portfolio API is running...');
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});


// ###################################################################################################
// const express = require('express');
// const cors = require('cors');
// require('dotenv').config();

// const app = express();

// // Middleware
// app.use(cors());
// app.use(express.json());

// // Import Routes
// const profileRoutes = require('./routes/profile');
// const experienceRoutes = require('./routes/experience');
// const projectRoutes = require('./routes/projects');
// const certificationRoutes = require('./routes/certifications');
// const educationRoutes = require('./routes/education');
// const contactRoutes = require('./routes/contact');
// const aboutRoutes = require('./routes/about');
// const portfolioContextRoutes = require('./routes/portfolioContext');
// const chatRoutes = require('./routes/chat');
// const authRoutes = require('./routes/auth');

// // API Routes
// app.use('/api/auth', authRoutes);
// app.use('/api/profile', profileRoutes);
// app.use('/api/experience', experienceRoutes);
// app.use('/api/projects', projectRoutes);
// app.use('/api/certifications', certificationRoutes);
// app.use('/api/education', educationRoutes);
// app.use('/api/contact', contactRoutes);
// app.use('/api/about', aboutRoutes);
// app.use('/api/portfolio-context', portfolioContextRoutes);
// app.use('/api/chat', chatRoutes);

// // Root test
// app.get('/', (req, res) => {
//   res.send('Portfolio API is running...');
// });

// // ⭐ Wajib untuk Railway ⭐
// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });
