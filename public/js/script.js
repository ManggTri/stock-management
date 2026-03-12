/**
 * @fileoverview Frontend JavaScript - Stock Management System
 * @description Menerapkan: array, perulangan, if-else, fungsi, method, namespace
 * Semua kode frontend dibagi dalam namespace/modul terpisah
 */

"use strict";

// NAMESPACE 1: API Module — semua komunikasi dengan backend
const API = (() => {
  /** @private Base URL API */
  const BASE = "/api";

  /**
   * Mendapatkan token dari localStorage
   * @returns {string|null}
   */
  function getToken() {
    return localStorage.getItem("token");
  }

  /**
   * Membangun headers request dengan token auth
   * @returns {Object} Headers object
   */
  function buildHeaders() {
    const headers = { "Content-Type": "application/json" };
    const token = getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
    return headers;
  }

  /**
   * Generic fetch wrapper dengan error handling
   * @param {string} endpoint - Path endpoint
   * @param {string} [method='GET'] - HTTP method
   * @param {Object} [body=null]    - Request body
   * @returns {Promise<Object>} Response JSON
   */
  async function request(endpoint, method = "GET", body = null) {
    const options = { method, headers: buildHeaders() };
    if (body) options.body = JSON.stringify(body);

    const res = await fetch(`${BASE}${endpoint}`, options);
    const data = await res.json();

    // Jika 401, paksa logout (if-else)
    if (res.status === 401) {
      Auth.logout();
      return;
    }
    return data;
  }

  // Ekspor method publik
  return {
    get: (endpoint) => request(endpoint),
    post: (endpoint, body) => request(endpoint, "POST", body),
    put: (endpoint, body) => request(endpoint, "PUT", body),
    delete: (endpoint) => request(endpoint, "DELETE"),
    getToken,
    setToken: (token) => localStorage.setItem("token", token),
    clearToken: () => localStorage.removeItem("token"),
  };
})();

// NAMESPACE 2: Auth Module — autentikasi & manajemen sesi
const Auth = (() => {
  let currentUser = null;

  /**
   * Mendapatkan data user yang sedang login
   * @returns {Object|null}
   */
  function getUser() {
    return currentUser;
  }

  /**
   * Menyimpan user ke state dan localStorage
   * @param {Object} user  - Data user
   * @param {string} token - JWT token
   */
  function setUser(user, token) {
    currentUser = user;
    API.setToken(token);
    localStorage.setItem("user", JSON.stringify(user));
  }

  /**
   * Login pengguna
   * @param {string} email
   * @param {string} password
   */
  async function login(username, password) {
    const res = await API.post("/auth/login", { username, password });
    if (res && res.success) {
      setUser(res.user, res.token);
      return { success: true, user: res.user };
    }
    return { success: false, message: res?.message || "Login gagal" };
  }

  /**
   * Register pengguna baru
   */
  async function register(data) {
    const res = await API.post("/auth/register", data);
    return res;
  }

  /**
   * Logout - hapus semua data sesi
   */
  function logout() {
    currentUser = null;
    API.clearToken();
    localStorage.removeItem("user");
    UI.showLoginScreen();
  }

  /**
   * Mengecek apakah user sudah login
   * @returns {boolean}
   */
  function isLoggedIn() {
    const token = API.getToken();
    const user = localStorage.getItem("user");
    if (token && user) {
      currentUser = JSON.parse(user);
      return true;
    }
    return false;
  }

  return { login, register, logout, getUser, isLoggedIn };
})();

