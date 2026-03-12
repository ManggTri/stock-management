// Controller autentikasi
// Menangani login dan pembuatan akun baru (hanya oleh admin)

const jwt      = require('jsonwebtoken');
const { User } = require('../models/index');

const AuthController = {

  // Buat akun baru — hanya bisa diakses oleh admin
  async register(req, res) {
    try {
      const { name, username, password, role } = req.body;

      if (!name || !username || !password) {
        return res.status(400).json({ success: false, message: 'Nama, username, dan password wajib diisi' });
      }

      const sudahAda = await User.findOne({ where: { username } });
      if (sudahAda) {
        return res.status(409).json({ success: false, message: 'Username sudah digunakan' });
      }

      const user = await User.create({ name, username, password, role: role || 'staff' });
      return res.status(201).json({
        success: true,
        message: 'Akun berhasil dibuat',
        data: user.toJSON(),
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  // Login menggunakan username dan password
  async login(req, res) {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ success: false, message: 'Username dan password wajib diisi' });
      }

      const user = await User.findOne({ where: { username, isActive: true } });
      if (!user) {
        return res.status(401).json({ success: false, message: 'Username atau password salah' });
      }

      const valid = await user.validatePassword(password);
      if (!valid) {
        return res.status(401).json({ success: false, message: 'Username atau password salah' });
      }

      const token = jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '8h' }
      );

      return res.json({
        success: true,
        message: 'Login berhasil',
        token,
        user: user.toJSON(),
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  // Kembalikan data profil user yang sedang login
  async getProfile(req, res) {
    try {
      const user = await User.findByPk(req.user.id);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
      }
      return res.json({ success: true, data: user.toJSON() });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },
};

module.exports = AuthController;
