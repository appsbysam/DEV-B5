/* B5 v0.8.96 — flexible Rentals sorting */
Object.assign(state, {
  rentalSort: state.rentalSort || "pickup",
  rentalSortDir: state.rentalSortDir || "desc"
});

function rentalSortValue(r, key){
  const vehicle = vehicleById(r.vehicle_id);
  const customer = customerById(r.customer_id);
  if(key === "contract") return String(r.id || "");
  if(key === "customer") return customerDisplayName(customer).toLowerCase();
  if(key === "vehicle") return `${vehicle?.make || ""} ${vehicle?.model || ""}`.trim().toLowerCase();
  if(key === "type") return String(vehicle?.category || "").toLowerCase();
  return r.start ? new Date(r.start).getTime() : 0;
}

function sortRentalRows(rows){
  const key = state.rentalSort || "pickup";
  const dir = state.rentalSortDir === "asc" ? 1 : -1;
  return rows.sort((a,b)=>{
    const av = rentalSortValue(a,key), bv = rentalSortValue(b,key);
    if(typeof av === "number" && typeof bv === "number") return (av-bv)*dir;
    return String(av).localeCompare(String(bv), undefined, {numeric:true, sensitivity:"base"})*dir;
  });
}

renderRentals=function(){
  const q=state.rentalSearch.trim();
  let rows=state.rentals.filter(r=>rentalMatches(r,q));
  if(state.rentalView==="open") rows=rows.filter(r=>["Active","Confirmed","Reserved"].includes(r.status));
  if(state.rentalView==="history") rows=rows.filter(r=>["Completed","Cancelled"].includes(r.status));
  sortRentalRows(rows);
  const open=state.rentals.filter(r=>["Active","Confirmed","Reserved"].includes(r.status)).length;
  const completed=state.rentals.filter(r=>r.status==="Completed").length;
  const outstanding=state.rentals.reduce((s,r)=>s+Math.max(0,rentalFinancials(r.uuid).balance),0);
  const orderLabels = state.rentalSort === "pickup"
    ? {asc:"Oldest First",desc:"Newest First"}
    : {asc:"Ascending",desc:"Descending"};
  return `<div class="section-title"><div><h2>Rental Agreements</h2><p>Search current rentals or review full rental history</p></div><button class="btn btn-primary" id="newRentalBtn">New Rental</button></div>
  <div class="kpi-mini">${stat("Open",open,"Active / reserved")}${stat("History",completed,"Completed")}${stat("Payments",state.payments.length,"Recorded")}${stat("Outstanding",money(outstanding),"Customer balances")}</div>
  <div class="panel rental-search-panel"><div class="panel-body">
    <div class="rental-search-row">
      <div class="field"><label>Search Rentals</label><input id="rentalSearch" value="${esc(state.rentalSearch)}" placeholder="Customer name, phone, vehicle, plate or rental #"></div>
      <div class="rental-tabs"><button class="btn btn-small ${state.rentalView==="open"?"btn-primary":"btn-secondary"}" data-rental-view="open">Open</button><button class="btn btn-small ${state.rentalView==="history"?"btn-primary":"btn-secondary"}" data-rental-view="history">History</button><button class="btn btn-small ${state.rentalView==="all"?"btn-primary":"btn-secondary"}" data-rental-view="all">All</button></div>
    </div>
    <div class="rental-search-row rental-sort-row">
      <div class="field"><label>Sort by</label><select id="rentalSort"><option value="pickup" ${state.rentalSort==="pickup"?"selected":""}>Pickup Date</option><option value="contract" ${state.rentalSort==="contract"?"selected":""}>Rental / Contract #</option><option value="customer" ${state.rentalSort==="customer"?"selected":""}>Customer Name</option><option value="vehicle" ${state.rentalSort==="vehicle"?"selected":""}>Vehicle</option><option value="type" ${state.rentalSort==="type"?"selected":""}>Vehicle Type</option></select></div>
      <div class="field"><label>Order</label><select id="rentalSortDir"><option value="desc" ${state.rentalSortDir==="desc"?"selected":""}>${orderLabels.desc}</option><option value="asc" ${state.rentalSortDir==="asc"?"selected":""}>${orderLabels.asc}</option></select></div>
    </div>
    <div class="vehicle-meta">${rows.length} matching rental${rows.length===1?"":"s"}</div>
  </div></div>
  <div class="rental-results-grid">${rows.length?rows.map(r=>rentalCard(r,["Completed","Cancelled"].includes(r.status))).join(""):`<div class="panel"><div class="empty">No rentals match these filters.</div></div>`}</div>`;
};

document.addEventListener("change", e=>{
  if(e.target?.id === "rentalSort"){
    state.rentalSort=e.target.value;
    render();
  }
  if(e.target?.id === "rentalSortDir"){
    state.rentalSortDir=e.target.value;
    render();
  }
});
