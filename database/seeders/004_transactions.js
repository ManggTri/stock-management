// Seeder: Contoh riwayat transaksi stok
// userId 1 = admin, userId 2 = budi (staff)
// productId sesuai urutan insert di seeder 003_products

'use strict';

module.exports = {
  up: async (queryInterface) => {
    const now = new Date();

    await queryInterface.bulkInsert('transactions', [
      // Stok masuk
      { type: 'in',  productId: 1, quantity: 50,  pricePerUnit: 62000, notes: 'Restok dari supplier Agro Jaya',   userId: 1, createdAt: now, updatedAt: now },
      { type: 'in',  productId: 2, quantity: 200, pricePerUnit: 2800,  notes: 'Pembelian awal bulan',             userId: 2, createdAt: now, updatedAt: now },
      { type: 'in',  productId: 6, quantity: 100, pricePerUnit: 2500,  notes: 'Restok air mineral',               userId: 2, createdAt: now, updatedAt: now },
      { type: 'in',  productId: 9, quantity: 100, pricePerUnit: 4000,  notes: 'Pembelian sabun mandi',            userId: 1, createdAt: now, updatedAt: now },

      // Stok keluar
      { type: 'out', productId: 1, quantity: 10,  pricePerUnit: 72000, notes: 'Penjualan ke pelanggan Bu Tini',   userId: 2, createdAt: now, updatedAt: now },
      { type: 'out', productId: 2, quantity: 50,  pricePerUnit: 3500,  notes: 'Penjualan eceran',                userId: 2, createdAt: now, updatedAt: now },
      { type: 'out', productId: 6, quantity: 30,  pricePerUnit: 4000,  notes: 'Penjualan ke warung Pak Bejo',     userId: 2, createdAt: now, updatedAt: now },
      { type: 'out', productId: 4, quantity: 20,  pricePerUnit: 16000, notes: 'Penjualan gula pasir',             userId: 1, createdAt: now, updatedAt: now },
    ], {});
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('transactions', null, {});
  },
};
