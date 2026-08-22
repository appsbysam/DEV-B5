/* B5 v0.8.51 — compact mobile layouts and collapsible filters */
Object.assign(state,{fleetFiltersOpen:false,calendarFiltersOpen:false,expenseFiltersOpen:false});

function activeFilterCount(prefix){
  const maps={fleet:["fleetSearch","fleetCategory","fleetMake","fleetSource","fleetStatus","fleetMinRate","fleetMaxRate"],calendar:["calendarSearch","calendarCategory","calendarSource","calendarStatus","calendarMinRate","calendarMaxRate"],expense:["expenseSearch","expenseCategory","expenseVehicle","expenseStart","expenseEnd"]};
  let n=(maps[prefix]||[]).filter(k=>String(state[k]??"").trim()!=="").length;
  if(prefix==="expense"&&state.expenseScope&&state.expenseScope!=="all")n++;
  return n;
}
function compactFilterPanel(kind,inner,summary){const open=!!state[kind+"FiltersOpen"],count=activeFilterCount(kind);return `<div class="panel ${kind}-filter-panel"><div class="compact-filter-toggle"><div><strong>Search & Filters</strong><div class="compact-filter-summary">${esc(summary)}${count?` · ${count} active`:""}</div></div><button type="button" class="btn btn-small btn-secondary" data-toggle-compact-filter="${kind}">${open?"Hide Filters":"Show Filters"}</button></div><div class="compact-filter-body" ${open?"":"hidden"}>${inner}</div></div>`;}

const _renderCustomers085=renderCustomers;
renderCustomers=function(){
  const rows=[...state.customers].sort((a,b)=>customerDisplayName(a).localeCompare(customerDisplayName(b)));
  return `<div class="section-title"><div><h2>Customers</h2><p>Tap a customer to open their active rental or profile</p></div><button class="btn btn-primary" id="newCustomerBtn">Add Customer</button></div><div class="panel compact-customer-list">${rows.map(c=>{const active=activeRentalForCustomer(c.id),open=state.rentals.filter(r=>String(r.customer_id)===String(c.id)&&["Active","Reserved","Confirmed"].includes(r.status)).length;return `<button type="button" class="compact-customer-row" data-customer-row="${esc(c.id)}"><div><strong>${esc(customerDisplayName(c))}</strong><div class="compact-customer-meta">${active?`Rental #${esc(active.id)}`:"No current rental"} · ${open} open</div></div><div class="compact-customer-phone compact-customer-meta">${esc(c.phone||c.mobile||"No phone")}</div><div class="compact-customer-money">${money(customerOutstanding(c.id))}</div></button>`}).join("")}</div>`;
};

const _renderFleet085=renderFleet;
renderFleet=function(){
  const html=_renderFleet085(), rows=filteredFleetVehicles();
  const m=html.match(/<div class="panel fleet-filter-panel">([\s\S]*?)<\/div><\/div><div class="vehicle-grid fleet-smart-grid">/);
  if(!m)return html;
  const inner=m[1];
  return html.replace(m[0],compactFilterPanel("fleet",inner,`${rows.length} of ${state.vehicles.length} vehicles shown`)+`<div class="vehicle-grid fleet-smart-grid">`);
};

const _renderCalendar085=renderCalendar;
renderCalendar=function(){
  const html=_renderCalendar085(), rows=filteredCalendarVehicles();
  const marker='<div class="panel" style="margin-top:14px"><div class="panel-head"><h3>Fleet Timeline — Next 14 Days</h3>';
  const i=html.indexOf(marker); if(i<0)return html;
  const controls=html.slice(0,i),timeline=html.slice(i);
  const body=controls.replace(/^\s*<div class="calendar-controls panel"><div class="panel-body">/,'').replace(/<\/div><\/div>\s*$/,'');
  return compactFilterPanel("calendar",body,`${rows.length} vehicles shown`)+timeline;
};

