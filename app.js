// Entry point aplikasi
// Menginisialisasi Express, middleware, routes, dan koneksi database

require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const morgan  = require('morgan');
const path    = require('path');

const { sequelize }     = require('./config/database');
const productRoutes     = require('./routes/productRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const authRoutes        = require('./routes/authRoutes');
const categoryRoutes    = require('./routes/categoryRoutes');
const errorHandler      = require('./middleware/errorHandler');

const app  = express();
const PORT = process.env.PORT || 3000;

// Middleware umum
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Routing API
app.use('/api/auth',         authRoutes);
app.use('/api/products',     productRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/categories',   categoryRoutes);

// Semua request selain API diarahkan ke frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handler diletakkan paling akhir
app.use(errorHandler);

// Sinkronisasi tabel lalu jalankan server
sequelize.sync({ alter: true })
  .then(() => {
    console.log('Database tersinkronisasi');
    app.listen(PORT, () => {
      console.log(`Server berjalan di http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('Gagal terhubung ke database:', err.message);
  });

module.exports = app;