// NAMESPACE 3: UI Module — semua manipulasi DOM dan tampilan
const UI = (() => {
  /** State paginasi */
  const pagination = { products: 1, transactions: 1 };

  // ── Screen Switching ───────────────────────────────────────────────────

  function showLoginScreen() {
    document.getElementById("loginScreen").classList.remove("hidden");
    document.getElementById("registerScreen").classList.add("hidden");
    document.getElementById("appScreen").classList.add("hidden");
  }

  function showRegisterScreen() {
    document.getElementById("loginScreen").classList.add("hidden");
    document.getElementById("registerScreen").classList.remove("hidden");
  }

  function showAppScreen(user) {
    document.getElementById("loginScreen").classList.add("hidden");
    document.getElementById("registerScreen").classList.add("hidden");
    document.getElementById("appScreen").classList.remove("hidden");

    // Update sidebar info
    document.getElementById("sidebarUserName").textContent = user.name;
    const roleEl = document.getElementById("sidebarUserRole");
    roleEl.textContent = user.role;
    roleEl.className = `badge badge-${user.role}`;

    // Sembunyikan menu yang tidak boleh diakses staff (if-else hak akses)
    const adminOnlyMenus = document.querySelectorAll('[data-role="admin"]');
    adminOnlyMenus.forEach((el) => {
      if (user.role === "staff") {
        el.classList.add("hidden");
      } else {
        el.classList.remove("hidden");
      }
    });

    const sharedMenus = document.querySelectorAll(
      '[data-page="dashboard"], [data-page="transactions"]'
    );
    sharedMenus.forEach((el) => el.classList.remove("hidden"));
  }

  // ── Pages ──────────────────────────────────────────────────────────────

  function showPage(name) {
    const user = Auth.getUser();

    // Batasi halaman untuk staff — hanya boleh akses transactions
    if (user && user.role === "staff") {
      const staffAllowed = ["transactions", "dashboard"];
      if (!staffAllowed.includes(name)) {
        name = "transactions"; // paksa ke halaman transaksi
      }
    }

    // Nonaktifkan semua halaman (perulangan forEach)
    document
      .querySelectorAll(".page")
      .forEach((p) => p.classList.remove("active"));
    document
      .querySelectorAll(".nav-item")
      .forEach((n) => n.classList.remove("active"));

    // Aktifkan halaman yang dipilih
    document.getElementById(`page-${name}`).classList.add("active");
    const navEl = document.querySelector(`[data-page="${name}"]`);
    if (navEl) navEl.classList.add("active");

    // Load data sesuai halaman (if-else)
    if (name === "dashboard") loadDashboard();
    else if (name === "products") {
      loadCategories();
      loadProducts();
    } else if (name === "transactions") loadTransactions();
    else if (name === "categories") loadCategories();
  }

  // ── Dashboard ─────────────────────────────────────────────────────────

  async function loadDashboard() {
    // Tanggal hari ini
    document.getElementById("dashDate").textContent =
      new Date().toLocaleDateString("id-ID", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });

    const summaryRes = await API.get("/products/summary");
    const lowStockRes = await API.get("/products/low-stock");

    if (summaryRes?.success) {
      const s = summaryRes.data;
      document.getElementById("statTotal").textContent = s.totalProducts;
      document.getElementById("statAvailable").textContent = s.available;
      document.getElementById("statLow").textContent = s.lowStock;
      document.getElementById("statOut").textContent = s.outOfStock;
    }

    if (lowStockRes?.success) {
      renderLowStockTable(lowStockRes.data);
    }
  }

  /**
   * Merender tabel produk stok rendah
   * Menerapkan: array forEach, string template literal
   * @param {Array} items - Array produk stok rendah
   */
  function renderLowStockTable(items) {
    const container = document.getElementById("lowStockTable");

    if (items.length === 0) {
      container.innerHTML =
        '<div class="empty-state"><span class="empty-icon">✅</span>Semua stok dalam kondisi normal</div>';
      return;
    }

    // Perulangan map untuk membangun baris tabel (Array method)
    const rows = items
      .map((item) => {
        const badge =
          item.stockStatus === "out_of_stock"
            ? '<span class="badge badge-red">Habis</span>'
            : '<span class="badge badge-yellow">Rendah</span>';

        return `
        <tr>
          <td><span class="sku-tag">${item.sku}</span></td>
          <td>${item.name}</td>
          <td><span class="stock-num">${item.stock}</span> ${item.unit}</td>
          <td>${badge}</td>
        </tr>`;
      })
      .join("");

    container.innerHTML = `
      <table>
        <thead><tr><th>SKU</th><th>Nama Produk</th><th>Stok</th><th>Status</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>`;
  }

  // ── Products ───────────────────────────────────────────────────────────

  async function loadProducts(page = pagination.products) {
    pagination.products = page;
    const search = document.getElementById("searchProduct")?.value || "";
    const categoryId = document.getElementById("filterCategory")?.value || "";
    let url = `/products?page=${page}&limit=10`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    if (categoryId) url += `&categoryId=${categoryId}`;

    const res = await API.get(url);
    if (!res?.success) return;

    renderProductTable(res.data);
    renderPagination("productPagination", res.totalPages, page, loadProducts);
  }

  /**
   * Render tabel produk
   * @param {Array} products - Array produk
   */
  function renderProductTable(products) {
    const container = document.getElementById("productTable");

    if (products.length === 0) {
      container.innerHTML =
        '<div class="empty-state"><span class="empty-icon">🗃️</span>Belum ada produk</div>';
      return;
    }

    const rows = products
      .map((p) => {
        let stockBadge;
        // if-else untuk menentukan badge status stok
        if (p.stockStatus === "out_of_stock") {
          stockBadge = '<span class="badge badge-red">Habis</span>';
        } else if (p.stockStatus === "low") {
          stockBadge = '<span class="badge badge-yellow">Rendah</span>';
        } else {
          stockBadge = '<span class="badge badge-green">Normal</span>';
        }

        const user = Auth.getUser();
        const adminActions =
          user?.role === "admin"
            ? `<button class="btn-icon" onclick="editProduct(${p.id})" title="Edit">✏️</button>
           <button class="btn-icon" onclick="deleteProduct(${p.id})" title="Hapus">🗑️</button>`
            : "";

        return `
        <tr>
          <td><span class="sku-tag">${p.sku}</span></td>
          <td>${p.name}</td>
          <td>${p.category?.name || "-"}</td>
          <td><span class="stock-num">${p.stock}</span> ${p.unit}</td>
          <td>${p.priceFormatted}</td>
          <td>${stockBadge}</td>
          <td>${adminActions}</td>
        </tr>`;
      })
      .join("");

    container.innerHTML = `
      <table>
        <thead><tr><th>SKU</th><th>Nama</th><th>Kategori</th><th>Stok</th><th>Harga</th><th>Status</th><th></th></tr></thead>
        <tbody>${rows}</tbody>
      </table>`;
  }

  // ── Transactions ───────────────────────────────────────────────────────

  async function loadTransactions(page = pagination.transactions) {
    pagination.transactions = page;
    const type = document.getElementById("filterTrxType")?.value || "";
    let url = `/transactions?page=${page}&limit=10`;
    if (type) url += `&type=${type}`;

    const res = await API.get(url);
    if (!res?.success) return;

    renderTransactionTable(res.transactions);
    renderPagination("trxPagination", res.totalPages, page, loadTransactions);
  }

  /**
   * Render tabel transaksi
   * @param {Array} transactions
   */
  function renderTransactionTable(transactions) {
    const container = document.getElementById("transactionTable");

    if (!transactions || transactions.length === 0) {
      container.innerHTML =
        '<div class="empty-state"><span class="empty-icon">📊</span>Belum ada transaksi</div>';
      return;
    }

    const rows = transactions
      .map((t) => {
        const typeBadge =
          t.type === "in"
            ? '<span class="badge badge-green">📥 Masuk</span>'
            : '<span class="badge badge-red">📤 Keluar</span>';

        return `
        <tr>
          <td>${t.createdAtFormatted}</td>
          <td>${typeBadge}</td>
          <td>${t.product?.name || "-"}</td>
          <td>${t.quantity} ${t.product ? "" : ""}</td>
          <td>${t.notes || "-"}</td>
          <td>${t.user?.name || "Sistem"}</td>
        </tr>`;
      })
      .join("");

    container.innerHTML = `
      <table>
        <thead><tr><th>Waktu</th><th>Tipe</th><th>Produk</th><th>Jumlah</th><th>Catatan</th><th>Oleh</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>`;
  }

  // ── Categories ─────────────────────────────────────────────────────────

  async function loadCategories() {
    const res = await API.get("/categories");
    if (!res?.success) return;

    const container = document.getElementById("categoryTable");
    if (res.data.length === 0) {
      container.innerHTML =
        '<div class="empty-state"><span class="empty-icon">🏷️</span>Belum ada kategori</div>';
      return;
    }

    const user = Auth.getUser();
    const rows = res.data
      .map((c) => {
        const adminActions =
          user?.role === "admin"
            ? `<button class="btn-icon" onclick="editCategory(${c.id}, '${
                c.name
              }', '${c.description || ""}')">✏️</button>
           <button class="btn-icon" onclick="deleteCategory(${
             c.id
           })">🗑️</button>`
            : "";
        return `<tr><td>${c.id}</td><td>${c.name}</td><td>${
          c.description || "-"
        }</td><td>${adminActions}</td></tr>`;
      })
      .join("");

    container.innerHTML = `
      <table>
        <thead><tr><th>ID</th><th>Nama</th><th>Deskripsi</th><th></th></tr></thead>
        <tbody>${rows}</tbody>
      </table>`;

    // Update semua dropdown kategori
    refreshCategoryDropdowns(res.data);
  }

  /**
   * Memperbarui semua dropdown kategori di seluruh halaman
   * Menerapkan: perulangan forEach pada array
   * @param {Array} categories
   */
  function refreshCategoryDropdowns(categories) {
    const dropdowns = ["filterCategory", "productCategory"];

    dropdowns.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;

      const firstOption = el.options[0];
      el.innerHTML = "";
      el.appendChild(firstOption);

      // Perulangan for..of (array iteration)
      for (const cat of categories) {
        const option = document.createElement("option");
        option.value = cat.id;
        option.textContent = cat.name;
        el.appendChild(option);
      }
    });
  }

  // ── Pagination ─────────────────────────────────────────────────────────

  /**
   * Merender pagination buttons
   * Menerapkan: perulangan for, if-else
   * @param {string}   containerId  - ID container
   * @param {number}   totalPages
   * @param {number}   currentPage
   * @param {Function} onPageClick  - Callback saat klik halaman
   */
  function renderPagination(containerId, totalPages, currentPage, onPageClick) {
    const container = document.getElementById(containerId);
    if (!container || totalPages <= 1) {
      if (container) container.innerHTML = "";
      return;
    }

    let html = "";

    // Perulangan for untuk membuat tombol halaman
    for (let i = 1; i <= totalPages; i++) {
      const active = i === currentPage ? "active" : "";
      html += `<button class="page-btn ${active}" onclick="${onPageClick.name}(${i})">${i}</button>`;
    }

    container.innerHTML = html;
  }

  // ── Toast ──────────────────────────────────────────────────────────────

  /**
   * Menampilkan notifikasi toast
   * @param {string}  message  - Pesan toast
   * @param {'success'|'error'|''} type - Tipe
   */
  function showToast(message, type = "") {
    const toast = document.getElementById("toast");
    toast.textContent = message;
    toast.className = `toast ${type}`;
    toast.classList.remove("hidden");
    setTimeout(() => toast.classList.add("hidden"), 3000);
  }

  // ── Modals ─────────────────────────────────────────────────────────────

  function openModal(id) {
    document.getElementById(id).classList.remove("hidden");
    loadProductsDropdown(); // refresh produk di modal transaksi
  }

  function closeModal(id) {
    document.getElementById(id).classList.add("hidden");
  }

  async function loadProductsDropdown() {
    const res = await API.get("/products?limit=100");
    if (!res?.success) return;

    // Perbarui dropdown produk di modal stok masuk & keluar
    const dropIds = ["inProductId", "outProductId"];
    dropIds.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.innerHTML = '<option value="">-- Pilih Produk --</option>';

      res.data.forEach((p) => {
        const opt = document.createElement("option");
        opt.value = p.id;
        opt.textContent = `${p.name} (Stok: ${p.stock} ${p.unit})`;
        el.appendChild(opt);
      });
    });
  }

  return {
    showLoginScreen,
    showRegisterScreen,
    showAppScreen,
    showPage,
    loadDashboard,
    loadProducts,
    loadTransactions,
    loadCategories,
    showToast,
    openModal,
    closeModal,
  };
})();

