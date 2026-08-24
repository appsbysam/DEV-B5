/* B5 v0.8.88 — direct notification deep-links + robust overdue row opening */
(function(){
  function openRental(uuid){
    if(!uuid)return false;
    const exists=(state.rentals||[]).some(r=>String(r.uuid||r.id)===String(uuid));
    if(!exists)return false;
    if(typeof openRentalDetails==='function')openRentalDetails(uuid);
    else if(typeof openRentalDirect==='function')openRentalDirect(uuid);
    else if(typeof openRentalInRentals==='function')openRentalInRentals(uuid);
    return true;
  }
  function rentalByNumber(number){
    const n=String(number||'').replace(/^#/,'').trim();
    return (state.rentals||[]).find(r=>String(r.id||r.agreement_number||'')===n)||null;
  }
  function openVehicle(id){
    if(!id)return false;
    const exists=(state.vehicles||[]).some(v=>String(v.id)===String(id));
    if(!exists)return false;
    if(typeof openVehicleDetails==='function')openVehicleDetails(id);
    return true;
  }
  function consumeDeepLink(){
    const hash=(location.hash||'').replace(/^#/,'');
    if(!hash)return true;
    let handled=false;
    if(hash.startsWith('rental=')) handled=openRental(decodeURIComponent(hash.slice(7)));
    else if(hash.startsWith('rental-number=')){
      const r=rentalByNumber(decodeURIComponent(hash.slice(14)));
      handled=!!r&&openRental(r.uuid||r.id);
    }else if(hash.startsWith('vehicle=')) handled=openVehicle(decodeURIComponent(hash.slice(8)));
    if(handled){history.replaceState(null,'',location.pathname+location.search+'#dashboard');return true;}
    return !/^(rental=|rental-number=|vehicle=)/.test(hash);
  }
  function waitForDeepLink(){
    let tries=0;const timer=setInterval(()=>{tries++;if(consumeDeepLink()||tries>120)clearInterval(timer);},500);
  }
  window.addEventListener('hashchange',waitForDeepLink);
  window.addEventListener('load',waitForDeepLink);
  setTimeout(waitForDeepLink,200);

  function rentalFromOverdueRow(row){
    const direct=row?.dataset?.overdueRental||row?.querySelector?.('[data-open-rental]')?.dataset?.openRental||'';
    if(direct)return direct;
    const text=row?.textContent||'';
    const m=text.match(/#\s*(\d+)/);
    if(!m)return '';
    const r=rentalByNumber(m[1]);
    return r?.uuid||r?.id||'';
  }
  function decorateOverdueRows(root=document){
    root.querySelectorAll?.('.overdue-rental-row').forEach(row=>{const id=rentalFromOverdueRow(row);if(id){row.dataset.overdueRental=id;row.classList.add('clickable-row');}});
  }
  const observer=new MutationObserver(muts=>muts.forEach(m=>m.addedNodes.forEach(n=>{if(n.nodeType===1){decorateOverdueRows(n);if(n.matches?.('.overdue-rental-row'))decorateOverdueRows(n.parentElement||document);}})));
  window.addEventListener('load',()=>{decorateOverdueRows();observer.observe(document.body,{childList:true,subtree:true});});
  document.addEventListener('click',e=>{
    const row=e.target.closest?.('.overdue-rental-row');if(!row)return;
    if(e.target.closest('button,a,.overdue-actions'))return;
    const id=rentalFromOverdueRow(row);if(!id)return;
    e.preventDefault();e.stopImmediatePropagation();openRental(id);
  },true);

  if('serviceWorker'in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js?v=0.8.88',{scope:'./'}).catch(console.warn));
})();
