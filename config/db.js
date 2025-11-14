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

/**
 * Singleton Pattern untuk Koneksi Database di Lingkungan Serverless.
 *
 * Di lingkungan serverless seperti Vercel, setiap permintaan bisa memicu
 * instansi fungsi baru (cold start), yang akan menjalankan kode ini dari awal.
 * Tanpa pola singleton, ini akan membuat pool koneksi baru setiap saat,
 * yang dengan cepat menghabiskan batas koneksi database.
 *
 * Dengan menyimpan pool dalam variabel global/cache (di luar handler),
 * kita memastikan bahwa instansi fungsi yang "hangat" (warm) akan menggunakan
 * kembali pool yang sudah ada, bukan membuat yang baru.
 */

// 1. Deklarasikan variabel untuk cache pool di luar fungsi.
// Variabel ini akan tetap ada selama container fungsi serverless "hangat".
let cachedPool = null;

const createDbPool = () => {
  console.log('Creating new database connection pool...');
  const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORTDB,

    waitForConnections: true,

    // FREE TIER FIX
    connectionLimit: 5,  
    queueLimit: 0,

    // Mencegah MySQL free tier menutup koneksi yang idle (penting!)
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
  });

  return pool.promise();
};


const getDbPool = () => {
  // 2. Jika pool sudah ada di cache, langsung kembalikan.
  if (cachedPool) {
    console.log('Reusing cached database connection pool.');
    return cachedPool;
  }
  
  // 3. Jika tidak ada, buat pool baru dan simpan di cache.
  cachedPool = createDbPool();
  return cachedPool;
};

// 4. Ekspor fungsi yang mengelola singleton, bukan langsung `pool.promise()`.
// Setiap controller sekarang akan memanggil getDbPool() untuk mendapatkan koneksi.
// Namun, karena `require` di Node.js meng-cache modul, kita cukup mengekspor
// hasil pemanggilan `getDbPool()` sekali saja.
module.exports = getDbPool();