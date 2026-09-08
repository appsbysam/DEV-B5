/* B5 v0.9.17 — permanent Customers database live search */
(function(){
  function searchable(c){return [c?.first_name,c?.family_name,c?.full_name,c?.mobile,c?.secondary_phone,c?.email,c?.license_number,c?.passport_number].filter(Boolean).join(' ').toLowerCase();}
  function enhanceCustomerDatabase(){
    if(state.page!=='customers')return;
    const content=document.getElementById('content');
    const table=content?.querySelector('table');
    if(!content||!table)return;
    let box=document.getElementById('customerDatabaseSearch');
    if(!box){
      box=document.createElement('div');box.id='customerDatabaseSearch';box.className='b5-customer-search';
      box.innerHTML='<div class="field"><label>Search Customers</label><input id="customerDatabaseSearchInput" type="search" autocomplete="off" placeholder="Start typing a name, phone, email, licence or passport…"></div><div id="customerDatabaseSearchCount" class="vehicle-meta"></div>';
      const title=content.querySelector('.section-title');
      if(title)title.insertAdjacentElement('afterend',box);else content.prepend(box);
    }
    const input=document.getElementById('customerDatabaseSearchInput'),count=document.getElementById('customerDatabaseSearchCount');
    const rows=[...table.querySelectorAll('tbody tr')];
    rows.forEach((row,i)=>{
      const c=state.customers[i];if(!c)return;
      row.dataset.customerDbId=c.id;row.classList.add('b5-selectable-row');row.tabIndex=0;row.title='Open customer';
      row.onclick=()=>{if(typeof window.openCustomerAccount==='function')window.openCustomerAccount(c.id);};
      row.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();row.click();}};
    });
    function apply(){
      const q=(input?.value||'').trim().toLowerCase();let shown=0;
      rows.forEach(row=>{const c=state.customers.find(x=>String(x.id)===String(row.dataset.customerDbId));const visible=!q||searchable(c).includes(q);row.hidden=!visible;if(visible)shown++;});
      if(count)count.textContent=q?`${shown} matching customer${shown===1?'':'s'}`:`${shown} customer${shown===1?'':'s'}`;
    }
    if(input){input.oninput=apply;input.onsearch=apply;}apply();
  }
  const previousRender=render;
  render=function(){const result=previousRender.apply(this,arguments);setTimeout(enhanceCustomerDatabase,0);return result;};
  window.b5EnhanceCustomerDatabaseSearch=enhanceCustomerDatabase;
})();