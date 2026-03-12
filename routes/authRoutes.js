/**
 * @fileoverview Route autentikasi
 * @module routes/authRoutes
 * @description Register hanya bisa dilakukan oleh admin
 */
const router           = require('express').Router();
const AuthController   = require('../controllers/authController');
const { authenticate, authorize } = require('../middleware/auth');

// Login - publik
router.post('/login', AuthController.login);

// Register - hanya admin yang bisa buat akun baru
router.post('/register', authenticate, authorize('admin'), AuthController.register);

// Profil
router.get('/profile', authenticate, AuthController.getProfile);

module.exports = router;
