// Seeder: Data awal kategori produk
// Jalankan via: npm run seed

'use strict';

module.exports = {
  up: async (queryInterface) => {
    const now = new Date();

    await queryInterface.bulkInsert('categories', [
      { name: 'Makanan',    description: 'Beras, mie, tepung, dan sejenisnya',       createdAt: now, updatedAt: now },
      { name: 'Minuman',    description: 'Air mineral, jus, susu, dan sejenisnya',   createdAt: now, updatedAt: now },
      { name: 'Kebersihan', description: 'Sabun, detergen, pembersih lantai',        createdAt: now, updatedAt: now },
      { name: 'Snack',      description: 'Keripik, biskuit, permen, coklat',         createdAt: now, updatedAt: now },
      { name: 'Lainnya',    description: 'Produk yang tidak masuk kategori lain',    createdAt: now, updatedAt: now },
    ], {});
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('categories', null, {});
  },
};
