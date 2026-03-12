/**
 * @fileoverview Route produk
 * @module routes/productRoutes
 * @description Staff hanya bisa lihat daftar produk (untuk keperluan input transaksi)
 *              Admin bisa CRUD penuh
 */
const router            = require('express').Router();
const ProductController = require('../controllers/productController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

// Baca data — admin & staff boleh (staff perlu lihat produk saat input transaksi)
router.get('/summary',   authorize('admin'), ProductController.getSummary);
router.get('/low-stock', authorize('admin'), ProductController.getLowStock);
router.get('/',          authorize('admin', 'staff'), ProductController.getAll);
router.get('/:id',       authorize('admin', 'staff'), ProductController.getById);

// Tulis data — hanya admin
router.post('/',      authorize('admin'), ProductController.create);
router.put('/:id',    authorize('admin'), ProductController.update);
router.delete('/:id', authorize('admin'), ProductController.delete);

module.exports = router;
