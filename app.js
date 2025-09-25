
// Simple POS app using localStorage and SheetJS for Excel export
// Author: generated for Griya HT Lestari
// Key features: stock management, cart, checkout, localStorage report, Excel export (daily + monthly), printable invoice.

// Utilities
const $ = sel => document.querySelector(sel);
const $$ = sel => document.querySelectorAll(sel);

function money(x){ return Number(x).toLocaleString('id-ID'); }

// Initial state & storage keys
const STORAGE_STOCK = 'griya_ht_stock_v1';
const STORAGE_TX = 'griya_ht_tx_v1';
const STORAGE_CASHIER = 'griya_ht_cashier_v1';

// Load saved or empty arrays
let stock = JSON.parse(localStorage.getItem(STORAGE_STOCK) || '[]');
let transactions = JSON.parse(localStorage.getItem(STORAGE_TX) || '[]');
let cashier = localStorage.getItem(STORAGE_CASHIER) || '';

$('#cashierName').value = cashier;

// UI helpers
function saveState(){
  localStorage.setItem(STORAGE_STOCK, JSON.stringify(stock));
  localStorage.setItem(STORAGE_TX, JSON.stringify(transactions));
}

function renderStock(){
  const tbody = $('#stockTable tbody'); tbody.innerHTML='';
  const select = $('#selectProduct'); select.innerHTML='';
  stock.forEach((p,idx)=>{
    const tr=document.createElement('tr');
    tr.innerHTML=`<td>${p.name}</td><td>${money(p.price)}</td><td>${p.stock}</td><td><button class="btnRemove" data-idx="${idx}">hapus</button></td>`;
    tbody.appendChild(tr);
    const opt = document.createElement('option'); opt.value=idx; opt.text = `${p.name} — ${money(p.price)}`; select.appendChild(opt);
  });
}