// ═══════════════════════════════════════════════════════════════════════════
// Global event handlers (dipanggil dari HTML onclick)
// ═══════════════════════════════════════════════════════════════════════════

async function handleLogin() {
  const username = document.getElementById("loginUsername").value.trim();
  const password = document.getElementById("loginPassword").value;
  const errEl = document.getElementById("loginError");

  if (!username || !password) {
    errEl.textContent = "Email dan password wajib diisi";
    errEl.className = "alert alert-error";
    return;
  }

  const result = await Auth.login(username, password);

  if (result.success) {
    errEl.classList.add("hidden");
    UI.showAppScreen(result.user);
    UI.showPage("dashboard");
  } else {
    errEl.textContent = result.message;
    errEl.className = "alert alert-error";
  }
}

async function handleRegister() {
  const name = document.getElementById("regName").value.trim();
  const username = document.getElementById("regUsername").value.trim();
  const password = document.getElementById("regPassword").value;
  const role = document.getElementById("regRole").value;
  const msgEl = document.getElementById("registerMsg");

  if (!name || !username || !password) {
    msgEl.textContent = "Semua field wajib diisi";
    msgEl.className = "alert alert-error";
    return;
  }

  const res = await Auth.register({ name, username, password, role });

  if (res?.success) {
    msgEl.textContent = "Akun berhasil dibuat!";
    msgEl.className = "alert alert-success";
    setTimeout(() => {
      UI.showAppScreen(Auth.getUser());
      UI.showPage("dashboard");
    }, 1500);
  } else {
    msgEl.textContent = res?.message || "Registrasi gagal";
    msgEl.className = "alert alert-error";
  }
}

