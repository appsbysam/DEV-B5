/* B5 v0.8.84 — clickable dashboard drill-down rows */
(function(){
  const previousDashboardVehicleTable=dashboardVehicleTable;

  dashboardVehicleTable=function(rows){
    if(!rows.length) return '<div class="empty">No vehicles in this group.</div>';
    return `<table class="dashboard-vehicle-table"><thead><tr><th>Vehicle</th><th>Plate</th><th>Source</th><th>Status</th><th>Rate</th></tr></thead><tbody>${rows.map(v=>`<tr class="clickable-row dashboard-vehicle-row" data-dashboard-vehicle="${esc(v.id)}"><td data-label="Vehicle"><strong>${esc(v.make)} ${esc(v.model)}</strong></td><td data-label="Plate">${esc(v.plate||'—')}</td><td data-label="Source">${esc(v.source||v.source_type||'')}</td><td data-label="Status"><span class="badge ${statusClass(effectiveVehicleStatus(v))}">${esc(effectiveVehicleStatus(v))}</span></td><td data-label="Rate">${money(v.rate)}</td></tr>`).join('')}</tbody></table>`;
  };

  document.addEventListener('click',e=>{
    const row=e.target.closest('[data-dashboard-vehicle]');
    if(!row)return;
    e.preventDefault();
    e.stopImmediatePropagation();
    if(typeof openVehicleDetails==='function') openVehicleDetails(row.dataset.dashboardVehicle);
  },true);
})();