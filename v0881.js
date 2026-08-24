/* B5 v0.8.88 — direct notification deep-links + robust overdue row opening */
(function(){
  function rentalByRef(ref){const key=String(ref||'').replace(/^#/,'').trim();return (state.rentals||[]).find(r=>String(r.uuid)===key||String(r.id)===key)||null;}
  function openRental(ref){const r=rentalByRef(ref);if(!r)return false;const id=r.uuid||r.id;if(typeof openRentalDetails==='function')openRentalDetails(id);else if(typeof openRentalInRentals==='function')openRentalInRentals(id);else if(typeof openRentalDirect==='function')openRentalDirect(id);return true;}
  function openVehicle(id){if(!id||(state.vehicles||[]).every(v=>String(v.id)!==String(id)))return false;if(typeof openVehicleDetails==='function')openVehicleDetails(id);return true;}
  function consumeDeepLink(){const hash=(location.hash||'').replace(/^#/,'');if(!hash)return true;let handled=false;if(hash.startsWith('rental='))handled=openRental(decodeURIComponent(hash.slice(7)));else if(hash.startsWith('rental-number='))handled=openRental(decodeURIComponent(hash.slice(14)));else if(hash.startsWith('vehicle='))handled=openVehicle(decodeURIComponent(hash.slice(8)));if(handled){history.replaceState(null,'',location.pathname+location.search+'#dashboard');return true;}return !/^(rental=|rental-number=|vehicle=)/.test(hash);}
  function waitForDeepLink(){let tries=0;const timer=setInterval(()=>{tries++;if(consumeDeepLink()||tries>120)clearInterval(timer);},500);}
  window.addEventListener('hashchange',waitForDeepLink);window.addEventListener('load',waitForDeepLink);setTimeout(waitForDeepLink,200);
  function rentalFromOverdueRow(row){const direct=row?.dataset?.overdueRental||row?.querySelector?.('[data-open-rental]')?.dataset?.openRental||'';if(direct){const r=rentalByRef(direct);return r?.uuid||r?.id||direct;}const m=(row?.textContent||'').match(/#\s*(\d+)/);if(!m)return '';const r=rentalByRef(m[1]);return r?.uuid||r?.id||'';}
  function decorateOverdueRows(root=document){root.querySelectorAll?.('.overdue-rental-row').forEach(row=>{const id=rentalFromOverdueRow(row);if(id){row.dataset.overdueRental=id;row.classList.add('clickable-row');}});}
  const observer=new MutationObserver(muts=>muts.forEach(m=>m.addedNodes.forEach(n=>{if(n.nodeType===1){decorateOverdueRows(n);if(n.matches?.('.overdue-rental-row'))decorateOverdueRows(n.parentElement||document);}})));
  window.addEventListener('load',()=>{decorateOverdueRows();observer.observe(document.body,{childList:true,subtree:true});});
  document.addEventListener('click',e=>{const row=e.target.closest?.('.overdue-rental-row');if(!row||e.target.closest('button,a,.overdue-actions'))return;const id=rentalFromOverdueRow(row);if(!id)return;e.preventDefault();e.stopImmediatePropagation();openRental(id);},true);
  if('serviceWorker'in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js?v=0.8.88',{scope:'./'}).catch(console.warn));
})();
