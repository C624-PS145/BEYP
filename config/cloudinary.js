// const cloudinary = require('cloudinary').v2;
// require('dotenv').config();

// // Configure Cloudinary with your credentials
// // Make sure to set these in your .env file
// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });

// module.exports = cloudinary;


const cloudinary = require('cloudinary').v2;

// Configure Cloudinary with your credentials
// Make sure to set these in your .env file
// dotenv and variable validation are now handled centrally in server.js
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

module.exports = cloudinary;