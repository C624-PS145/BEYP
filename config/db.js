const mysql = require('mysql2/promise');
require('dotenv').config();

let pool;

if (!pool) {
  pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORTDB,

    waitForConnections: true,

    // Fix limit FREE TIER 
    connectionLimit: 5,
    maxIdle: 5,
    idleTimeout: 60000, // 60 detik

    queueLimit: 0,

    // Prevent DB free-tier dari idle disconnect
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
  });
}

module.exports = pool;
