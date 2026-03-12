// Seeder: Data produk awal toko grosir
// categoryId merujuk ke urutan insert di seeder 001_categories:
//   1 = Makanan, 2 = Minuman, 3 = Kebersihan, 4 = Snack

'use strict';

module.exports = {
  up: async (queryInterface) => {
    const now = new Date();

    await queryInterface.bulkInsert('products', [
      // Makanan (categoryId: 1)
      { sku: 'MKN-001', name: 'Beras Premium 5kg',     price: 72000, costPrice: 62000, stock: 150, unit: 'sak',     categoryId: 1, isActive: true, description: null, createdAt: now, updatedAt: now },
      { sku: 'MKN-002', name: 'Mie Instan Goreng',      price: 3500,  costPrice: 2800,  stock: 500, unit: 'pcs',     categoryId: 1, isActive: true, description: null, createdAt: now, updatedAt: now },
      { sku: 'MKN-003', name: 'Tepung Terigu 1kg',      price: 14000, costPrice: 11000, stock: 80,  unit: 'bungkus', categoryId: 1, isActive: true, description: null, createdAt: now, updatedAt: now },
      { sku: 'MKN-004', name: 'Gula Pasir 1kg',         price: 16000, costPrice: 13500, stock: 200, unit: 'kg',      categoryId: 1, isActive: true, description: null, createdAt: now, updatedAt: now },
      { sku: 'MKN-005', name: 'Minyak Goreng 2L',       price: 38000, costPrice: 32000, stock: 8,   unit: 'botol',   categoryId: 1, isActive: true, description: null, createdAt: now, updatedAt: now },

      // Minuman (categoryId: 2)
      { sku: 'MNM-001', name: 'Air Mineral 600ml',      price: 4000,  costPrice: 2500,  stock: 300, unit: 'botol',   categoryId: 2, isActive: true, description: null, createdAt: now, updatedAt: now },
      { sku: 'MNM-002', name: 'Susu UHT Coklat 250ml',  price: 6500,  costPrice: 5000,  stock: 120, unit: 'pcs',     categoryId: 2, isActive: true, description: null, createdAt: now, updatedAt: now },
      { sku: 'MNM-003', name: 'Teh Botol 350ml',        price: 5000,  costPrice: 3500,  stock: 5,   unit: 'botol',   categoryId: 2, isActive: true, description: null, createdAt: now, updatedAt: now },

      // Kebersihan (categoryId: 3)
      { sku: 'KBR-001', name: 'Sabun Mandi Batang',     price: 5500,  costPrice: 4000,  stock: 200, unit: 'pcs',     categoryId: 3, isActive: true, description: null, createdAt: now, updatedAt: now },
      { sku: 'KBR-002', name: 'Detergen Bubuk 800gr',   price: 22000, costPrice: 18000, stock: 60,  unit: 'bungkus', categoryId: 3, isActive: true, description: null, createdAt: now, updatedAt: now },
      { sku: 'KBR-003', name: 'Pembersih Lantai 1L',    price: 18000, costPrice: 14000, stock: 0,   unit: 'botol',   categoryId: 3, isActive: true, description: null, createdAt: now, updatedAt: now },

      // Snack (categoryId: 4)
      { sku: 'SNK-001', name: 'Keripik Singkong 200gr', price: 12000, costPrice: 9000,  stock: 90,  unit: 'bungkus', categoryId: 4, isActive: true, description: null, createdAt: now, updatedAt: now },
      { sku: 'SNK-002', name: 'Biskuit Kelapa 130gr',   price: 9000,  costPrice: 7000,  stock: 75,  unit: 'pcs',     categoryId: 4, isActive: true, description: null, createdAt: now, updatedAt: now },
    ], {});
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('products', null, {});
  },
};
