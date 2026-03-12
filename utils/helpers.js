// Kumpulan fungsi pembantu yang dipakai di berbagai bagian aplikasi

// Format angka ke tampilan Rupiah
function formatRupiah(amount) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

// Buat kode SKU otomatis dari prefix dan nomor urut
// Contoh: generateSKU('MKN', 1) => 'MKN-000001'
function generateSKU(prefix, sequence) {
  return `${prefix.toUpperCase()}-${String(sequence).padStart(6, "0")}`;
}

// Cek apakah nilai adalah angka positif yang valid
function isPositiveNumber(value) {
  const num = parseFloat(value);
  return !isNaN(num) && num > 0;
}

// Format tanggal ke format Indonesia: 01 Januari 2024
function formatDate(date) {
  return new Date(date).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

// Buat objek response sukses yang konsisten
function successResponse(data, message = "Berhasil") {
  return { success: true, message, data };
}

// Buat objek response error yang konsisten
function errorResponse(message, code = 500) {
  return { success: false, message, code };
}

module.exports = {
  formatRupiah,
  formatDate,
  generateSKU,
  isPositiveNumber,
  successResponse,
  errorResponse,
};
