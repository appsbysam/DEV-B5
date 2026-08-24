/* B5 v0.9.7 — login resilience, sign-out access and location polish */
(function(){
  renderLocations=function(){
    return `<div class="section-title"><div><h2>Locations & Fees</h2><p>Pickup, drop-off and transfer pricing</p></div></div><div class="panel"><div class="table-wrap"><table class="locations-fees-table"><thead><tr><th>Location</th><th>Pickup Fee</th><th>Drop-off Fee</th><th>Transfer Buffer</th></tr></thead><tbody>${state.locations.map(l=>`<tr><td data-label="Location:">${esc(l.name)}</td><td data-label="Pickup:">${money(l.pickup_fee)}</td><td data-label="Drop-off:">${money(l.dropoff_fee)}</td><td data-label="Buffer:">${esc(l.turnaround_minutes||0)} mins</td></tr>`).join('')}</tbody></table></div></div>`;
  };

  function triggerSignOut(){const main=document.getElementById('logoutBtn');if(main){main.click();return;}window.db?.auth?.signOut?.();}
  const footer=document.querySelector('.sidebar-footer');
  if(footer&&!document.getElementById('sidebarSignOut')){const btn=document.createElement('button');btn.type='button';btn.id='sidebarSignOut';btn.className='btn btn-secondary sidebar-signout';btn.textContent='Sign Out';btn.addEventListener('click',triggerSignOut);footer.appendChild(btn);}

  const previousOpenUserProfile=openUserProfile;
  openUserProfile=async function(){const result=await previousOpenUserProfile();const body=document.getElementById('profileBody');if(body&&!body.querySelector('.manager-user-profile')&&!document.getElementById('profileSignOut')){const box=document.createElement('div');box.className='profile-signout-section';box.innerHTML='<button type="button" class="btn btn-secondary" id="profileSignOut">Sign Out</button>';body.appendChild(box);document.getElementById('profileSignOut').onclick=()=>{document.getElementById('profileModal')?.close();triggerSignOut();};}return result;};

  const previousLoadSupabaseData=loadSupabaseData;let retryingInitialLoad=false;
  loadSupabaseData=async function(){await previousLoadSupabaseData();const message=String(state.error||'');const transient=!state.live&&/permission denied|jwt|not authenticated|network|fetch|failed to fetch|connection/i.test(message);if(transient&&!retryingInitialLoad){retryingInitialLoad=true;try{await new Promise(resolve=>setTimeout(resolve,650));const {data}=await window.db.auth.getSession();if(data?.session)await previousLoadSupabaseData();}finally{retryingInitialLoad=false;}}try{setManagerVisibility();applyPermissionNavigation?.();}catch(_){ }};
})();

/* B5 v0.9.12 — preserve vehicle context through child modals and reorder financial tiles. */
(function(){
  const originalOpenVehicleDetails=openVehicleDetails;
  function childModal(vehicleId,opener){
    const parent=document.getElementById('modal');if(parent?.open)parent.close();
    setTimeout(()=>{opener(vehicleId);const dlg=document.getElementById('modal');if(!dlg)return;dlg.addEventListener('close',()=>setTimeout(()=>openVehicleDetails(vehicleId),70),{once:true});},70);
  }
  openVehicleDetails=function(vehicleId){
    originalOpenVehicleDetails(vehicleId);
    const summary=document.querySelector('#modalBody .vehicle-detail-summary');
    if(summary){const tiles=[...summary.children],order=['Purchase Cost','Expenses','Rental Income','Operating Profit'];order.forEach(label=>{const tile=tiles.find(x=>x.textContent.trim().toLowerCase().startsWith(label.toLowerCase()));if(tile)summary.appendChild(tile);});}
    const purchase=document.getElementById('editVehiclePurchase'),expense=document.getElementById('addVehicleExpense'),maintenance=document.getElementById('addVehicleMaintenance');
    if(purchase)purchase.onclick=()=>childModal(vehicleId,vehiclePurchaseModal);
    if(expense)expense.onclick=()=>childModal(vehicleId,vehicleExpenseModal);
    if(maintenance)maintenance.onclick=()=>childModal(vehicleId,vehicleMaintenanceModal);
  };
})();
