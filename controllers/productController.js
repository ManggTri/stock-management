// Controller produk
// Menangani CRUD produk dan query stok

const { Product, Category } = require('../models/index');
const StockService          = require('../services/stockService');

const ProductController = {

  // Ambil semua produk dengan paginasi, filter pencarian, dan filter kategori
  async getAll(req, res) {
    try {
      const { page = 1, limit = 10, search, categoryId, status } = req.query;
      const offset = (parseInt(page) - 1) * parseInt(limit);
      const where  = { isActive: true };
      const { Op } = require('sequelize');

      if (search) {
        where[Op.or] = [
          { name: { [Op.like]: `%${search}%` } },
          { sku:  { [Op.like]: `%${search}%` } },
        ];
      }

      if (categoryId) {
        where.categoryId = parseInt(categoryId);
      }

      const { count, rows } = await Product.findAndCountAll({
        where,
        include: [{ association: 'category', attributes: ['id', 'name'] }],
        order:   [['name', 'ASC']],
        limit:   parseInt(limit),
        offset,
      });

      // Filter berdasarkan status stok dilakukan setelah query
      let products = rows.map((p) => p.toJSON());
      if (status) {
        products = products.filter((p) => p.stockStatus === status);
      }

      return res.json({
        success:     true,
        data:        products,
        totalCount:  count,
        totalPages:  Math.ceil(count / parseInt(limit)),
        currentPage: parseInt(page),
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  // Ambil satu produk beserta 5 transaksi terakhirnya
  async getById(req, res) {
    try {
      const product = await Product.findOne({
        where:   { id: req.params.id, isActive: true },
        include: [
          { association: 'category', attributes: ['id', 'name'] },
          {
            association: 'transactions',
            limit:       5,
            order:       [['createdAt', 'DESC']],
            include:     [{ association: 'user', attributes: ['id', 'name'] }],
          },
        ],
      });

      if (!product) {
        return res.status(404).json({ success: false, message: 'Produk tidak ditemukan' });
      }

      return res.json({ success: true, data: product.toJSON() });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  async create(req, res) {
    try {
      const { sku, name, description, price, costPrice, stock, unit, categoryId } = req.body;

      const sudahAda = await Product.findOne({ where: { sku } });
      if (sudahAda) {
        return res.status(409).json({ success: false, message: `SKU ${sku} sudah digunakan` });
      }

      const product = await Product.create({
        sku, name, description, price, costPrice,
        stock: stock || 0, unit, categoryId,
      });

      return res.status(201).json({
        success: true,
        message: 'Produk berhasil ditambahkan',
        data:    product.toJSON(),
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  async update(req, res) {
    try {
      const product = await Product.findByPk(req.params.id);
      if (!product) {
        return res.status(404).json({ success: false, message: 'Produk tidak ditemukan' });
      }

      const { name, description, price, costPrice, unit, categoryId } = req.body;
      await product.update({ name, description, price, costPrice, unit, categoryId });

      return res.json({
        success: true,
        message: 'Produk berhasil diperbarui',
        data:    product.toJSON(),
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  // Soft delete — produk tidak benar-benar dihapus dari database
  async delete(req, res) {
    try {
      const product = await Product.findByPk(req.params.id);
      if (!product) {
        return res.status(404).json({ success: false, message: 'Produk tidak ditemukan' });
      }

      await product.update({ isActive: false });
      return res.json({ success: true, message: 'Produk berhasil dihapus' });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  async getLowStock(req, res) {
    try {
      const products = await StockService.getLowStockProducts();
      return res.json({ success: true, data: products, count: products.length });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  async getSummary(req, res) {
    try {
      const summary = await StockService.getStockSummary();
      return res.json({ success: true, data: summary });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },
};

module.exports = ProductController;
