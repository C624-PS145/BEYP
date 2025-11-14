// const express = require('express');
// const cors = require('cors');
// require('dotenv').config();

// const app = express();
// const PORT = process.env.PORT || 5000;

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

// // Root route for testing
// app.get('/', (req, res) => {
//   res.send('Portfolio API is running...');
// });

// app.listen(PORT, () => {
//   console.log(`Server is running on http://localhost:${PORT}`);
// });

const express = require('express');
const cors = require('cors');
require('dotenv').config();

// --- Vercel Startup Validation ---
// A comprehensive check for all required environment variables.
// Vercel's "FUNCTION_INVOCATION_FAILED" error is often caused by a missing variable.
// This block will crash the server intentionally with a clear, debuggable message in the Vercel logs.
const requiredEnvVars = [
    'DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME', // Database
    'JWT_SECRET',                                  // Auth
    'CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET', // Cloudinary
    'API_KEY'                                      // Google Gemini API Key for Chatbot
];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingVars.length > 0) {
    const errorMessage = `FATAL ERROR: Missing required environment variables: ${missingVars.join(', ')}. Please add them to your Vercel project settings.`;
    console.error(errorMessage);
    // This will cause the function to fail, but the log will show the specific reason.
    throw new Error(errorMessage);
}
// --- End Validation ---

const app = express();

// Whitelist of allowed origins for CORS
const allowedOrigins = [
  'http://localhost:9000', // Frontend dev server
  'http://localhost:5174', // Admin panel dev server
  process.env.FRONTEND_URL, // Deployed frontend URL from .env
  process.env.ADMIN_URL     // Deployed admin panel URL from .env
].filter(Boolean); // Filter out any undefined/empty values from process.env

const corsOptions = {
  origin: function (origin, callback) {
    // Log incoming details for easier debugging on Vercel
    console.log(`CORS check: Request from origin [${origin}]`);
    console.log(`Whitelist: [${allowedOrigins.join(', ')}]`);

    // Allow requests with no origin (like Postman, curl, or server-to-server)
    if (!origin) {
      console.log('CORS check: Allowing request with no origin.');
      return callback(null, true);
    }

    // Normalize the origin by removing any trailing slash.
    // This handles cases where the browser sends 'http://localhost:9000/' instead of 'http://localhost:9000'.
    const normalizedOrigin = origin.endsWith('/') ? origin.slice(0, -1) : origin;

    if (allowedOrigins.includes(normalizedOrigin)) {
      console.log(`CORS check: Normalized origin [${normalizedOrigin}] is in the whitelist. Allowing.`);
      callback(null, true);
    } else {
      const msg = `CORS check: Origin [${origin}] (normalized to [${normalizedOrigin}]) is NOT in the whitelist. Blocking.`;
      console.error(msg);
      callback(new Error('The CORS policy for this site does not allow access from the specified Origin.'), false);
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
};

// Middleware
// The single app.use(cors(corsOptions)) handles all requests, including pre-flight OPTIONS.
app.use(cors(corsOptions));

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
const uploadRoutes = require('./routes/upload');
const technologyRoutes = require('./routes/technologies');

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
app.use('/api/upload', uploadRoutes);
app.use('/api/technologies', technologyRoutes);

// Root route for testing
app.get('/', (req, res) => {
  res.send('Portfolio API is running...');
});

module.exports = app;