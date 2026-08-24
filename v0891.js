/* B5 v0.9.1 — login resilience, sign-out access and location label polish */
(function(){
  // Location rows: keep the compact mobile presentation but make labels read naturally.
  renderLocations=function(){
    return `<div class="section-title"><div><h2>Locations & Fees</h2><p>Pickup, drop-off and transfer pricing</p></div></div>
      <div class="panel"><div class="table-wrap"><table class="locations-fees-table">
        <thead><tr><th>Location</th><th>Pickup Fee</th><th>Drop-off Fee</th><th>Transfer Buffer</th></tr></thead>
        <tbody>${state.locations.map(l=>`<tr><td data-label="Location:">${esc(l.name)}</td><td data-label="Pickup:">${money(l.pickup_fee)}</td><td data-label="Drop-off:">${money(l.dropoff_fee)}</td><td data-label="Buffer:">${esc(l.turnaround_minutes||0)} mins</td></tr>`).join('')}</tbody>
      </table></div></div>`;
  };

  function triggerSignOut(){
    const main=document.getElementById('logoutBtn');
    if(main){main.click();return;}
    window.db?.auth?.signOut?.();
  }

  // Mobile-friendly sign out at the bottom of the sidebar.
  const footer=document.querySelector('.sidebar-footer');
  if(footer&&!document.getElementById('sidebarSignOut')){
    const btn=document.createElement('button');
    btn.type='button';
    btn.id='sidebarSignOut';
    btn.className='btn btn-secondary sidebar-signout';
    btn.textContent='Sign Out';
    btn.addEventListener('click',triggerSignOut);
    footer.appendChild(btn);
  }

  // Also expose Sign Out in the user's own profile. Manager-edited user profiles are excluded.
  const previousOpenUserProfile=openUserProfile;
  openUserProfile=async function(){
    const result=await previousOpenUserProfile();
    const body=document.getElementById('profileBody');
    if(body&&!body.querySelector('.manager-user-profile')&&!document.getElementById('profileSignOut')){
      const box=document.createElement('div');
      box.className='profile-signout-section';
      box.innerHTML='<button type="button" class="btn btn-secondary" id="profileSignOut">Sign Out</button>';
      body.appendChild(box);
      document.getElementById('profileSignOut').onclick=()=>{
        document.getElementById('profileModal')?.close();
        triggerSignOut();
      };
    }
    return result;
  };

  // A just-established Supabase session can occasionally race the first batch of data requests
  // on mobile/PWA startup. Retry once for transient authentication/network failures instead of
  // leaving the app in an empty-data state until the user fully relaunches it.
  const previousLoadSupabaseData=loadSupabaseData;
  let retryingInitialLoad=false;
  loadSupabaseData=async function(){
    await previousLoadSupabaseData();
    const message=String(state.error||'');
    const transient=!state.live&&/permission denied|jwt|not authenticated|network|fetch|failed to fetch|connection/i.test(message);
    if(transient&&!retryingInitialLoad){
      retryingInitialLoad=true;
      try{
        await new Promise(resolve=>setTimeout(resolve,650));
        const {data}=await window.db.auth.getSession();
        if(data?.session)await previousLoadSupabaseData();
      }finally{retryingInitialLoad=false;}
    }
    try{setManagerVisibility();applyPermissionNavigation?.();}catch(_){ }
  };
})();
