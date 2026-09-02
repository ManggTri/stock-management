# Stock Management — Toko Grosir

Aplikasi web manajemen stok berbasis Node.js + Express + PostgreSQL.

---

## Struktur Folder

```
stock-management/
├── app.js
├── package.json
├── .env
│
├── config/
│   └── database.js
│
├── database/
│   ├── migrations/
│   │   ├── 001_create_users.js
│   │   ├── 002_create_categories.js
│   │   ├── 003_create_products.js
│   │   └── 004_create_transactions.js
│   ├── seeders/
│   │   ├── run.js
│   │   ├── 001_categories.js
│   │   ├── 002_users.js
│   │   ├── 003_products.js
│   │   └── 004_transactions.js
│   └── backups/
│
├── models/
│   ├── BaseModel.js
│   ├── User.js
│   ├── Product.js
│   ├── Transaction.js
│   ├── Category.js
│   └── index.js
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
│   └── stockService.js
│
├── middleware/
│   ├── auth.js
│   └── errorHandler.js
│
├── utils/
│   └── helpers.js
│
└── public/
    ├── index.html
    ├── css/style.css
    └── js/script.js
