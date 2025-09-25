// POS app with localStorage and XLSX export (SheetJS)
const itemForm = document.getElementById('item-form');
const cartTableBody = document.querySelector('#cart-table tbody');
const totalAmountEl = document.getElementById('total-amount');
const cashierNameInput = document.getElementById('cashier-name');
const paymentMethod = document.getElementById('payment-method');
const dpRow = document.getElementById('dp-row');
const dpPaidInput = document.getElementById('dp-paid');
const saveBtn = document.getElementById('save-transaction');
const printBtn = document.getElementById('print-invoice');
const reportMonth = document.getElementById('report-month');
const showReportBtn = document.getElementById('show-report');
const reportOutput = document.getElementById('report-output');
const downloadMonthXlsxBtn = document.getElementById('download-month-xlsx');
const clearStorageBtn = document.getElementById('clear-storage');

let cart = [];

function formatRp(n){ return new Intl.NumberFormat('id-ID').format(n); }
function recalc(){
  const total = cart.reduce((s,i)=>s + i.price * i.qty, 0);
  totalAmountEl.textContent = formatRp(total);
}
function renderCart(){
  cartTableBody.innerHTML = '';
  cart.forEach((it, idx)=>{
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${it.name}</td><td>${formatRp(it.price)}</td><td>${it.qty}</td><td>${formatRp(it.price*it.qty)}</td><td><button data-idx="${idx}" class="del">x</button></td>`;
    cartTableBody.appendChild(tr);
  });
  recalc();
}
itemForm.addEventListener('submit', e=>{
  e.preventDefault();
  const name = document.getElementById('item-name').value.trim();
  const price = Number(document.getElementById('item-price').value) || 0;
  const qty = Number(document.getElementById('item-qty').value) || 1;
  cart.push({name, price, qty});
  renderCart();
  itemForm.reset();
});

cartTableBody.addEventListener('click', e=>{
  if(e.target.classList.contains('del')){
    const idx = Number(e.target.dataset.idx);
    cart.splice(idx,1);
    renderCart();
  }
});

paymentMethod.addEventListener('change', ()=>{
  if(paymentMethod.value === 'dp') dpRow.style.display = 'block';
  else dpRow.style.display = 'none';
});

function saveTransaction(){
  if(cart.length === 0) return alert('Keranjang kosong');
  const cashier = cashierNameInput.value.trim() || 'Unknown';
  const method = paymentMethod.value;
  const dpPaid = Number(dpPaidInput.value) || 0;
  const total = cart.reduce((s,i)=>s + i.price * i.qty, 0);
  const remaining = method === 'dp' ? Math.max(0, total - dpPaid) : 0;
  const now = new Date();
  const tx = {
    id: 'tx_' + now.getTime(),
    date: now.toISOString(),
    date_short: now.toISOString().slice(0,10),
    cashier, method, dpPaid, remaining, total, items: cart.slice()
  };
  const raw = localStorage.getItem('griya_transactions');
  const arr = raw ? JSON.parse(raw) : [];
  arr.push(tx);
  localStorage.setItem('griya_transactions', JSON.stringify(arr));
  cart = [];
  renderCart();
  alert('Transaksi tersimpan');
}

saveBtn.addEventListener('click', saveTransaction);

// Print invoice
printBtn.addEventListener('click', ()=>{
  if(cart.length === 0) return alert('Keranjang kosong — tambahkan item untuk cetak invoice');
  const cashier = cashierNameInput.value.trim() || 'Unknown';
  const method = paymentMethod.value;
  const dpPaid = Number(dpPaidInput.value) || 0;
  const total = cart.reduce((s,i)=>s + i.price * i.qty, 0);
  const remaining = method === 'dp' ? Math.max(0, total - dpPaid) : 0;
  const invoiceEl = document.getElementById('invoice-printable');
  const body = document.getElementById('invoice-body');
  const footer = document.getElementById('invoice-footer');
  const d = new Date();
  let html = `<p>Tanggal: ${d.toLocaleString()}</p>`;
  html += `<p>Kasir: ${cashier}</p>`;
  html += `<p>Metode: ${method.toUpperCase()} ${method==='dp' ? '(DP dibayar: ' + formatRp(dpPaid) + ', Sisa: ' + formatRp(remaining) + ')' : ''}</p>`;
  html += '<table style="width:100%;border-collapse:collapse"><thead><tr><th style="text-align:left">Nama</th><th>Harga</th><th>Qty</th><th>Subtotal</th></tr></thead><tbody>';
  cart.forEach(it=>{
    html += `<tr><td>${it.name}</td><td style="text-align:right">${formatRp(it.price)}</td><td style="text-align:right">${it.qty}</td><td style="text-align:right">${formatRp(it.price*it.qty)}</td></tr>`;
  });
  html += `</tbody></table>`;
  html += `<h3>Total: ${formatRp(total)}</h3>`;
  body.innerHTML = html;
  footer.innerHTML = '<p>Terima kasih atas pembelian Anda!</p>';
  invoiceEl.style.display = 'block';
  setTimeout(()=> window.print(), 500);
  window.onafterprint = () => { invoiceEl.style.display = 'none'; };
});

// Report monthly (on screen)
showReportBtn.addEventListener('click', ()=>{
  const val = reportMonth.value;
  if(!val) return alert('Pilih bulan (format YYYY-MM)');
  const raw = localStorage.getItem('griya_transactions');
  const arr = raw ? JSON.parse(raw) : [];
  const filtered = arr.filter(tx => tx.date.slice(0,7) === val);
  if(filtered.length === 0) return reportOutput.innerHTML = '<p>Tidak ada transaksi untuk bulan ini.</p>';
  // build table grouped by day
  const days = {};
  filtered.forEach(tx=>{
    const day = tx.date_short;
    if(!days[day]) days[day] = [];
    days[day].push(tx);
  });
  let html = '';
  Object.keys(days).sort().forEach(day=>{
    html += `<h4>${day}</h4>`;
    html += '<table><thead><tr><th>ID</th><th>Kasir</th><th>Metode</th><th>DP</th><th>Sisa</th><th>Total</th></tr></thead><tbody>';
    let daySum = 0;
    days[day].forEach(tx=>{
      html += `<tr><td>${tx.id}</td><td>${tx.cashier}</td><td>${tx.method}</td><td style="text-align:right">${formatRp(tx.dpPaid)}</td><td style="text-align:right">${formatRp(tx.remaining)}</td><td style="text-align:right">${formatRp(tx.total)}</td></tr>`;
      daySum += tx.total;
    });
    html += `</tbody></table><p>Rekap Total ${day}: <strong>${formatRp(daySum)}</strong></p>`;
  });
  reportOutput.innerHTML = html;
});

// Download monthly workbook (.xlsx) with SheetJS
downloadMonthXlsxBtn.addEventListener('click', ()=>{
  const val = reportMonth.value;
  if(!val) return alert('Pilih bulan terlebih dahulu (format YYYY-MM)');
  const raw = localStorage.getItem('griya_transactions');
  const arr = raw ? JSON.parse(raw) : [];
  const filtered = arr.filter(tx => tx.date.slice(0,7) === val);
  if(filtered.length === 0) return alert('Tidak ada transaksi untuk bulan ini.');

  // group by day
  const days = {};
  filtered.forEach(tx=>{
    const day = tx.date_short;
    if(!days[day]) days[day] = [];
    days[day].push(tx);
  });

  const wb = XLSX.utils.book_new();
  Object.keys(days).sort().forEach(day=>{
    const rows = [];
    // header
    rows.push(['ID','Date','Kasir','Metode','DP Paid','Remaining','Total','ItemName','Price','Qty','Subtotal']);
    let daySum = 0;
    let txCount = 0;
    days[day].forEach(tx=>{
      tx.items.forEach(it=>{
        rows.push([tx.id, tx.date, tx.cashier, tx.method, tx.dpPaid, tx.remaining, tx.total, it.name, it.price, it.qty, it.price*it.qty]);
      });
      daySum += tx.total;
      txCount += 1;
    });
    // add empty row and rekap
    rows.push([]);
    rows.push(['TOTAL TRANSAKSI', txCount, 'TOTAL OMZET', daySum]);
    const ws = XLSX.utils.aoa_to_sheet(rows);
    XLSX.utils.book_append_sheet(wb, ws, day);
  });

  const filename = `griya-laporan-${val}.xlsx`;
  XLSX.writeFile(wb, filename);
});

// Clear storage
clearStorageBtn.addEventListener('click', ()=>{
  if(confirm('Hapus semua transaksi dari localStorage?')) {
    localStorage.removeItem('griya_transactions');
    alert('Semua transaksi dihapus.');
    reportOutput.innerHTML = '';
  }
});

(function init(){
  renderCart();
})();