// Middleware autentikasi dan otorisasi
// Setiap request ke route yang dilindungi harus melewati kedua fungsi ini

const jwt = require('jsonwebtoken');

// Verifikasi token JWT dari header Authorization
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Token tidak ditemukan, silakan login terlebih dahulu' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Token tidak valid atau sudah kadaluarsa' });
  }
}

// Periksa apakah role user termasuk dalam daftar yang diizinkan
// Contoh: authorize('admin') atau authorize('admin', 'staff')
function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Belum login' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Akses ditolak. Diperlukan hak akses: ${roles.join(' atau ')}`,
      });
    }
    next();
  };
}

module.exports = { authenticate, authorize };
