/* B5 v0.8.98 — permission enforcement + access hardening */
(function(){
  loadUserProfile=async function(){
    if(!window.db)return null;
    const user=await currentAuthUser();if(!user)return null;
    const {data,error}=await window.db.from('staff_profiles').select('user_id,email,display_name,role,active,permission_role,permissions,notification_preferences,must_change_password').eq('user_id',user.id).maybeSingle();
    if(error){console.error('Could not load staff access profile',error);return {user_id:user.id,email:user.email,display_name:user.email,role:'staff',active:false,permission_role:'office',permissions:{}};}
    return data||{user_id:user.id,email:user.email,display_name:user.email,role:'staff',active:false,permission_role:'office',permissions:{}};
  };

  const rawCan=can;
  const parentPermission={'rentals.create':'rentals.view','rentals.edit':'rentals.view','rentals.return':'rentals.view','contracts.edit':'contracts.view','contracts.finalise':'contracts.view','fleet.edit':'fleet.view','customers.edit':'customers.view','users.manage':'manager'};
  can=function(key,p=state.userProfile){if(!p||p.active===false)return false;const parent=parentPermission[key];if(parent&&!rawCan(parent,p))return false;return rawCan(key,p);};
  function firstAllowedPage(p=state.userProfile){return ['dashboard','today','availability','rentals','calendar','fleet','customers','suppliers','locations','expenses','reports','settings','manager'].find(page=>can(pagePermission(page),p))||null;}

  setManagerVisibility=function(){const allowed=!!state.userProfile&&can('manager');const btn=document.getElementById('managerNav'),top=document.getElementById('managerTopBtn');if(btn)btn.hidden=!allowed;if(top)top.hidden=!allowed;if(state.page==='manager'&&!allowed)state.page=firstAllowedPage()||'dashboard';};

  async function authoriseSession(session){
    if(!session?.user?.id)return {allowed:false,message:'Please sign in.'};
    const {data,error}=await window.db.from('staff_profiles').select('user_id,email,display_name,role,active,permission_role,permissions,must_change_password').eq('user_id',session.user.id).maybeSingle();
    if(error)return {allowed:false,message:'Unable to verify your B5 access. Please try again.'};
    if(!data)return {allowed:false,message:'This account does not have a B5 staff profile. Contact a manager.'};
    if(data.active===false)return {allowed:false,message:'This B5 account is inactive. Contact a manager if you require access.'};
    return {allowed:true,profile:data};
  }
  window.B5AccessControl={authoriseSession};

  const oldApplyPermissionNavigation=applyPermissionNavigation;let applyingPermissions=false;
  applyPermissionNavigation=function(){
    if(applyingPermissions)return;applyingPermissions=true;
    try{
      oldApplyPermissionNavigation();
      const rules=[['[data-payment],[data-direct-payment]','payments'],['[data-return]','rentals.return'],['[data-extend],[data-swap]','rentals.edit'],['[data-existing-promo]','promotions']];
      rules.forEach(([selector,key])=>document.querySelectorAll(selector).forEach(el=>{const hide=!can(key);if(el.hidden!==hide)el.hidden=hide;}));
      [['newCustomerBtn','customers.edit'],['newVehicleBtn','fleet.edit'],['newRentalBtn','rentals.create'],['quickRental','rentals.create'],['quickAvailability','availability']].forEach(([id,key])=>{const el=document.getElementById(id);if(el){const hide=!can(key);if(el.hidden!==hide)el.hidden=hide;}});
    }finally{applyingPermissions=false;}
  };

  const oldRender98=render;
  render=function(){if(state.userProfile?.active===false)return;const allowed=firstAllowedPage();if(allowed&&!can(pagePermission(state.page)))state.page=allowed;oldRender98();applyPermissionNavigation();};

  // Function-level guards prevent a hidden button from being bypassed by invoking the UI action directly.
  function guardFunction(name,key,message){
    try{
      const fn=eval(name);if(typeof fn!=='function')return;
      const wrapped=function(...args){if(!can(key)){alert(message||'You do not have permission to perform this action.');return;}return fn.apply(this,args);};
      eval(`${name}=wrapped`);
    }catch(_){ }
  }
  guardFunction('bookingModal','rentals.create','You do not have permission to create rentals.');
  guardFunction('customerModal','customers.edit','You do not have permission to add or edit customers.');
  guardFunction('vehicleModal','fleet.edit','You do not have permission to add or edit vehicles.');
  guardFunction('recordPaymentModal','payments','You do not have permission to record payments.');
  guardFunction('extendRentalModal','rentals.edit','You do not have permission to edit or extend rentals.');
  guardFunction('swapVehicleModal','rentals.edit','You do not have permission to change rental vehicles.');
  guardFunction('returnRentalModal','rentals.return','You do not have permission to return vehicles.');
  guardFunction('vehicleMaintenanceModal','maintenance','You do not have permission to record maintenance.');
  guardFunction('vehicleExpenseModal','expenses','You do not have permission to record expenses.');
  guardFunction('openAddLocationModal','locations','You do not have permission to manage locations.');

  if(typeof window.applyPromoToExistingRental95==='function'){const oldPromo98=window.applyPromoToExistingRental95;window.applyPromoToExistingRental95=function(uuid){if(!can('promotions'))return alert('You do not have permission to apply promo codes.');return oldPromo98(uuid);};}

  let permissionRefreshQueued=false;
  const observer=new MutationObserver(()=>{if(!state.userProfile||permissionRefreshQueued||applyingPermissions)return;permissionRefreshQueued=true;requestAnimationFrame(()=>{permissionRefreshQueued=false;applyPermissionNavigation();});});
  window.addEventListener('load',()=>observer.observe(document.body,{childList:true,subtree:true}));
})();
