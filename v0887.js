/* B5 v0.8.97 — Manager user creation + first-login password change */
(function(){
  const previousRenderManagerDetail=renderManagerDetail;
  const previousBindPageEvents=bindPageEvents;

  function roleOptions(selected='office'){
    return Object.keys(B5_ROLE_DEFAULTS).map(r=>`<option value="${esc(r)}" ${r===selected?'selected':''}>${esc(roleLabel(r))}</option>`).join('');
  }

  function permissionGroupsHtml(role='office'){
    const defs=B5_ROLE_DEFAULTS[role]||B5_ROLE_DEFAULTS.office;
    const groups=[...new Set(B5_PERMISSION_DEFS.map(x=>x[1]))];
    return groups.map(g=>`<div class="permission-group"><h4>${esc(g)}</h4>${B5_PERMISSION_DEFS.filter(x=>x[1]===g).map(([k,,label])=>`<div class="permission-item"><span>${esc(label)}</span><label class="permission-switch"><input type="checkbox" data-new-user-permission="${esc(k)}" ${defs[k]?'checked':''}><i></i></label></div>`).join('')}</div>`).join('');
  }

  function generateTemporaryPassword(){
    const chars='ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
    const bytes=new Uint32Array(10);crypto.getRandomValues(bytes);
    return `B5!${[...bytes].map(n=>chars[n%chars.length]).join('')}7`;
  }

  function collectNewUserPermissions(){
    const permissions={};
    document.querySelectorAll('[data-new-user-permission]').forEach(x=>permissions[x.dataset.newUserPermission]=!!x.checked);
    return permissions;
  }

  async function reloadStaffProfiles(){
    const {data,error}=await window.db.from('staff_profiles').select('user_id,email,display_name,role,active,created_at,permission_role,permissions,notification_preferences,must_change_password').order('display_name',{ascending:true});
    if(!error) state.staffProfiles=data||[];
  }

  function openAddUser(){
    if(!can('users.manage')) return alert('You do not have permission to create users.');
    const temp=generateTemporaryPassword();
    openModal('Add New User',`<div class="new-user-form">
      <div class="grid two-col">
        <div class="field"><label>Display Name / Username</label><input id="newUserName" autocomplete="off" placeholder="e.g. John Smith"></div>
        <div class="field"><label>Email Address</label><input id="newUserEmail" type="email" autocomplete="off" placeholder="name@example.com"></div>
        <div class="field"><label>Temporary Password</label><div class="new-user-password-row"><input id="newUserPassword" type="text" autocomplete="new-password" value="${esc(temp)}"><button type="button" class="btn btn-secondary btn-small" id="generateTempPassword">Generate</button><button type="button" class="btn btn-secondary btn-small" id="copyTempPassword">Copy</button></div><small>Minimum 8 characters. The manager can replace the generated value.</small></div>
        <div class="field"><label>Base Role</label><select id="newUserRole">${roleOptions('office')}</select></div>
      </div>
      <label class="new-user-force-row"><span><strong>User must change password on first login</strong><small>Recommended for all manager-created accounts.</small></span><input id="newUserMustChange" type="checkbox" checked></label>
      <div class="permission-note">The base role provides the starting permissions. Adjust individual permissions below before creating the account.</div>
      <div class="permission-groups" id="newUserPermissionGroups">${permissionGroupsHtml('office')}</div>
    </div>`,async()=>{
      const display_name=document.getElementById('newUserName').value.trim();
      const email=document.getElementById('newUserEmail').value.trim();
      const password=document.getElementById('newUserPassword').value;
      const permission_role=document.getElementById('newUserRole').value;
      const must_change_password=document.getElementById('newUserMustChange').checked;
      if(!display_name){alert('Enter a display name / username.');return false;}
      if(!email){alert('Enter an email address.');return false;}
      if(password.length<8){alert('Temporary password must be at least 8 characters.');return false;}
      const {data:{session}}=await window.db.auth.getSession();
      if(!session) { alert('Please sign in again.'); return false; }
      const {data,error}=await window.db.functions.invoke('b5-manage-users',{
        body:{action:'create',display_name,email,password,permission_role,permissions:collectNewUserPermissions(),must_change_password},
        headers:{Authorization:`Bearer ${session.access_token}`}
      });
      if(error){console.error('User creation failed',error);alert(error.message||'Unable to create user.');return false;}
      if(data?.error){alert(data.error);return false;}
      await reloadStaffProfiles();
      render();
      setTimeout(()=>alert(`User created successfully.\n\nLogin: ${email}\nTemporary password: ${password}${must_change_password?'\n\nThey will be required to change this password on first login.':''}`),20);
      return true;
    },'Create User');

    const role=document.getElementById('newUserRole');
    const groups=document.getElementById('newUserPermissionGroups');
    role.onchange=()=>{groups.innerHTML=permissionGroupsHtml(role.value);};
    document.getElementById('generateTempPassword').onclick=()=>{document.getElementById('newUserPassword').value=generateTemporaryPassword();};
    document.getElementById('copyTempPassword').onclick=async()=>{
      const btn=document.getElementById('copyTempPassword');
      try{await navigator.clipboard.writeText(document.getElementById('newUserPassword').value);const old=btn.textContent;btn.textContent='Copied';setTimeout(()=>btn.textContent=old,1000);}catch(_){alert('Copy is not available on this device.');}
    };
  }

  renderManagerDetail=function(view,testRates,users,logs){
    let html=previousRenderManagerDetail(view,testRates,users,logs);
    if(view==='users'&&can('users.manage')){
      html=html.replace('<div class="manager-users-toolbar">','<div class="manager-add-user-row"><button type="button" class="btn btn-primary" id="managerAddUser">Add User</button><span>Create a staff login, choose a role and set first-login password requirements.</span></div><div class="manager-users-toolbar">');
    }
    return html;
  };

  bindPageEvents=function(){
    previousBindPageEvents();
    if(state.page==='manager'&&state.managerView==='users') document.getElementById('managerAddUser')?.addEventListener('click',openAddUser);
  };

  function ensurePasswordGate(){
    let gate=document.getElementById('b5PasswordGate');
    if(gate)return gate;
    gate=document.createElement('div');
    gate.id='b5PasswordGate';
    gate.className='b5-password-gate';
    gate.hidden=true;
    gate.innerHTML=`<div class="b5-password-card"><div class="b5-password-mark">B5</div><h2>Change Your Password</h2><p>Your account was created with a temporary password. Choose a new password before continuing.</p><div class="field"><label>New Password</label><input id="firstLoginPassword" type="password" autocomplete="new-password"></div><div class="field"><label>Confirm New Password</label><input id="firstLoginPasswordConfirm" type="password" autocomplete="new-password"></div><div id="firstLoginPasswordMessage" class="auth-message" aria-live="polite"></div><button type="button" class="btn btn-primary" id="firstLoginPasswordSave">Change Password & Continue</button><button type="button" class="btn btn-secondary" id="firstLoginSignOut">Sign Out</button></div>`;
    document.body.appendChild(gate);
    return gate;
  }

  let continueAfterPassword=null;
  async function enforcePasswordChange(session,continueFn){
    if(!session?.user?.id)return false;
    const {data,error}=await window.db.from('staff_profiles').select('must_change_password').eq('user_id',session.user.id).maybeSingle();
    if(error){console.warn('Could not check first-login password flag',error);return false;}
    if(!data?.must_change_password)return false;
    continueAfterPassword=continueFn;
    const gate=ensurePasswordGate();gate.hidden=false;
    const save=document.getElementById('firstLoginPasswordSave');
    const signOut=document.getElementById('firstLoginSignOut');
    const message=document.getElementById('firstLoginPasswordMessage');
    save.onclick=async()=>{
      const password=document.getElementById('firstLoginPassword').value;
      const confirm=document.getElementById('firstLoginPasswordConfirm').value;
      message.textContent='';
      if(password.length<8){message.textContent='Use at least 8 characters.';return;}
      if(password!==confirm){message.textContent='The passwords do not match.';return;}
      save.disabled=true;save.textContent='Changing Password…';
      try{
        const {error:updateError}=await window.db.auth.updateUser({password});
        if(updateError)throw updateError;
        const {error:flagError}=await window.db.rpc('b5_complete_first_login_password_change');
        if(flagError)throw flagError;
        try{await window.logAudit?.('first_login_password_changed','staff_profile',session.user.id,{});}catch(_){ }
        gate.hidden=true;
        document.getElementById('firstLoginPassword').value='';document.getElementById('firstLoginPasswordConfirm').value='';
        const next=continueAfterPassword;continueAfterPassword=null;
        if(next)await next();
      }catch(err){console.error(err);message.textContent=err?.message||'Unable to change password. Please try again.';}
      finally{save.disabled=false;save.textContent='Change Password & Continue';}
    };
    signOut.onclick=()=>window.db.auth.signOut();
    return true;
  }

  function closePasswordGate(){const gate=document.getElementById('b5PasswordGate');if(gate)gate.hidden=true;continueAfterPassword=null;}
  window.B5PasswordGate={enforce:enforcePasswordChange,close:closePasswordGate};

  if(!document.getElementById('v0887Styles')){
    const st=document.createElement('style');st.id='v0887Styles';st.textContent=`
      .manager-add-user-row{display:flex;align-items:center;gap:12px;justify-content:space-between;padding:12px 14px;margin-bottom:12px;border:1px solid var(--line);border-radius:12px;background:var(--panel,#fff)}.manager-add-user-row span{font-size:12px;color:var(--muted);text-align:right}.new-user-password-row{display:flex;gap:6px;align-items:center}.new-user-password-row input{min-width:0;flex:1}.new-user-force-row{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:12px 14px;margin:12px 0;border:1px solid var(--line);border-radius:12px;background:var(--panel,#fff)}.new-user-force-row span{display:flex;flex-direction:column;gap:3px}.new-user-force-row small{color:var(--muted)}.new-user-force-row input{width:20px;height:20px}.b5-password-gate{position:fixed;inset:0;z-index:100000;background:rgba(4,9,18,.92);display:flex;align-items:center;justify-content:center;padding:18px}.b5-password-gate[hidden]{display:none!important}.b5-password-card{width:min(430px,100%);padding:24px;border-radius:18px;background:var(--panel,#fff);color:var(--ink,#111);box-shadow:0 24px 70px rgba(0,0,0,.4)}.b5-password-card h2{margin:8px 0}.b5-password-card p{color:var(--muted);line-height:1.5}.b5-password-card .btn{width:100%;margin-top:8px}.b5-password-mark{display:inline-flex;width:42px;height:42px;border-radius:12px;align-items:center;justify-content:center;font-weight:900;background:#0b1220;color:#fff}@media(max-width:700px){.manager-add-user-row{align-items:stretch;flex-direction:column}.manager-add-user-row span{text-align:left}.new-user-password-row{flex-wrap:wrap}.new-user-password-row input{flex-basis:100%}}
    `;document.head.appendChild(st);
  }
})();