function handleLogout() {
  Auth.logout();
}

function showLogin() {
  UI.showLoginScreen();
}
function showRegister() {
  UI.showRegisterScreen();
}
function showRegisterScreen() {
  // Hanya admin yang bisa akses
  const user = Auth.getUser();
  if (!user || user.role !== "admin") {
    UI.showToast(
      "Akses ditolak. Hanya Admin yang dapat membuat akun.",
      "error"
    );
    return;
  }
  document.getElementById("appScreen").classList.add("hidden");
  document.getElementById("registerScreen").classList.remove("hidden");
}
function showPage(name) {
  UI.showPage(name);
}
function openModal(id) {
  UI.openModal(id);
}
function closeModal(id) {
  UI.closeModal(id);
}
function loadProducts(page) {
  UI.loadProducts(page);
}
function loadTransactions(page) {
  UI.loadTransactions(page);
}

// ── Product CRUD ─────────────────────────────────────────────────────────

async function saveProduct() {
  const id = document.getElementById("productId").value;
  const sku = document.getElementById("productSku").value.trim();
  const name = document.getElementById("productName").value.trim();
  const price = document.getElementById("productPrice").value;
  const costPrice = document.getElementById("productCostPrice").value;
  const stock = document.getElementById("productStock").value;
  const unit = document.getElementById("productUnit").value.trim();
  const categoryId = document.getElementById("productCategory").value;
  const description = document.getElementById("productDesc").value;
  const msgEl = document.getElementById("productFormMsg");

  if (!sku || !name) {
    msgEl.textContent = "SKU dan Nama Produk wajib diisi";
    msgEl.className = "alert alert-error";
    return;
  }

  const body = {
    sku,
    name,
    price,
    costPrice,
    stock,
    unit,
    categoryId,
    description,
  };
  let res;

  if (id) {
    res = await API.put(`/products/${id}`, body);
  } else {
    res = await API.post("/products", body);
  }

  if (res?.success) {
    closeModal("modalProduct");
    UI.showToast(
      id ? "✅ Produk diperbarui" : "✅ Produk ditambahkan",
      "success"
    );
    UI.loadProducts();
    clearProductForm();
  } else {
    msgEl.textContent = res?.message || "Gagal menyimpan produk";
    msgEl.className = "alert alert-error";
  }
}

