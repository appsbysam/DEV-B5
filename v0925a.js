/* B5 v0.9.25a — refresh scroll persistence + customer search */
(()=>{
  const scrollKey=()=>`b5-scroll:${location.pathname}:${location.hash||'#dashboard'}`;
  try{history.scrollRestoration='manual';}catch{}
  let lastScroll=window.scrollY||0;
  const saveScroll=()=>{lastScroll=window.scrollY||0;try{sessionStorage.setItem(scrollKey(),String(lastScroll));}catch{}};
  window.addEventListener('scroll',saveScroll,{passive:true});
  window.addEventListener('pagehide',saveScroll);
  window.addEventListener('beforeunload',saveScroll);
  const restoreScroll=()=>{let y=0;try{y=Number(sessionStorage.getItem(scrollKey())||0);}catch{}if(y>0){let tries=0;const apply=()=>{window.scrollTo(0,y);if(++tries<12&&Math.abs((window.scrollY||0)-y)>2)setTimeout(apply,80);};requestAnimationFrame(apply);}};
  window.addEventListener('load',()=>setTimeout(restoreScroll,0));

  state.customerSearch=state.customerSearch||'';
  const previousRenderCustomers=renderCustomers;
  renderCustomers=function(){
    const q=String(state.customerSearch||'').trim().toLowerCase();
    const all=[...state.customers].sort((a,b)=>customerDisplayName(a).localeCompare(customerDisplayName(b)));
    const rows=q?all.filter(c=>[customerDisplayName(c),c.phone,c.mobile,c.email,c.licence_number,c.license_number,c.driver_licence_number,c.driver_license_number,c.passport_number,c.passport].some(v=>String(v||'').toLowerCase().includes(q))):all;
    return `<div class="section-title"><div><h2>Customers</h2><p>Tap a customer to open their active rental or profile</p></div><button class="btn btn-primary" id="newCustomerBtn">Add Customer</button></div>
      <div class="panel"><div class="panel-body"><div class="field"><label for="customerListSearch">Search customers</label><input id="customerListSearch" type="search" autocomplete="off" placeholder="Name, phone, email, licence or passport" value="${esc(state.customerSearch)}"></div><div class="vehicle-meta" id="customerSearchCount" style="margin-top:8px">${rows.length} of ${all.length} customers shown</div></div></div>
      <div class="panel compact-customer-list" style="margin-top:14px">${rows.length?rows.map(c=>{const active=activeRentalForCustomer(c.id),open=state.rentals.filter(r=>String(r.customer_id)===String(c.id)&&['Active','Reserved','Confirmed'].includes(r.status)).length;return `<button type="button" class="compact-customer-row" data-customer-row="${esc(c.id)}"><div><strong>${esc(customerDisplayName(c))}</strong><div class="compact-customer-meta">${active?`Rental #${esc(active.id)}`:'No current rental'} · ${open} open</div></div><div class="compact-customer-phone compact-customer-meta">${esc(c.phone||c.mobile||'No phone')}</div><div class="compact-customer-money">${money(customerOutstanding(c.id))}</div></button>`}).join(''):'<div class="empty">No customers match your search.</div>'}</div>`;
  };

  const previousBindPageEvents=bindPageEvents;
  bindPageEvents=function(){
    previousBindPageEvents.apply(this,arguments);
    if(state.page!=='customers')return;
    const input=document.getElementById('customerListSearch');
    if(input)input.addEventListener('input',e=>{const pos=e.target.selectionStart;state.customerSearch=e.target.value;render();requestAnimationFrame(()=>{const next=document.getElementById('customerListSearch');if(next){next.focus();try{next.setSelectionRange(pos,pos);}catch{}}});});
  };
})();