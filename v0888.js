/* B5 v0.8.98 — permission enforcement + access hardening */
(function(){
  const fallbackRole=(p)=>((p?.role||'').toLowerCase()==='manager'?'manager':'office');

  // Fix the original profile loader: custom role/permission fields must be loaded for the signed-in user.
  loadUserProfile=async function(){
    if(!window.db)return null;
    const user=await currentAuthUser();
    if(!user)return null;
    const {data,error}=await window.db.from('staff_profiles')
      .select('user_id,email,display_name,role,active,permission_role,permissions,notification_preferences,must_change_password')
      .eq('user_id',user.id).maybeSingle();
    if(error){
      console.error('Could not load staff access profile',error);
      return {user_id:user.id,email:user.email,display_name:user.email,role:'staff',active:false,permission_role:'office',permissions:{}};
    }
    return data||{user_id:user.id,email:user.email,display_name:user.email,role:'staff',active:false,permission_role:'office',permissions:{}};
  };

  // Permission dependencies: an action cannot survive if its parent area is disabled.
  const rawCan=can;
  const parentPermission={
    'rentals.create':'rentals.view','rentals.edit':'rentals.view','rentals.return':'rentals.view',
    'contracts.edit':'contracts.view','contracts.finalise':'contracts.view',
    'fleet.edit':'fleet.view','customers.edit':'customers.view','users.manage':'manager'
  };
  can=function(key,p=state.userProfile){
    if(!p||p.active===false)return false;
    const parent=parentPermission[key];
    if(parent&&!rawCan(parent,p))return false;
    return rawCan(key,p);
  };

  function firstAllowedPage(p=state.userProfile){
    return ['dashboard','today','availability','rentals','calendar','fleet','customers','suppliers','locations','expenses','reports','settings','manager']
      .find(page=>can(pagePermission(page),p))||null;
  }

  // Manager visibility now respects the permission switch, not merely the legacy role field.
  setManagerVisibility=function(){
    const allowed=!!state.userProfile&&can('manager');
    const btn=document.getElementById('managerNav'),top=document.getElementById('managerTopBtn');
    if(btn)btn.hidden=!allowed;if(top)top.hidden=!allowed;
    if(state.page==='manager'&&!allowed)state.page=firstAllowedPage()||'dashboard';
  };

  // Called by auth.js before B5 starts. Inactive/missing profiles are refused entry.
  async function authoriseSession(session){
    if(!session?.user?.id)return {allowed:false,message:'Please sign in.'};
    const {data,error}=await window.db.from('staff_profiles')
      .select('user_id,email,display_name,role,active,permission_role,permissions,must_change_password')
      .eq('user_id',session.user.id).maybeSingle();
    if(error)return {allowed:false,message:'Unable to verify your B5 access. Please try again.'};
    if(!data)return {allowed:false,message:'This account does not have a B5 staff profile. Contact a manager.'};
    if(data.active===false)return {allowed:false,message:'This B5 account is inactive. Contact a manager if you require access.'};
    return {allowed:true,profile:data};
  }
  window.B5AccessControl={authoriseSession};

  // Re-apply navigation/action visibility after every render, including later modules that add buttons.
  const oldApplyPermissionNavigation=applyPermissionNavigation;
  applyPermissionNavigation=function(){
    oldApplyPermissionNavigation();
    const rules=[
      ['[data-payment],[data-direct-payment]','payments'],
      ['[data-return]','rentals.return'],
      ['[data-extend],[data-swap]','rentals.edit'],
      ['[data-existing-promo]','promotions']
    ];
    rules.forEach(([selector,key])=>document.querySelectorAll(selector).forEach(el=>{el.hidden=!can(key);}));
    const ids=[['newCustomerBtn','customers.edit'],['newVehicleBtn','fleet.edit'],['newRentalBtn','rentals.create'],['quickRental','rentals.create'],['quickAvailability','availability']];
    ids.forEach(([id,key])=>{const el=document.getElementById(id);if(el)el.hidden=!can(key);});
  };

  const oldRender98=render;
  render=function(){
    if(state.userProfile?.active===false){return;}
    const allowed=firstAllowedPage();
    if(allowed&&!can(pagePermission(state.page)))state.page=allowed;
    oldRender98();
    applyPermissionNavigation();
  };

  // Protect the existing-rental promo action added in v0.8.95.
  if(typeof window.applyPromoToExistingRental95==='function'){
    const oldPromo98=window.applyPromoToExistingRental95;
    window.applyPromoToExistingRental95=function(uuid){
      if(!can('promotions'))return alert('You do not have permission to apply promo codes.');
      return oldPromo98(uuid);
    };
  }

  // Keep newly injected controls synchronised with permissions.
  const observer=new MutationObserver(()=>{if(state.userProfile)applyPermissionNavigation();});
  window.addEventListener('load',()=>observer.observe(document.body,{childList:true,subtree:true}));
})();
