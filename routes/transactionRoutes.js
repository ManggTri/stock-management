/**
 * @fileoverview Route transaksi stok
 * @module routes/transactionRoutes
 * @description Staff hanya bisa akses stok masuk & keluar
 *              Admin bisa akses semua termasuk riwayat
 */
const router                = require('express').Router();
const TransactionController = require('../controllers/transactionController');
const { authenticate, authorize } = require('../middleware/auth');

// Semua route butuh login
router.use(authenticate);

// Stok masuk & keluar — admin dan staff boleh
router.post('/in',  authorize('admin', 'staff'), TransactionController.stockIn);
router.post('/out', authorize('admin', 'staff'), TransactionController.stockOut);

// Riwayat transaksi — hanya admin
router.get('/', authorize('admin', 'staff'), TransactionController.getHistory);

module.exports = router;