function renderReport(filterDate=null){
  const area = $('#reportArea'); area.innerHTML='';
  const list = filterDate ? transactions.filter(t=>t.date.split('T')[0]===filterDate) : transactions;
  if(list.length===0){ area.innerHTML='<i>Tidak ada transaksi</i>'; return; }
  // table
  const table = document.createElement('table'); table.className='reportTable';
  table.innerHTML = `<thead><tr><th>No</th><th>ID</th><th>Tgl</th><th>Kasir</th><th>Total</th><th>Metode</th></tr></thead>`;
  const tbody = document.createElement('tbody');
  let dailyTotals = {};
  list.forEach((t,i)=>{
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${i+1}</td><td>${t.id}</td><td>${new Date(t.date).toLocaleString()}</td><td>${t.cashier||'-'}</td><td>${money(t.total)}</td><td>${t.method}</td>`;
    tbody.appendChild(tr);
    const day = t.date.split('T')[0];
    dailyTotals[day] = (dailyTotals[day]||0) + Number(t.total);
  });
  table.appendChild(tbody);
  area.appendChild(table);

  // daily recap
  const recap = document.createElement('div'); recap.innerHTML='<h4>Rekap Harian</h4>';
  Object.keys(dailyTotals).sort().forEach(d=>{
    const el = document.createElement('div'); el.textContent = `${d} — Rp ${money(dailyTotals[d])}`;
    recap.appendChild(el);
  });
  area.appendChild(recap);
}

// Initial render
renderStock(); renderReport();

// Product form
$('#productForm').addEventListener('submit', e=>{
  e.preventDefault();
  const name = $('#p_name').value.trim();
  const price = Number($('#p_price').value) || 0;
  const st = Number($('#p_stock').value) || 0;
  if(!name) return alert('Nama produk kosong');
  // upsert by name
  const idx = stock.findIndex(s=>s.name.toLowerCase()===name.toLowerCase());
  if(idx>=0){ stock[idx].price = price; stock[idx].stock = st; } else {
    stock.push({ name, price, stock: st });
  }
  saveState(); renderStock();
  $('#p_name').value=''; $('#p_price').value=''; $('#p_stock').value='';
});

// Remove product
document.addEventListener('click', e=>{
  if(e.target.matches('.btnRemove')){
    const idx = Number(e.target.dataset.idx);
    if(confirm('Hapus produk?')){
      stock.splice(idx,1); saveState(); renderStock();
    }
  }
});

// Cart operations
let cart = [];
function renderCart(){
  const tb = $('#cartTable tbody'); tb.innerHTML='';
  let subtotal=0;
  cart.forEach((it,idx)=>{
    const row = document.createElement('tr');
    const subtotalItem = it.qty * it.price;
    subtotal += subtotalItem;
    row.innerHTML = `<td>${it.name}</td><td>${it.qty}</td><td>${money(it.price)}</td><td>${money(subtotalItem)}</td><td><button data-idx="${idx}" class="removeCart">x</button></td>`;
    tb.appendChild(row);
  });
  $('#subtotal').textContent = money(subtotal);
  const disc = Number($('#discount').value)||0;
  const total = Math.round(subtotal * (1 - disc/100));
  $('#total').textContent = money(total);
}
$('#btnAddCart').addEventListener('click', ()=>{
  const sel = $('#selectProduct').value;
  if(sel==='') return alert('Pilih produk');
  const p = stock[Number(sel)];
  const q = Number($('#qty').value) || 1;
  if(p.stock < q) return alert('Stok tidak cukup');
  // add to cart (reduce stock visually only on checkout)
  const existing = cart.find(c=>c.name===p.name);
  if(existing){ existing.qty += q; } else cart.push({ name: p.name, qty: q, price: p.price });
  renderCart();
});
document.addEventListener('click', e=>{
  if(e.target.matches('.removeCart')){
    const idx = Number(e.target.dataset.idx);
    cart.splice(idx,1); renderCart();
  }
});

// cashier save
$('#btnSaveCashier').addEventListener('click', ()=>{
  cashier = $('#cashierName').value.trim();
  localStorage.setItem(STORAGE_CASHIER, cashier);
  alert('Nama kasir disimpan');
});

// Checkout / Save Transaction
$('#btnCheckout').addEventListener('click', ()=>{
  if(cart.length===0) return alert('Keranjang kosong');
  const payMethod = $('#payMethod').value;
  const paid = Number($('#paidAmount').value) || 0;
  const note = $('#note').value || '';
  const disc = Number($('#discount').value) || 0;
  // compute totals
  let subtotal=0; cart.forEach(it=> subtotal += it.qty * it.price);
  const total = Math.round(subtotal * (1 - disc/100));
  // handle DP
  let status='LUNAS';
  let remaining = 0;
  if(payMethod === 'dp'){
    if(paid < total){ status = 'DP'; remaining = total - paid; } else { status='LUNAS'; remaining = paid - total; }
  } else {
    if(paid < total){ status = 'KURANG'; remaining = total - paid; } else { status='LUNAS'; remaining = paid - total; }
  }
  // generate transaction
  const tx = {
    id: 'TX' + Date.now(),
    date: new Date().toISOString(),
    cashier: cashier,
    items: cart.map(c=>({name:c.name, qty:c.qty, price:c.price})),
    subtotal, discount: disc, total, paid, remaining, status, method: payMethod, note
  };
  // update stocks (deduct)
  tx.items.forEach(it=>{
    const idx = stock.findIndex(s=>s.name===it.name);
    if(idx>=0) stock[idx].stock = Math.max(0, stock[idx].stock - it.qty);
  });
  transactions.push(tx); saveState();
  // clear cart
  cart = []; renderCart(); renderStock(); renderReport();
  // show printable invoice (populate)
  showInvoice(tx);
  alert('Transaksi tersimpan');
});

function showInvoice(tx){
  // isi invoice ke dalam template
  $('#invNumber').textContent = tx.id;
  $('#invCashier').textContent = tx.cashier || '-';
  $('#invDate').textContent = new Date(tx.date).toLocaleString();
  const tbody = document.querySelector('#invTable tbody'); tbody.innerHTML='';
  tx.items.forEach(it=>{
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${it.name}</td><td>${it.qty}</td><td>${money(it.price)}</td><td>${money(it.qty*it.price)}</td>`;
    tbody.appendChild(tr);
  });
  $('#invSubtotal').textContent = money(tx.subtotal);
  $('#invDiscount').textContent = tx.discount + '%';
  $('#invTotal').textContent = money(tx.total);
  $('#invPaid').textContent = money(tx.paid);
  $('#invChange').textContent = money(tx.remaining);
  $('#invMethod').textContent = tx.method.toUpperCase();
  $('#invNote').textContent = tx.note;

  // ambil isi invoice setelah terisi
  const invoiceContent = document.getElementById("invoicePrint").innerHTML;

  // buat jendela print baru
  const w = window.open('', '_blank');
  w.document.write(`
    <html>
      <head>
        <title>Invoice - Griya HT Lestari</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; font-size: 14px; }
          h2, h3 { margin: 0; text-align: center; }
          table { width: 100%; border-collapse: collapse; margin-top: 15px; }
          table, th, td { border: 1px solid black; }
          th, td { padding: 6px; text-align: left; }
          .footer { margin-top: 20px; text-align: right; font-size: 12px; }
          @media print {
            body { margin: 0; }
            table { page-break-inside: auto; }
            tr { page-break-inside: avoid; }
          }
        </style>
      </head>
      <body>
        ${invoiceContent}
      </body>
    </html>
  `);
  w.document.close();
  w.onload = function(){
    w.print();
    w.close();
  };
}

