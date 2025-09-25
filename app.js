document.addEventListener('DOMContentLoaded',()=>{
  const cartTable=document.querySelector('#cart-table tbody');
  const itemForm=document.querySelector('#item-form');
  const totalAmount=document.getElementById('total-amount');
  const cashierName=document.getElementById('cashier-name');
  const paymentMethod=document.getElementById('payment-method');
  const dpRow=document.getElementById('dp-row');
  const dpPaid=document.getElementById('dp-paid');
  const btnA4=document.getElementById('print-invoice-a4');
  const btnThermal=document.getElementById('print-invoice-thermal');

  let cart=[];

  itemForm.addEventListener('submit',(e)=>{
    e.preventDefault();
    const name=document.getElementById('item-name').value;
    const price=parseFloat(document.getElementById('item-price').value);
    const qty=parseInt(document.getElementById('item-qty').value);
    cart.push({name,price,qty});
    renderCart();
    itemForm.reset();
    document.getElementById('item-qty').value=1;
  });

  function renderCart(){
    cartTable.innerHTML='';
    let total=0;
    cart.forEach((item,i)=>{
      const subtotal=item.price*item.qty;
      total+=subtotal;
      cartTable.innerHTML+=`<tr><td>${item.name}</td><td>${item.price}</td><td>${item.qty}</td><td>${subtotal}</td><td><button onclick="removeItem(${i})">X</button></td></tr>`;
    });
    totalAmount.textContent=total;
  }
  window.removeItem=function(i){ cart.splice(i,1); renderCart(); }

  paymentMethod.addEventListener('change',()=>{
    dpRow.style.display=paymentMethod.value==='dp'?'block':'none';
  });

  function generateInvoice(type){
    let bodyEl=document.getElementById('invoice-body-'+type);
    let footerEl=document.getElementById('invoice-footer-'+type);
    bodyEl.innerHTML='<table><tr><th>Nama</th><th>Harga</th><th>Qty</th><th>Subtotal</th></tr>'+
      cart.map(it=>`<tr><td>${it.name}</td><td>${it.price}</td><td>${it.qty}</td><td>${it.price*it.qty}</td></tr>`).join('')+'</table>';
    let total=cart.reduce((s,it)=>s+it.price*it.qty,0);
    let catatan='';
    if(paymentMethod.value==='dp'){catatan=`DP: ${dpPaid.value}, Sisa: ${total-dpPaid.value}`;}
    else{catatan=paymentMethod.value.toUpperCase();}
    footerEl.innerHTML=`<p>Kasir: ${cashierName.value||'-'}</p><p>Metode: ${catatan}</p><h3>Total: Rp ${total}</h3>`;
    let invoiceDiv=document.getElementById('invoice-printable-'+type);
    invoiceDiv.style.display='block';
    window.print();
    invoiceDiv.style.display='none';
  }

  btnA4.addEventListener('click',()=>generateInvoice('a4'));
  btnThermal.addEventListener('click',()=>generateInvoice('thermal'));
});