async function editProduct(id) {
  const res = await API.get(`/products/${id}`);
  if (!res?.success) return;

  const p = res.data;
  document.getElementById("modalProductTitle").textContent = "Edit Produk";
  document.getElementById("productId").value = p.id;
  document.getElementById("productSku").value = p.sku;
  document.getElementById("productName").value = p.name;
  document.getElementById("productPrice").value = p.price;
  document.getElementById("productCostPrice").value = p.costPrice;
  document.getElementById("productStock").value = p.stock;
  document.getElementById("productUnit").value = p.unit;
  document.getElementById("productCategory").value = p.categoryId || "";
  document.getElementById("productDesc").value = p.description || "";

  openModal("modalProduct");
}

async function deleteProduct(id) {
  if (!confirm("Yakin ingin menghapus produk ini?")) return;
  const res = await API.delete(`/products/${id}`);
  if (res?.success) {
    UI.showToast("🗑️ Produk dihapus", "success");
    UI.loadProducts();
  } else {
    UI.showToast(res?.message || "Gagal menghapus", "error");
  }
}

function clearProductForm() {
  [
    "productId",
    "productSku",
    "productName",
    "productPrice",
    "productCostPrice",
    "productStock",
    "productUnit",
    "productDesc",
  ].forEach((id) => {
    document.getElementById(id).value = "";
  });
  document.getElementById("productCategory").value = "";
  document.getElementById("modalProductTitle").textContent = "Tambah Produk";
}

