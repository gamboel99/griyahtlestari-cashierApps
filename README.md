Griya HT Lestari — Aplikasi Kasir (client-side) - XLSX Version
===============================================================
Isi paket:
- index.html
- style.css
- app.js
- assets/logo.jpg (jika tersedia)

Perubahan/fitur baru:
- Metode pembayaran: Cash, Transfer, QRIS, DP.
- Jika DP dipilih, masukkan jumlah DP, aplikasi simpan dpPaid dan hitung sisa.
- Tombol "Download Workbook Bulanan (.xlsx)" membuat file Excel (.xlsx) menggunakan SheetJS.
  - Workbook berisi **sheet per hari** (nama sheet = yyyy-mm-dd).
  - Setiap sheet memuat baris transaksi harian (ID, Date, Kasir, Metode, DP Paid, Remaining, Total, ItemName, Price, Qty, Subtotal).
  - Baris terakhir tiap sheet = rekap: TOTAL TRANSAKSI & TOTAL OMZET.
- Tetap: cetak invoice via window.print() (pilih thermal printer di dialog print bila perlu).

Catatan penting:
- Untuk men-generate .xlsx pada browser, file SheetJS di-include via CDN:
  <script src="https://cdn.sheetjs.com/xlsx-latest/package/dist/xlsx.full.min.js"></script>
  Pastikan lingkungan yang akan membuka aplikasi memiliki akses internet untuk memuat library ini.
- Jika ingin bundling SheetJS lokal (offline), saya bisa sertakan file library, tetapi ukurannya besar.

Deploy:
1. Unggah seluruh isi folder ini ke repository GitHub
2. Aktifkan GitHub Pages atau deploy ke Vercel (static site)
3. Buka index.html

