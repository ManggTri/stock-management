// Service layer untuk logika bisnis stok
// Semua operasi perubahan stok diproses di sini, bukan di controller

const { Product, Transaction } = require('../models/index');
const { sequelize }            = require('../config/database');

const StockService = {

  // Tambah stok produk (pembelian / penerimaan barang)
  // Proses dijalankan dalam satu transaksi database agar atomic
  async addStock(productId, quantity, price, notes, userId) {
    const result = await sequelize.transaction(async (t) => {
      const product = await Product.findByPk(productId, { transaction: t });

      if (!product) {
        throw new Error(`Produk dengan ID ${productId} tidak ditemukan`);
      }

      if (!product.isActive) {
        throw new Error('Produk tidak aktif');
      }

      const oldStock = product.stock;
      product.stock  = oldStock + quantity;
      await product.save({ transaction: t });

      const transaction = await Transaction.create(
        { type: 'in', quantity, pricePerUnit: price, notes, productId, userId },
        { transaction: t }
      );

      return { product, transaction, oldStock };
    });

    return result;
  },

  // Kurangi stok produk (penjualan / pengeluaran barang)
  async removeStock(productId, quantity, price, notes, userId) {
    const result = await sequelize.transaction(async (t) => {
      const product = await Product.findByPk(productId, { transaction: t });

      if (!product) {
        throw new Error(`Produk dengan ID ${productId} tidak ditemukan`);
      }

      if (!product.hasEnoughStock(quantity)) {
        throw new Error(
          `Stok tidak mencukupi. Tersedia: ${product.stock}, diminta: ${quantity}`
        );
      }

      const oldStock = product.stock;
      product.stock  = oldStock - quantity;
      await product.save({ transaction: t });

      const transaction = await Transaction.create(
        { type: 'out', quantity, pricePerUnit: price, notes, productId, userId },
        { transaction: t }
      );

      return { product, transaction, oldStock };
    });

    return result;
  },

  // Ambil daftar produk yang stoknya sudah menipis atau habis
  async getLowStockProducts() {
    const semuaProduk = await Product.findAll({ where: { isActive: true } });

    const hasilFilter = [];
    semuaProduk.forEach((product) => {
      if (product.stock <= Product.LOW_STOCK_THRESHOLD) {
        hasilFilter.push({
          id:          product.id,
          sku:         product.sku,
          name:        product.name,
          stock:       product.stock,
          stockStatus: product.getStockStatus(),
          unit:        product.unit,
        });
      }
    });

    return hasilFilter;
  },

  // Ringkasan kondisi stok untuk ditampilkan di dashboard
  async getStockSummary() {
    const produk = await Product.findAll({ where: { isActive: true } });

    let totalProduk     = 0;
    let totalNilaiStok  = 0;
    let stokHabis       = 0;
    let stokRendah      = 0;

    for (const p of produk) {
      totalProduk++;
      totalNilaiStok += p.calculateStockValue();

      const status = p.getStockStatus();
      if (status === Product.STOCK_STATUS.OUT) {
        stokHabis++;
      } else if (status === Product.STOCK_STATUS.LOW) {
        stokRendah++;
      }
    }

    return {
      totalProducts:  totalProduk,
      totalStockValue: totalNilaiStok,
      outOfStock:     stokHabis,
      lowStock:       stokRendah,
      available:      totalProduk - stokHabis - stokRendah,
    };
  },

  // Ambil riwayat transaksi dengan paginasi dan filter tipe
  async getTransactionHistory(page = 1, limit = 10, type = null) {
    const offset = (page - 1) * limit;
    const where  = {};

    if (type === 'in' || type === 'out') {
      where.type = type;
    }

    const { count, rows } = await Transaction.findAndCountAll({
      where,
      include: [
        { association: 'product', attributes: ['id', 'name', 'sku', 'unit'] },
        { association: 'user',    attributes: ['id', 'name'] },
      ],
      order:  [['createdAt', 'DESC']],
      limit,
      offset,
    });

    return {
      transactions: rows.map((t) => t.toJSON()),
      totalCount:   count,
      totalPages:   Math.ceil(count / limit),
      currentPage:  page,
    };
  },

  // Cari produk berdasarkan nama atau SKU
  async searchProducts(query) {
    const { Op } = require('sequelize');
    const hasil = await Product.findAll({
      where: {
        isActive: true,
        [Op.or]: [
          { name: { [Op.like]: `%${query}%` } },
          { sku:  { [Op.like]: `%${query}%` } },
        ],
      },
      include: [{ association: 'category', attributes: ['id', 'name'] }],
      limit: 20,
    });

    return hasil.map((p) => p.toJSON());
  },
};

module.exports = StockService;
