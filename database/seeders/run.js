// Script utama untuk menjalankan semua seeder secara berurutan
// Jalankan dengan: npm run seed

require("dotenv").config({
  path: require("path").join(__dirname, "..", "..", ".env"),
});

const { sequelize } = require("../../config/database");
const { User, Product, Transaction, Category } = require("../../models/index");
const bcrypt = require("bcryptjs");

async function runSeed() {
  try {
    console.log("Menghubungkan ke database...");
    await sequelize.sync({ alter: true });
    console.log("Koneksi berhasil. Memulai seeding...\n");

    // ── Kategori ─────────────────────────────────────────────────
    console.log("Mengisi tabel categories...");
    const daftarKategori = [
      { name: "Makanan", description: "Beras, mie, tepung, dan sejenisnya" },
      {
        name: "Minuman",
        description: "Air mineral, jus, susu, dan sejenisnya",
      },
      { name: "Kebersihan", description: "Sabun, detergen, pembersih lantai" },
      { name: "Snack", description: "Keripik, biskuit, permen, coklat" },
      { name: "Lainnya", description: "Produk yang tidak masuk kategori lain" },
    ];

    const kategoriTersimpan = [];
    for (const data of daftarKategori) {
      const [kat] = await Category.findOrCreate({
        where: { name: data.name },
        defaults: data,
      });
      kategoriTersimpan.push(kat);
      console.log(`  + ${kat.name}`);
    }

    // ── Users ─────────────────────────────────────────────────────
    console.log("\nMengisi tabel users...");
    const daftarUser = [
      {
        name: "Administrator",
        username: "admin",
        password: "admin123",
        role: "admin",
      },
      {
        name: "Budi Santoso",
        username: "budi",
        password: "budi123",
        role: "staff",
      },
      {
        name: "Siti Rahayu",
        username: "siti",
        password: "siti123",
        role: "staff",
      },
    ];

    const userTersimpan = [];
    for (const data of daftarUser) {
      const [user, baru] = await User.findOrCreate({
        where: { username: data.username },
        defaults: data,
      });
      userTersimpan.push(user);
      console.log(
        `  + ${user.username} (${user.role}) ${
          baru ? "- dibuat baru" : "- sudah ada"
        }`
      );
    }

    // ── Produk ────────────────────────────────────────────────────
    console.log("\nMengisi tabel products...");
    const [catMakanan, catMinuman, catKebersihan, catSnack] = kategoriTersimpan;

    const daftarProduk = [
      {
        sku: "MKN-001",
        name: "Beras Premium 5kg",
        price: 72000,
        costPrice: 62000,
        stock: 150,
        unit: "sak",
        categoryId: catMakanan.id,
      },
      {
        sku: "MKN-002",
        name: "Mie Instan Goreng",
        price: 3500,
        costPrice: 2800,
        stock: 500,
        unit: "pcs",
        categoryId: catMakanan.id,
      },
      {
        sku: "MKN-003",
        name: "Tepung Terigu 1kg",
        price: 14000,
        costPrice: 11000,
        stock: 80,
        unit: "bungkus",
        categoryId: catMakanan.id,
      },
      {
        sku: "MKN-004",
        name: "Gula Pasir 1kg",
        price: 16000,
        costPrice: 13500,
        stock: 200,
        unit: "kg",
        categoryId: catMakanan.id,
      },
      {
        sku: "MKN-005",
        name: "Minyak Goreng 2L",
        price: 38000,
        costPrice: 32000,
        stock: 8,
        unit: "botol",
        categoryId: catMakanan.id,
      },
      {
        sku: "MNM-001",
        name: "Air Mineral 600ml",
        price: 4000,
        costPrice: 2500,
        stock: 300,
        unit: "botol",
        categoryId: catMinuman.id,
      },
      {
        sku: "MNM-002",
        name: "Susu UHT Coklat 250ml",
        price: 6500,
        costPrice: 5000,
        stock: 120,
        unit: "pcs",
        categoryId: catMinuman.id,
      },
      {
        sku: "MNM-003",
        name: "Teh Botol 350ml",
        price: 5000,
        costPrice: 3500,
        stock: 5,
        unit: "botol",
        categoryId: catMinuman.id,
      },
      {
        sku: "KBR-001",
        name: "Sabun Mandi Batang",
        price: 5500,
        costPrice: 4000,
        stock: 200,
        unit: "pcs",
        categoryId: catKebersihan.id,
      },
      {
        sku: "KBR-002",
        name: "Detergen Bubuk 800gr",
        price: 22000,
        costPrice: 18000,
        stock: 60,
        unit: "bungkus",
        categoryId: catKebersihan.id,
      },
      {
        sku: "KBR-003",
        name: "Pembersih Lantai 1L",
        price: 18000,
        costPrice: 14000,
        stock: 0,
        unit: "botol",
        categoryId: catKebersihan.id,
      },
      {
        sku: "SNK-001",
        name: "Keripik Singkong 200gr",
        price: 12000,
        costPrice: 9000,
        stock: 90,
        unit: "bungkus",
        categoryId: catSnack.id,
      },
      {
        sku: "SNK-002",
        name: "Biskuit Kelapa 130gr",
        price: 9000,
        costPrice: 7000,
        stock: 75,
        unit: "pcs",
        categoryId: catSnack.id,
      },
    ];

    const produkTersimpan = [];
    for (const data of daftarProduk) {
      const [produk, baru] = await Product.findOrCreate({
        where: { sku: data.sku },
        defaults: data,
      });
      produkTersimpan.push(produk);
      console.log(
        `  + [${produk.sku}] ${produk.name} — stok: ${produk.stock} ${produk.unit}`
      );
    }

    // ── Transaksi ──────────────────────────────────────────────────
    console.log("\nMengisi tabel transactions...");
    const admin = userTersimpan[0];
    const staff = userTersimpan[1];

    const daftarTransaksi = [
      {
        type: "in",
        productId: produkTersimpan[0].id,
        quantity: 50,
        pricePerUnit: 62000,
        notes: "Restok dari supplier Agro Jaya",
        userId: admin.id,
      },
      {
        type: "in",
        productId: produkTersimpan[1].id,
        quantity: 200,
        pricePerUnit: 2800,
        notes: "Pembelian awal bulan",
        userId: staff.id,
      },
      {
        type: "in",
        productId: produkTersimpan[5].id,
        quantity: 100,
        pricePerUnit: 2500,
        notes: "Restok air mineral",
        userId: staff.id,
      },
      {
        type: "in",
        productId: produkTersimpan[8].id,
        quantity: 100,
        pricePerUnit: 4000,
        notes: "Pembelian sabun mandi",
        userId: admin.id,
      },
      {
        type: "out",
        productId: produkTersimpan[0].id,
        quantity: 10,
        pricePerUnit: 72000,
        notes: "Penjualan ke pelanggan Bu Tini",
        userId: staff.id,
      },
      {
        type: "out",
        productId: produkTersimpan[1].id,
        quantity: 50,
        pricePerUnit: 3500,
        notes: "Penjualan eceran",
        userId: staff.id,
      },
      {
        type: "out",
        productId: produkTersimpan[5].id,
        quantity: 30,
        pricePerUnit: 4000,
        notes: "Penjualan ke warung Pak Bejo",
        userId: staff.id,
      },
      {
        type: "out",
        productId: produkTersimpan[3].id,
        quantity: 20,
        pricePerUnit: 16000,
        notes: "Penjualan gula pasir",
        userId: admin.id,
      },
    ];

    for (const data of daftarTransaksi) {
      await Transaction.create(data);
      const p = produkTersimpan.find((x) => x.id === data.productId);
      console.log(
        `  + ${data.type === "in" ? "MASUK" : "KELUAR"} ${p.name} x${
          data.quantity
        }`
      );
    }

    console.log("\n----------------------------------------");
    console.log("Seeding selesai.");
    console.log("----------------------------------------");
    console.log("Akun tersedia:");
    console.log("  admin / admin123  (Admin)");
    console.log("  budi  / budi123   (Staff)");
    console.log("  siti  / siti123   (Staff)");
    console.log("----------------------------------------\n");

    process.exit(0);
  } catch (err) {
    console.error("Seeding gagal:", err.message);
    process.exit(1);
  }
}

runSeed();
