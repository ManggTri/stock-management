/**
 * @fileoverview Route kategori
 * @module routes/categoryRoutes
 */
const router             = require('express').Router();
const CategoryController = require('../controllers/categoryController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);
router.get('/',      CategoryController.getAll);
router.post('/',     authorize('admin'), CategoryController.create);
router.put('/:id',   authorize('admin'), CategoryController.update);
router.delete('/:id', authorize('admin'), CategoryController.delete);

module.exports = router;
