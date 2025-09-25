
Griya HT Lestari — Simple POS (HTML + localStorage)
=================================================

Isi paket:
- index.html  (main web app)
- style.css   (styling)
- app.js      (logic: stock, cart, checkout, localStorage, Excel export via SheetJS)
- assets/logo.jpg  (logo if uploaded)
- README.txt

Cara pakai (lokal / deploy):
1. Ekstrak zip.
2. Deploy ke GitHub Pages atau Vercel (static hosting) — cukup push repository ke GitHub and connect to Vercel, atau gunakan GitHub Pages.
3. Aplikasi bergantung pada internet untuk SheetJS CDN saat melakukan export Excel. Jika Anda ingin bundling lokal, download xlsx library dan letakkan di folder assets lalu edit index.html.
4. Semua data transaksi disimpan di localStorage browser. Gunakan tombol export untuk menyimpan laporan harian atau workbook bulanan ke file .xlsx.
5. Thermal printer: integrasi langsung ke printer thermal memerlukan server/driver atau WebUSB / Browser-specific setup. Untuk sekarang fitur cetak dilakukan via window.print() pada invoice. Untuk integrasi lebih lanjut saya bisa bantu setelah deploy.

Fitur utama:
- CRUD sederhana produk/stok.
- Keranjang & checkout dengan metode pembayaran (cash, dp, transfer, qris, cas).
- Kalkulasi DP / sisa pembayaran.
- Simpan transaksi ke localStorage.
- Export Excel harian & workbook bulan-an dengan rekap harian di tiap sheet.
- Printable invoice rapi (dioptimalkan agar tidak terpotong dua halaman ketika dicetak).

Kontak pengembang: tersedia bila Anda ingin kustomisasi lebih lanjut.
