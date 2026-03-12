// Controller transaksi stok
// Staff hanya bisa mengakses endpoint stok masuk dan stok keluar

const StockService = require('../services/stockService');

const TransactionController = {

  // Catat stok masuk (pembelian / penerimaan dari supplier)
  async stockIn(req, res) {
    try {
      const { productId, quantity, price, notes } = req.body;
      const userId = req.user?.id;

      const result = await StockService.addStock(
        parseInt(productId),
        parseInt(quantity),
        parseFloat(price) || 0,
        notes,
        userId
      );

      return res.status(201).json({
        success: true,
        message: `Stok berhasil ditambahkan. ${result.oldStock} → ${result.product.stock}`,
        data:    result,
      });
    } catch (error) {
      return res.status(400).json({ success: false, message: error.message });
    }
  },

  // Catat stok keluar (penjualan / pengeluaran barang)
  async stockOut(req, res) {
    try {
      const { productId, quantity, price, notes } = req.body;
      const userId = req.user?.id;

      const result = await StockService.removeStock(
        parseInt(productId),
        parseInt(quantity),
        parseFloat(price) || 0,
        notes,
        userId
      );

      return res.status(201).json({
        success: true,
        message: `Stok berhasil dikurangi. ${result.oldStock} → ${result.product.stock}`,
        data:    result,
      });
    } catch (error) {
      return res.status(400).json({ success: false, message: error.message });
    }
  },

  // Riwayat semua transaksi — hanya admin yang bisa mengakses
  async getHistory(req, res) {
    try {
      const { page = 1, limit = 10, type } = req.query;
      const result = await StockService.getTransactionHistory(
        parseInt(page),
        parseInt(limit),
        type
      );
      return res.json({ success: true, ...result });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },
};

module.exports = TransactionController;
