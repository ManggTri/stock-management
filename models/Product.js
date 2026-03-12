// Model Product
// Menyimpan data produk beserta logika perhitungan stok dan nilai

const { BaseModel, DataTypes } = require("./BaseModel");
const { sequelize } = require("../config/database");

class Product extends BaseModel {
  // Batas stok sebelum muncul peringatan di dashboard
  static get LOW_STOCK_THRESHOLD() {
    return 10;
  }

  static get STOCK_STATUS() {
    return {
      AVAILABLE: "available",
      LOW: "low",
      OUT: "out_of_stock",
    };
  }

  // Cek apakah stok cukup untuk memenuhi permintaan sejumlah qty
  hasEnoughStock(qty) {
    return this.stock >= qty;
  }

  // Tentukan status stok berdasarkan jumlah yang tersisa
  getStockStatus() {
    if (this.stock === 0) {
      return Product.STOCK_STATUS.OUT;
    } else if (this.stock <= Product.LOW_STOCK_THRESHOLD) {
      return Product.STOCK_STATUS.LOW;
    } else {
      return Product.STOCK_STATUS.AVAILABLE;
    }
  }

  // Hitung total nilai stok dalam rupiah
  calculateStockValue() {
    return this.price * this.stock;
  }

  // Format harga ke tampilan Rupiah
  formatPrice() {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(this.price);
  }

  // Tambahkan field kalkulasi saat data dikirim ke client
  toJSON() {
    return {
      ...super.toJSON(),
      stockStatus: this.getStockStatus(),
      stockValue: this.calculateStockValue(),
      priceFormatted: this.formatPrice(),
      isLowStock: this.stock <= Product.LOW_STOCK_THRESHOLD,
    };
  }
}

Product.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    sku: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      validate: { notEmpty: true },
    },
    name: {
      type: DataTypes.STRING(200),
      allowNull: false,
      validate: { notEmpty: true, len: [2, 200] },
    },
    description: { type: DataTypes.TEXT, allowNull: true },
    price: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0,
      validate: { min: 0 },
    },
    costPrice: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
      defaultValue: 0,
    },
    stock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: { min: 0 },
    },
    unit: { type: DataTypes.STRING(20), allowNull: false, defaultValue: "pcs" },
    categoryId: { type: DataTypes.INTEGER, allowNull: true },
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
  },
  { sequelize, modelName: "Product", tableName: "products" }
);

module.exports = Product;
