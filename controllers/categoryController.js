// Controller kategori produk

const { Category } = require('../models/index');

const CategoryController = {

  async getAll(req, res) {
    try {
      const categories = await Category.findAll({ order: [['name', 'ASC']] });
      return res.json({ success: true, data: categories });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  async create(req, res) {
    try {
      const { name, description } = req.body;
      if (!name) {
        return res.status(400).json({ success: false, message: 'Nama kategori wajib diisi' });
      }
      const category = await Category.create({ name, description });
      return res.status(201).json({ success: true, data: category });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  async update(req, res) {
    try {
      const cat = await Category.findByPk(req.params.id);
      if (!cat) {
        return res.status(404).json({ success: false, message: 'Kategori tidak ditemukan' });
      }
      await cat.update(req.body);
      return res.json({ success: true, data: cat });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  async delete(req, res) {
    try {
      const cat = await Category.findByPk(req.params.id);
      if (!cat) {
        return res.status(404).json({ success: false, message: 'Kategori tidak ditemukan' });
      }
      await cat.destroy();
      return res.json({ success: true, message: 'Kategori berhasil dihapus' });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },
};

module.exports = CategoryController;
