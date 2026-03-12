// Konfigurasi koneksi ke PostgreSQL menggunakan Sequelize
// Kredensial diambil dari file .env agar tidak hardcode di kode

const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host:    process.env.DB_HOST || 'localhost',
    port:    process.env.DB_PORT || 5432,
    dialect: 'postgres',
    // Tampilkan query SQL hanya saat development
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max:     5,
      min:     0,
      acquire: 30000,
      idle:    10000,
    },
  }
);

async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('Koneksi PostgreSQL berhasil');
  } catch (error) {
    console.error('Koneksi database gagal:', error.message);
    throw error;
  }
}

module.exports = { sequelize, testConnection };
