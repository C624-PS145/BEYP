// const mysql = require('mysql2');
// require('dotenv').config();

// const pool = mysql.createPool({
//   host: process.env.DB_HOST,
//   user: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   database: process.env.DB_NAME,
//   port: process.env.DB_PORTDB,

//   waitForConnections: true,

//   // FREE TIER FIX
//   connectionLimit: 5,  
//   queueLimit: 0,

//   // Prevent MySQL free tier closing idle connections (penting!)
//   enableKeepAlive: true,
//   keepAliveInitialDelay: 0
// });

// module.exports = pool.promise();

const mysql = require('mysql2');
require('dotenv').config();

// --- Environment Variable Validation ---
// Vercel serverless functions will crash if required environment variables are missing.
// This check ensures that all necessary DB variables are present at startup.
const requiredEnv = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
const missingEnv = requiredEnv.filter(envVar => !process.env[envVar]);

if (missingEnv.length > 0) {
  // This will stop the serverless function from starting and provide a clear error in the Vercel logs.
  throw new Error(`FATAL ERROR: Missing required environment variables for database connection: ${missingEnv.join(', ')}`);
}
// ------------------------------------

// --- SSL Configuration ---
// Cloud databases (often used with Vercel) typically require an SSL connection.
// Set DB_SSL=true in your Vercel environment variables to enable it.
let sslConfig;
if (process.env.DB_SSL === 'true') {
  sslConfig = {
    // For some DB providers, you might need to allow self-signed certificates.
    // Set DB_SSL_REJECT_UNAUTHORIZED=false in Vercel if needed. Defaults to true for security.
    rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false'
  };
}
// -----------------------

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: sslConfig // Add SSL config to the pool if it's defined
});

module.exports = pool.promise();