const _renderExpenses085=renderExpenses;
renderExpenses=function(){
  const html=_renderExpenses085();
  const start=html.indexOf('<div class="panel"><div class="panel-body"><div class="expense-filter-grid">');
  if(start<0)return html;
  const after=html.indexOf('<div class="panel" style="margin-top:14px">',start);
  if(after<0)return html;
  const panel=html.slice(start,after), body=panel.replace(/^<div class="panel"><div class="panel-body">/,'').replace(/<\/div><\/div>$/,'');
  const rows=filteredExpenses();
  return html.slice(0,start)+compactFilterPanel("expense",body,`${rows.length} expenses · ${money(rows.reduce((s,x)=>s+x.amount,0))}`)+html.slice(after);
};

const _renderSuppliers085=renderSuppliers;
renderSuppliers=function(){return _renderSuppliers085().replace('class="supplier-toolbar"','class="supplier-toolbar compact-toolbar"').replace('class="vehicle-grid"','class="vehicle-grid supplier-compact-grid"').replaceAll('class="vehicle-card supplier-drill-card"','class="vehicle-card supplier-drill-card compact-list-card"');};

const _renderLocations085=renderLocations;
renderLocations=function(){return _renderLocations085().replace('<table>','<table class="location-compact-table">');};

function todayCompactRentalTable(rows){if(!rows.length)return `<div class="empty">Nothing scheduled.</div>`;return `<table class="today-compact-table"><thead><tr><th>Rental</th><th>Vehicle</th><th>Customer</th><th>Pickup</th><th>Return</th><th>Status</th></tr></thead><tbody>${rows.map(r=>{const v=vehicleById(r.vehicle_id);return `<tr class="clickable-row" data-rental-row="${esc(r.uuid)}"><td data-label="Rental">#${esc(r.id)}</td><td data-label="Vehicle">${v?`${esc(v.make)} ${esc(v.model)} · ${esc(v.plate||"")}`:"Unassigned"}</td><td data-label="Customer">${esc(r.customer)}</td><td data-label="Pickup">${fmtDate(r.start)} · ${esc(r.pickup)}</td><td data-label="Return">${fmtDate(r.end)} · ${esc(r.dropoff)}</td><td data-label="Status"><span class="badge ${statusClass(r.status)}">${esc(r.status)}</span></td></tr>`}).join("")}</tbody></table>`;}
const _renderTodayDetail085=renderTodayDetail;
renderTodayDetail=function(view,data){if(view==="returns")return `<div class="panel"><div class="panel-head"><h3>Returns Today</h3><span class="badge badge-out">${data.ret.length}</span></div><div class="table-wrap">${todayCompactRentalTable(data.ret)}</div></div>`;if(view==="pickups")return `<div class="panel"><div class="panel-head"><h3>Pickups Today</h3><span class="badge badge-reserved">${data.pick.length}</span></div><div class="table-wrap">${todayCompactRentalTable(data.pick)}</div></div>`;return _renderTodayDetail085(view,data);};

const _renderReports085=renderReports;
renderReports=function(){return `<div class="report-compact">${_renderReports085()}</div>`;};

const _bindPageEvents085=bindPageEvents;
bindPageEvents=function(){
  _bindPageEvents085();
  $$('[data-toggle-compact-filter]').forEach(btn=>btn.addEventListener('click',()=>{const k=btn.dataset.toggleCompactFilter;state[k+'FiltersOpen']=!state[k+'FiltersOpen'];render();}));
  $$('[data-customer-row]').forEach(row=>row.addEventListener('click',()=>{const id=row.dataset.customerRow,active=activeRentalForCustomer(id);if(active)openRentalInRentals(active.uuid);else openCustomerProfile(id);}));
  $$('[data-rental-row]').forEach(row=>row.addEventListener('click',()=>openRentalInRentals(row.dataset.rentalRow)));
};
