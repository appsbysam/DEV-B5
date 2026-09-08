/* B5 v0.9.18 — first-login session hardening + password policy */
(function(){
  const PASSWORD_MESSAGE='Use at least 8 characters with at least one uppercase letter, one lowercase letter, one number and one symbol.';
  const validPassword=p=>typeof p==='string'&&p.length>=8&&/[A-Z]/.test(p)&&/[a-z]/.test(p)&&/[0-9]/.test(p)&&/[^A-Za-z0-9]/.test(p);

  function ensurePasswordGate(){
    let gate=document.getElementById('b5PasswordGate');
    if(!gate){
      gate=document.createElement('div');gate.id='b5PasswordGate';gate.className='b5-password-gate';gate.hidden=true;
      gate.innerHTML=`<div class="b5-password-card"><div class="b5-password-mark">B5</div><h2>Change Your Password</h2><p>Your account was created with a temporary password. Choose a new password before continuing.</p><div class="field"><label>New Password</label><input id="firstLoginPassword" type="password" autocomplete="new-password"><small>${PASSWORD_MESSAGE}</small></div><div class="field"><label>Confirm New Password</label><input id="firstLoginPasswordConfirm" type="password" autocomplete="new-password"></div><div id="firstLoginPasswordMessage" class="auth-message" aria-live="polite"></div><button type="button" class="btn btn-primary" id="firstLoginPasswordSave">Change Password & Continue</button><button type="button" class="btn btn-secondary" id="firstLoginSignOut">Sign Out</button></div>`;
      document.body.appendChild(gate);
    } else {
      const input=document.getElementById('firstLoginPassword');
      if(input&&!input.parentElement.querySelector('[data-b5-password-policy]')){const hint=document.createElement('small');hint.dataset.b5PasswordPolicy='true';hint.textContent=PASSWORD_MESSAGE;input.insertAdjacentElement('afterend',hint);}
    }
    return gate;
  }

  async function restoreSession(expectedSession){
    let {data,error}=await window.db.auth.getSession();
    if(!error&&data?.session?.user?.id===expectedSession?.user?.id)return data.session;
    if(expectedSession?.access_token&&expectedSession?.refresh_token){
      const restored=await window.db.auth.setSession({access_token:expectedSession.access_token,refresh_token:expectedSession.refresh_token});
      if(!restored.error&&restored.data?.session)return restored.data.session;
    }
    const refreshed=await window.db.auth.refreshSession();
    if(!refreshed.error&&refreshed.data?.session?.user?.id===expectedSession?.user?.id)return refreshed.data.session;
    return null;
  }

  let continueAfterPassword=null;
  async function enforcePasswordChange(session,continueFn){
    if(!session?.user?.id)return false;
    const liveSession=await restoreSession(session);
    if(!liveSession)return false;
    const {data,error}=await window.db.from('staff_profiles').select('must_change_password').eq('user_id',liveSession.user.id).maybeSingle();
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
      if(!validPassword(password)){message.textContent=PASSWORD_MESSAGE;return;}
      if(password!==confirm){message.textContent='The passwords do not match.';return;}
      save.disabled=true;save.textContent='Changing Password…';
      try{
        const current=await restoreSession(liveSession);
        if(!current)throw new Error('Your sign-in session expired. Please sign in again with your temporary password.');
        const {error:updateError}=await window.db.auth.updateUser({password});
        if(updateError)throw updateError;
        const {error:flagError}=await window.db.rpc('b5_complete_first_login_password_change');
        if(flagError)throw flagError;
        try{await window.logAudit?.('first_login_password_changed','staff_profile',current.user.id,{});}catch(_){ }
        gate.hidden=true;
        document.getElementById('firstLoginPassword').value='';document.getElementById('firstLoginPasswordConfirm').value='';
        const next=continueAfterPassword;continueAfterPassword=null;
        if(next)await next();
      }catch(err){console.error(err);message.textContent=err?.message||'Unable to change password. Please sign in again and retry.';}
      finally{save.disabled=false;save.textContent='Change Password & Continue';}
    };
    signOut.onclick=()=>window.db.auth.signOut();
    return true;
  }

  function closePasswordGate(){const gate=document.getElementById('b5PasswordGate');if(gate)gate.hidden=true;continueAfterPassword=null;}
  window.B5PasswordGate={enforce:enforcePasswordChange,close:closePasswordGate};
  window.B5PasswordPolicy={validate:validPassword,message:PASSWORD_MESSAGE};
})();
