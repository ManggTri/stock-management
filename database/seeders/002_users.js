// Seeder: Akun pengguna awal
// Password sudah di-hash menggunakan bcrypt (cost factor 10)
// Password asli tercantum di komentar masing-masing baris

'use strict';

const bcrypt = require('bcryptjs');

module.exports = {
  up: async (queryInterface) => {
    const now = new Date();

    // Hash password sebelum disimpan
    const hashPass = (plain) => bcrypt.hashSync(plain, 10);

    await queryInterface.bulkInsert('users', [
      {
        name:      'Administrator',
        username:  'admin',
        password:  hashPass('admin123'), // login: admin / admin123
        role:      'admin',
        isActive:  true,
        createdAt: now,
        updatedAt: now,
      },
      {
        name:      'Budi Santoso',
        username:  'budi',
        password:  hashPass('budi123'),  // login: budi / budi123
        role:      'staff',
        isActive:  true,
        createdAt: now,
        updatedAt: now,
      },
      {
        name:      'Siti Rahayu',
        username:  'siti',
        password:  hashPass('siti123'),  // login: siti / siti123
        role:      'staff',
        isActive:  true,
        createdAt: now,
        updatedAt: now,
      },
    ], {});
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('users', null, {});
  },
};
