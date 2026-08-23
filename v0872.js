/* B5 v0.8.78 — Manager Mode Users section */
(function(){
  let usersLoaded=false;
  const oldRenderManagerDetail=renderManagerDetail;
  const oldBindPageEvents=bindPageEvents;

  async function loadManagerUsers(){
    if(!window.db||!isManager()) return;
    const {data,error}=await window.db.from('staff_profiles').select('user_id,email,display_name,role,active,created_at,permission_role,permissions,notification_preferences').order('display_name',{ascending:true});
    if(error){console.warn('Could not load manager user profiles',error);return;}
    state.staffProfiles=data||[];
    usersLoaded=true;
  }

  function userRole(p){return typeof permissionRole==='function'?permissionRole(p):((p.role||'staff').toLowerCase()==='manager'?'manager':'office');}
  function roleName(p){const r=userRole(p);return typeof roleLabel==='function'?roleLabel(r):r;}
  function userCount(active){return (state.staffProfiles||[]).filter(x=>active===undefined||x.active===active).length;}
  function initials(p){const n=(p.display_name||p.email||'U').trim().split(/\s+/).slice(0,2).map(x=>x[0]||'').join('').toUpperCase();return esc(n||'U');}

  function usersSection(users){
    const active=userCount(true),inactive=userCount(false);
    return `<div class="manager-users-shell">
      <div class="manager-users-head">
        <div><h3>Users</h3><p>Manage staff access, roles and individual permissions.</p></div>
        <div class="manager-user-counts"><span><strong>${active}</strong> Active</span><span><strong>${inactive}</strong> Inactive</span></div>
      </div>
      <div class="manager-users-toolbar">
        <div class="manager-user-search"><input id="managerUsersSearch" type="search" placeholder="Search name or email" autocomplete="off"></div>
        <select id="managerUsersRole"><option value="">All roles</option>${Object.keys(B5_ROLE_DEFAULTS).map(r=>`<option value="${esc(r)}">${esc(roleLabel(r))}</option>`).join('')}</select>
        <select id="managerUsersStatus"><option value="">All users</option><option value="active">Active</option><option value="inactive">Inactive</option></select>
      </div>
      <div id="managerUsersList" class="manager-users-list">${userCards(users)}</div>
      <div class="manager-users-note">User accounts are kept rather than deleted so historical activity and audit records remain intact.</div>
    </div>`;
  }

  function userCards(users){
    if(!users.length)return '<div class="empty">No users found.</div>';
    return users.map(p=>`<button type="button" class="manager-user-card" data-user-profile="${esc(p.email||'')}">
      <span class="manager-user-avatar">${initials(p)}</span>
      <span class="manager-user-main"><strong>${esc(p.display_name||p.email||'User')}</strong><small>${esc(p.email||'')}</small></span>
      <span class="manager-user-role">${esc(roleName(p))}</span>
      <span class="badge ${p.active!==false?'badge-available':'badge-oos'}">${p.active!==false?'Active':'Inactive'}</span>
      <span class="manager-user-chevron">›</span>
    </button>`).join('');
  }

  function filteredUsers(){
    const q=(document.getElementById('managerUsersSearch')?.value||'').trim().toLowerCase();
    const role=document.getElementById('managerUsersRole')?.value||'';
    const status=document.getElementById('managerUsersStatus')?.value||'';
    return (state.staffProfiles||[]).filter(p=>{
      const hay=`${p.display_name||''} ${p.email||''}`.toLowerCase();
      return (!q||hay.includes(q))&&(!role||userRole(p)===role)&&(!status||(status==='active'?p.active!==false:p.active===false));
    });
  }
  function refreshUserCards(){const box=document.getElementById('managerUsersList');if(box){box.innerHTML=userCards(filteredUsers());bindUserCards(box);}}
  function bindUserCards(root=document){root.querySelectorAll('[data-user-profile]').forEach(b=>b.onclick=()=>openManagerUserProfile(b.dataset.userProfile));}

  window.openManagerUserProfile=function(email){
    if(!can('users.manage'))return alert('You do not have permission to manage users.');
    const p=(state.staffProfiles||[]).find(x=>(x.email||'')===email);if(!p)return;
    state.permissionEditorUser=email;
    const role=userRole(p),map=permissionMap(p),groups=[...new Set(B5_PERMISSION_DEFS.map(x=>x[1]))];
    document.getElementById('profileBody').innerHTML=`<div class="manager-user-profile">
      <div class="manager-user-profile-head"><span class="manager-user-avatar large">${initials(p)}</span><div><h3>${esc(p.display_name||p.email||'User')}</h3><div class="vehicle-meta">${esc(p.email||'')}</div></div><span class="badge ${p.active!==false?'badge-available':'badge-oos'}">${p.active!==false?'Active':'Inactive'}</span></div>
      <div class="manager-user-summary">
        <div class="field"><label>Base Role</label><select id="permissionRole">${Object.keys(B5_ROLE_DEFAULTS).map(r=>`<option value="${r}" ${r===role?'selected':''}>${esc(roleLabel(r))}</option>`).join('')}</select></div>
        <div class="manager-account-status"><span><strong>Account Status</strong><small>Inactive users should not be given operational access.</small></span><label class="permission-switch"><input id="managerUserActive" type="checkbox" ${p.active!==false?'checked':''}><i></i></label></div>
      </div>
      <div class="permission-note">Start with a role, then customise this user's access below.</div>
      <div class="permission-groups">${groups.map(g=>`<div class="permission-group"><h4>${esc(g)}</h4>${B5_PERMISSION_DEFS.filter(x=>x[1]===g).map(([k,,label])=>`<div class="permission-item"><span>${esc(label)}</span><label class="permission-switch"><input type="checkbox" data-permission="${esc(k)}" ${map[k]?'checked':''}><i></i></label></div>`).join('')}</div>`).join('')}</div>
      <div class="manager-user-extra"><div><strong>Notifications</strong><span>Personal notification choices remain controlled from the user's own profile.</span></div><div><strong>Audit history</strong><span>Changes to this user's access are recorded in Manager Mode.</span></div></div>
      <div class="permission-actions"><button type="button" class="btn btn-secondary" id="resetRolePermissions">Reset to Role Defaults</button><button type="button" class="btn btn-primary" id="saveManagerUser">Save User</button></div>
    </div>`;
    const title=document.querySelector('#profileModal .modal-head h3'),sub=document.querySelector('#profileModal .vehicle-meta');
    if(title)title.textContent='User Profile';if(sub)sub.textContent='Account, role and permissions';
    document.getElementById('profileModal').showModal();
    const roleEl=document.getElementById('permissionRole');
    const applyDefaults=()=>{const defs=B5_ROLE_DEFAULTS[roleEl.value]||{};document.querySelectorAll('[data-permission]').forEach(x=>x.checked=!!defs[x.dataset.permission]);};
    roleEl.onchange=applyDefaults;document.getElementById('resetRolePermissions').onclick=applyDefaults;document.getElementById('saveManagerUser').onclick=saveManagerUser;
  };

  async function saveManagerUser(){
    const p=(state.staffProfiles||[]).find(x=>(x.email||'')===state.permissionEditorUser);if(!p)return;
    const btn=document.getElementById('saveManagerUser');if(btn){btn.disabled=true;btn.textContent='Saving…';}
    try{
      const permission_role=document.getElementById('permissionRole').value,active=!!document.getElementById('managerUserActive').checked,permissions={};
      document.querySelectorAll('[data-permission]').forEach(x=>permissions[x.dataset.permission]=x.checked);
      const self=(p.email||'')===(state.userProfile?.email||'');
      if(self&&(!active||!permissions['users.manage'])){if(!confirm('This change may remove your own manager access. Continue?'))return;}
      const {data,error}=await window.db.from('staff_profiles').update({permission_role,permissions,active}).eq('user_id',p.user_id).select().single();
      if(error)throw error;Object.assign(p,data);
      await logAudit('user_access_updated','staff_profile',p.user_id,{user:p.email,permission_role,active,permissions});
      document.getElementById('profileModal').close();render();
    }catch(e){console.error(e);alert(e.message||'Unable to save this user.');}
    finally{if(btn){btn.disabled=false;btn.textContent='Save User';}}
  }

  renderManagerDetail=function(view,testRates,users,logs){if(view==='users')return usersSection(users);return oldRenderManagerDetail(view,testRates,users,logs);};

  bindPageEvents=function(){
    oldBindPageEvents();
    if(state.page==='manager'&&state.managerView==='users'){
      ['managerUsersSearch','managerUsersRole','managerUsersStatus'].forEach(id=>{const el=document.getElementById(id);if(el){el.oninput=refreshUserCards;el.onchange=refreshUserCards;}});bindUserCards();
      if(!usersLoaded)loadManagerUsers().then(()=>{if(state.page==='manager'&&state.managerView==='users')render();});
    }
  };
})();