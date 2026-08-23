/* B5 v0.8.83 — direct customer/Today navigation */
(function(){
  function closeStandardModal(){document.getElementById('modal')?.close();}

  function openRentalFull(uuid){
    if(typeof openRentalDetails==='function') openRentalDetails(uuid);
    else if(typeof openRentalDirect==='function') openRentalDirect(uuid);
    else openRentalInRentals(uuid);
  }

  function todayRentalList(rows){
    if(!rows.length) return '<div class="empty">Nothing scheduled.</div>';
    return `<div class="today-direct-list">${rows.map(r=>{const v=vehicleById(r.vehicle_id);return `<button type="button" class="today-direct-card" data-today-rental="${esc(r.uuid)}"><span class="today-direct-main"><strong>#${esc(r.id)} · ${esc(r.customer)}</strong><small>${v?`${esc(v.make)} ${esc(v.model)} · ${esc(v.plate||'')}`:'Unassigned vehicle'}</small></span><span class="today-direct-meta"><small>Pickup</small><strong>${fmtDate(r.start)}</strong><small>Return</small><strong>${fmtDate(r.end)}</strong></span><span class="badge ${statusClass(r.status)}">${esc(r.status)}</span></button>`}).join('')}</div>`;
  }

  function todayVehicleList(rows){
    if(!rows.length) return '<div class="empty">No vehicles in this group.</div>';
    return `<div class="today-direct-list">${rows.map(v=>`<button type="button" class="today-direct-card" data-today-vehicle="${esc(v.id)}"><span class="today-direct-main"><strong>${esc(v.make)} ${esc(v.model)}</strong><small>${esc(v.plate||'No plate')} · ${esc(v.category||'')}</small></span><span class="today-direct-meta"><small>Status</small><strong>${esc(effectiveVehicleStatus(v))}</strong><small>Rate</small><strong>${Number(v.rate)>0?`${money(v.rate)}/day`:'Not loaded'}</strong></span><span class="badge ${statusClass(effectiveVehicleStatus(v))}">${esc(effectiveVehicleStatus(v))}</span></button>`).join('')}</div>`;
  }

  function openTodayTile(kind){
    const today=todayDate();
    const ret=state.rentals.filter(r=>!["Completed","Cancelled"].includes(r.status)&&sameDay(r.end,today));
    const pick=state.rentals.filter(r=>["Reserved","Confirmed"].includes(r.status)&&sameDay(r.start,today));
    const avail=state.vehicles.filter(v=>effectiveVehicleStatus(v)==="Available");
    const external=state.vehicles.filter(v=>v.source==="External"&&effectiveVehicleStatus(v)!=="Available");
    const defs={returns:['Returns Today',todayRentalList(ret)],pickups:['Pickups Today',todayRentalList(pick)],available:['Vehicles Available in Office',todayVehicleList(avail)],external:['External Vehicles Requiring Action',todayVehicleList(external)]};
    const d=defs[kind];if(!d)return;
    openModal(d[0],d[1],null,'Close');
    document.getElementById('modalForm').onsubmit=e=>{e.preventDefault();closeStandardModal();};
    document.querySelectorAll('[data-today-rental]').forEach(b=>b.onclick=()=>{const id=b.dataset.todayRental;closeStandardModal();setTimeout(()=>openRentalFull(id),20);});
    document.querySelectorAll('[data-today-vehicle]').forEach(b=>b.onclick=()=>{const id=b.dataset.todayVehicle;closeStandardModal();setTimeout(()=>openVehicleDetails(id),20);});
  }

  /* Capture these clicks before older handlers can route through Rentals + smooth-scroll. */
  document.addEventListener('click',e=>{
    const customer=e.target.closest('[data-customer-row]');
    if(customer){
      e.preventDefault();e.stopImmediatePropagation();
      const id=customer.dataset.customerRow,active=activeRentalForCustomer(id);
      if(active) openRentalFull(active.uuid); else openCustomerProfile(id);
      return;
    }
    const profileRental=e.target.closest('[data-profile-rental]');
    if(profileRental){
      e.preventDefault();e.stopImmediatePropagation();
      const id=profileRental.dataset.profileRental;closeStandardModal();setTimeout(()=>openRentalFull(id),20);return;
    }
    const profileOpen=e.target.closest('#profileOpenRental');
    if(profileOpen){
      const modal=document.getElementById('modal'), customerId=profileOpen.closest('.modal-card')?null:null;
      e.preventDefault();e.stopImmediatePropagation();
      /* Existing customer profile already holds its active-rental handler, so use the currently visible current-rental row when available. */
      const first=document.querySelector('[data-profile-rental]');
      if(first){const id=first.dataset.profileRental;closeStandardModal();setTimeout(()=>openRentalFull(id),20);}return;
    }
    const tile=e.target.closest('[data-today-detail]');
    if(tile){
      e.preventDefault();e.stopImmediatePropagation();
      openTodayTile(tile.dataset.todayDetail);
    }
  },true);
})();