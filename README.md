# Stock Management — Toko Grosir

Aplikasi web manajemen stok berbasis Node.js + Express + PostgreSQL.

---

## Struktur Folder

```
stock-management/
├── app.js                        Entry point server
├── package.json
├── .env                          Konfigurasi environment (DB, JWT, dll)
│
├── config/
│   └── database.js               Koneksi PostgreSQL via Sequelize
│
├── database/
│   ├── migrations/               Definisi skema tabel
│   │   ├── 001_create_users.js
│   │   ├── 002_create_categories.js
│   │   ├── 003_create_products.js
│   │   └── 004_create_transactions.js
│   ├── seeders/                  Data awal / dummy
│   │   ├── run.js                Script utama (npm run seed)
│   │   ├── 001_categories.js
│   │   ├── 002_users.js
│   │   ├── 003_products.js
│   │   └── 004_transactions.js
│   └── backups/                  Tempat menyimpan backup manual
│
├── models/
│   ├── BaseModel.js              Kelas induk semua model
│   ├── User.js
│   ├── Product.js
│   ├── Transaction.js
│   ├── Category.js
│   └── index.js                  Relasi antar model
│
├── controllers/
│   ├── authController.js
│   ├── productController.js
│   ├── transactionController.js
│   └── categoryController.js
│
├── routes/
│   ├── authRoutes.js
│   ├── productRoutes.js
│   ├── transactionRoutes.js
│   └── categoryRoutes.js
│
├── services/
│   └── stockService.js           Logika bisnis stok
│
├── middleware/
│   ├── auth.js                   JWT authenticate + authorize
│   └── errorHandler.js
│
├── utils/
│   └── helpers.js                Fungsi pembantu (format rupiah, SKU, dll)
│
└── public/
    ├── index.html
    ├── css/style.css
    └── js/script.js
```

---

## Cara Menjalankan

### 1. Buat database di PostgreSQL
```
Nama database: stock_management
```

### 2. Sesuaikan file .env
```env
DB_HOST     = localhost
DB_PORT     = 5432
DB_NAME     = stock_management
DB_USER     = postgres
DB_PASSWORD = password_kamu
```

### 3. Install dependencies
```bash
npm install
```

### 4. Jalankan server
```bash
npm start
```

### 5. Isi data dummy (terminal baru)
```bash
npm run seed
```

### 6. Buka browser
```
http://localhost:3000
```

---

## Akun Default

| Username | Password  | Role  |
|----------|-----------|-------|
| admin    | admin123  | Admin |
| budi     | budi123   | Staff |
| siti     | siti123   | Staff |

---

## Hak Akses

| Fitur              | Admin | Staff |
|--------------------|-------|-------|
| Dashboard          | ✅    | ❌    |
| Kelola Produk      | ✅    | ❌    |
| Kelola Kategori    | ✅    | ❌    |
| Riwayat Transaksi  | ✅    | ❌    |
| Stok Masuk         | ✅    | ✅    |
| Stok Keluar        | ✅    | ✅    |
| Buat Akun Baru     | ✅    | ❌    |
