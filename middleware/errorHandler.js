// Error handler global
// Menangkap semua error yang tidak tertangani di route atau controller

function errorHandler(err, req, res, next) {
  console.error('Error:', err.stack);

  const status  = err.statusCode || 500;
  const message = err.message   || 'Terjadi kesalahan pada server';

  return res.status(status).json({
    success: false,
    message,
    // Stack trace hanya ditampilkan di mode development
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
}

module.exports = errorHandler;