// Filtering
$('#btnFilter').addEventListener('click', ()=>{
  const d = $('#filterDate').value;
  if(!d) return alert('Pilih tanggal');
  renderReport(d);
});
$('#btnClearFilter').addEventListener('click', ()=>{ renderReport(); $('#filterDate').value=''; });

// Export to Excel (SheetJS)
// Build worksheet from transactions; daily workbook: all tx for date; monthly workbook: sheets per day
function exportDaily(dateStr){
  const list = transactions.filter(t=>t.date.split('T')[0]===dateStr);
  if(list.length===0) return alert('Tidak ada transaksi di tanggal ini');
  const ws_data = [['ID','Tanggal','Kasir','Item','Qty','Harga','Subtotal','Diskon %','Total','Paid','Remaining','Status','Method','Note']];
  list.forEach(t=>{
    t.items.forEach(it=>{
      ws_data.push([t.id, t.date, t.cashier, it.name, it.qty, it.price, it.qty*it.price, t.discount, t.total, t.paid, t.remaining, t.status, t.method, t.note]);
    });
  });
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(ws_data);
  XLSX.utils.book_append_sheet(wb, ws, dateStr);
  XLSX.writeFile(wb, `griyaht_transaksi_${dateStr}.xlsx`);
}

function exportMonth(month){ // month 'YYYY-MM'
  // group by date
  const grouped = {};
  transactions.forEach(t=>{
    const d = t.date.split('T')[0];
    if(d.startsWith(month)) grouped[d] = grouped[d] || [];
    if(d.startsWith(month)) grouped[d].push(t);
  });
  if(Object.keys(grouped).length===0) return alert('Tidak ada transaksi di bulan ini');
  const wb = XLSX.utils.book_new();
  Object.keys(grouped).sort().forEach(d=>{
    const ws_data = [['ID','Tanggal','Kasir','Item','Qty','Harga','Subtotal','Diskon %','Total','Paid','Remaining','Status','Method','Note']];
    grouped[d].forEach(t=>{
      t.items.forEach(it=> ws_data.push([t.id, t.date, t.cashier, it.name, it.qty, it.price, it.qty*it.price, t.discount, t.total, t.paid, t.remaining, t.status, t.method, t.note]));
    });
    // add daily recap bottom row
    const totals = grouped[d].reduce((s,x)=> s + Number(x.total), 0);
    ws_data.push([]);
    ws_data.push(['','','','Total hari ini','', '', '', '', totals]);
    const ws = XLSX.utils.aoa_to_sheet(ws_data);
    XLSX.utils.book_append_sheet(wb, ws, d);
  });
  const filename = `griyaht_transaksi_${month}.xlsx`;
  XLSX.writeFile(wb, filename);
}

// Buttons export handlers (today and current month)
$('#btnExportToday').addEventListener('click', ()=>{
  const today = new Date().toISOString().split('T')[0];
  exportDaily(today);
});
$('#btnExportMonth').addEventListener('click', ()=>{
  const now = new Date(); const month = now.toISOString().slice(0,7); exportMonth(month);
});

// initial render report
renderReport();
