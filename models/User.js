// Model User
// Login menggunakan username (tanpa email)
// Password selalu disimpan dalam bentuk hash, tidak pernah plaintext

const bcrypt                   = require('bcryptjs');
const { BaseModel, DataTypes } = require('./BaseModel');
const { sequelize }            = require('../config/database');

class User extends BaseModel {

  // Bandingkan password yang diketik dengan hash yang tersimpan di database
  async validatePassword(password) {
    return bcrypt.compare(password, this.password);
  }

  // Pastikan field password tidak ikut terkirim ke client
  toJSON() {
    const data = super.toJSON();
    delete data.password;
    return data;
  }
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: { notEmpty: true, len: [2, 100] },
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      validate: { notEmpty: true },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    // 'admin' punya akses penuh, 'staff' hanya bisa stok masuk & keluar
    role: {
      type: DataTypes.ENUM('admin', 'staff'),
      defaultValue: 'staff',
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    hooks: {
      // Hash otomatis sebelum data disimpan
      beforeCreate: async (user) => {
        user.password = await bcrypt.hash(user.password, 10);
      },
      beforeUpdate: async (user) => {
        if (user.changed('password')) {
          user.password = await bcrypt.hash(user.password, 10);
        }
      },
    },
  }
);

module.exports = User;
