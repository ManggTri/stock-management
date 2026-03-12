// Mengimpor semua model dan mendefinisikan relasi antar tabel

const User        = require('./User');
const Product     = require('./Product');
const Transaction = require('./Transaction');
const Category    = require('./Category');

// Satu kategori bisa punya banyak produk
Category.hasMany(Product, { foreignKey: 'categoryId', as: 'products' });
Product.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });

// Satu produk bisa punya banyak transaksi
Product.hasMany(Transaction, { foreignKey: 'productId', as: 'transactions' });
Transaction.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

// Satu user bisa melakukan banyak transaksi
User.hasMany(Transaction, { foreignKey: 'userId', as: 'transactions' });
Transaction.belongsTo(User, { foreignKey: 'userId', as: 'user' });

module.exports = { User, Product, Transaction, Category };
