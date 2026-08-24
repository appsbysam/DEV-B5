/* B5 v0.8.99 — Manager user profile footer layout */
(function(){
  if(typeof window.openManagerUserProfile!=='function')return;
  const previousOpenManagerUserProfile=window.openManagerUserProfile;

  function clearManagerProfileMode(){
    document.getElementById('profileModal')?.classList.remove('manager-user-open');
  }

  window.openManagerUserProfile=function(email){
    previousOpenManagerUserProfile(email);
    const modal=document.getElementById('profileModal');
    const profile=document.querySelector('.manager-user-profile');
    const actions=profile?.querySelector('.permission-actions');
    if(!modal||!profile||!actions)return;

    modal.classList.add('manager-user-open');
    actions.classList.add('manager-user-footer');

    let cancel=actions.querySelector('#cancelManagerUser');
    if(!cancel){
      cancel=document.createElement('button');
      cancel.type='button';
      cancel.id='cancelManagerUser';
      cancel.className='btn btn-secondary';
      cancel.textContent='Cancel';
      actions.insertBefore(cancel,actions.firstChild);
    }
    cancel.onclick=()=>{modal.close();clearManagerProfileMode();};

    const reset=actions.querySelector('#resetRolePermissions');
    if(reset)reset.textContent='Reset to Role Defaults';
    const save=actions.querySelector('#saveManagerUser');
    if(save)save.textContent='Save User';
  };

  document.getElementById('profileClose')?.addEventListener('click',clearManagerProfileMode);
  document.getElementById('profileDone')?.addEventListener('click',clearManagerProfileMode);
  document.getElementById('profileModal')?.addEventListener('close',clearManagerProfileMode);
})();
