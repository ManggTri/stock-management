// Kelas dasar yang diwarisi oleh semua model
// Menyediakan method umum seperti format tanggal dan toJSON

const { Model, DataTypes } = require('sequelize');

class BaseModel extends Model {

  // Mengembalikan tanggal dibuat dalam format lokal Indonesia
  getCreatedAtFormatted() {
    return new Date(this.createdAt).toLocaleString('id-ID');
  }

  // Mengembalikan tanggal diperbarui dalam format lokal Indonesia
  getUpdatedAtFormatted() {
    return new Date(this.updatedAt).toLocaleString('id-ID');
  }

  // Setiap model turunan bisa override method ini untuk menambah field tambahan
  toJSON() {
    return {
      ...super.toJSON(),
      createdAtFormatted: this.getCreatedAtFormatted(),
      updatedAtFormatted: this.getUpdatedAtFormatted(),
    };
  }
}

module.exports = { BaseModel, DataTypes };
