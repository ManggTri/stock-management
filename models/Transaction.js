// Model Transaction
// Setiap perubahan stok — baik masuk maupun keluar — dicatat di tabel ini

const { BaseModel, DataTypes } = require('./BaseModel');
const { sequelize }            = require('../config/database');

class Transaction extends BaseModel {

  static get TYPES() {
    return { IN: 'in', OUT: 'out' };
  }

  isStockIn() {
    return this.type === Transaction.TYPES.IN;
  }

  // Label yang ditampilkan ke pengguna
  getTypeLabel() {
    if (this.type === Transaction.TYPES.IN) {
      return 'Stok Masuk';
    } else {
      return 'Stok Keluar';
    }
  }

  getTotalValue() {
    return this.quantity * (this.pricePerUnit || 0);
  }

  toJSON() {
    return {
      ...super.toJSON(),
      typeLabel:  this.getTypeLabel(),
      totalValue: this.getTotalValue(),
    };
  }
}

Transaction.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    // 'in' = barang masuk, 'out' = barang keluar
    type: {
      type: DataTypes.ENUM('in', 'out'),
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 1 },
    },
    pricePerUnit: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'Transaction',
    tableName: 'transactions',
  }
);

module.exports = Transaction;