// ── Stok Masuk / Keluar ───────────────────────────────────────────────────

async function submitStockIn() {
  const productId = document.getElementById("inProductId").value;
  const quantity = document.getElementById("inQty").value;
  const price = document.getElementById("inPrice").value;
  const notes = document.getElementById("inNotes").value;
  const msgEl = document.getElementById("stockInMsg");

  if (!productId || !quantity) {
    msgEl.textContent = "Produk dan jumlah wajib diisi";
    msgEl.className = "alert alert-error";
    return;
  }

  const res = await API.post("/transactions/in", {
    productId,
    quantity,
    price,
    notes,
  });

  if (res?.success) {
    closeModal("modalStockIn");
    UI.showToast(`📥 ${res.message}`, "success");
    UI.loadTransactions();
    UI.loadDashboard();
  } else {
    msgEl.textContent = res?.message || "Stok masuk gagal";
    msgEl.className = "alert alert-error";
  }
}

async function submitStockOut() {
  const productId = document.getElementById("outProductId").value;
  const quantity = document.getElementById("outQty").value;
  const price = document.getElementById("outPrice").value;
  const notes = document.getElementById("outNotes").value;
  const msgEl = document.getElementById("stockOutMsg");

  if (!productId || !quantity) {
    msgEl.textContent = "Produk dan jumlah wajib diisi";
    msgEl.className = "alert alert-error";
    return;
  }

  const res = await API.post("/transactions/out", {
    productId,
    quantity,
    price,
    notes,
  });

  if (res?.success) {
    closeModal("modalStockOut");
    UI.showToast(`📤 ${res.message}`, "success");
    UI.loadTransactions();
    UI.loadDashboard();
  } else {
    msgEl.textContent = res?.message || "Stok keluar gagal";
    msgEl.className = "alert alert-error";
  }
}

// ── Category CRUD ─────────────────────────────────────────────────────────

async function saveCategory() {
  const id = document.getElementById("categoryId").value;
  const name = document.getElementById("categoryName").value.trim();
  const description = document.getElementById("categoryDesc").value;
  const msgEl = document.getElementById("categoryFormMsg");

  if (!name) {
    msgEl.textContent = "Nama kategori wajib diisi";
    msgEl.className = "alert alert-error";
    return;
  }

  let res;
  if (id) {
    res = await API.put(`/categories/${id}`, { name, description });
  } else {
    res = await API.post("/categories", { name, description });
  }

  if (res?.success) {
    closeModal("modalCategory");
    UI.showToast("✅ Kategori disimpan", "success");
    UI.loadCategories();
    document.getElementById("categoryId").value = "";
    document.getElementById("categoryName").value = "";
    document.getElementById("categoryDesc").value = "";
  } else {
    msgEl.textContent = res?.message || "Gagal menyimpan";
    msgEl.className = "alert alert-error";
  }
}

function editCategory(id, name, description) {
  document.getElementById("modalCategoryTitle").textContent = "Edit Kategori";
  document.getElementById("categoryId").value = id;
  document.getElementById("categoryName").value = name;
  document.getElementById("categoryDesc").value = description;
  openModal("modalCategory");
}

async function deleteCategory(id) {
  if (!confirm("Yakin ingin menghapus kategori ini?")) return;
  const res = await API.delete(`/categories/${id}`);
  if (res?.success) {
    UI.showToast("🗑️ Kategori dihapus", "success");
    UI.loadCategories();
  } else {
    UI.showToast(res?.message || "Gagal menghapus", "error");
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// App Initialization
// ═══════════════════════════════════════════════════════════════════════════
(function init() {
  if (Auth.isLoggedIn()) {
    const user = Auth.getUser();
    UI.showAppScreen(user);
    // Staff langsung ke halaman transaksi, admin ke dashboard
    if (user.role === "staff") {
      UI.showPage("dashboard");
    } else {
      UI.loadCategories();
      UI.showPage("dashboard");
    }
  } else {
    UI.showLoginScreen();
  }
})();
