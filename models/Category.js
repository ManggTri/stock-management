// Model Category
// Digunakan untuk mengelompokkan produk agar lebih mudah dicari

const { BaseModel, DataTypes } = require('./BaseModel');
const { sequelize }            = require('../config/database');

class Category extends BaseModel {

  // Kembalikan nama kategori dengan ikon sesuai jenisnya
  getLabel() {
    const icons = {
      makanan:    '🍎',
      minuman:    '🥤',
      kebersihan: '🧴',
      snack:      '🍪',
      lainnya:    '📦',
    };
    const icon = icons[this.name.toLowerCase()] || '📦';
    return `${icon} ${this.name}`;
  }
}

Category.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(80),
      allowNull: false,
      unique: true,
      validate: { notEmpty: true },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'Category',
    tableName: 'categories',
  }
);

module.exports = Category;
