(() => {
  const authScreen = document.getElementById("authScreen");
  const loginForm = document.getElementById("loginForm");
  const loginEmail = document.getElementById("loginEmail");
  let loginPassword = document.getElementById("loginPassword");
  const loginBtn = document.getElementById("loginBtn");
  const loginMessage = document.getElementById("loginMessage");
  const logoutBtn = document.getElementById("logoutBtn");
  const signedInUser = document.getElementById("signedInUser");
  const keepLoggedIn = document.getElementById("keepLoggedIn");
  const forgotPasswordBtn = document.getElementById("forgotPasswordBtn");
  const recoveryPanel = document.getElementById("recoveryPanel");
  const recoveryEmail = document.getElementById("recoveryEmail");
  const recoverySendBtn = document.getElementById("recoverySendBtn");
  const recoveryCancelBtn = document.getElementById("recoveryCancelBtn");
  const recoveryMessage = document.getElementById("recoveryMessage");
  const resetPanel = document.getElementById("resetPasswordPanel");
  const resetPassword = document.getElementById("resetPassword");
  const resetPasswordConfirm = document.getElementById("resetPasswordConfirm");
  const resetPasswordBtn = document.getElementById("resetPasswordBtn");
  const resetPasswordMessage = document.getElementById("resetPasswordMessage");

  if(!loginPassword && loginForm && loginBtn){
    const wrap=document.createElement("div");
    wrap.className="field";
    wrap.innerHTML='<label>Password</label><input id="loginPassword" type="password" autocomplete="current-password" required />';
    loginForm.insertBefore(wrap,loginBtn);
    loginPassword=wrap.querySelector("#loginPassword");
  }

  let activeUserId = null;
  let loadingApp = false;
  let recoveryMode = false;
  const KEEP_KEY='b5_keep_logged_in';
  const TEMP_SESSION_KEY='b5_temporary_session';

  async function loadCurrentReleaseModule(){
    if(window.B5PasswordGate&&window.B5AccessControl)return;
    await new Promise((resolve,reject)=>{
      const existing=document.querySelector('script[data-b5-release="0.8.98"]');
      if(existing){ if(existing.dataset.loaded==='true')return resolve(); existing.addEventListener('load',resolve,{once:true});existing.addEventListener('error',reject,{once:true});return; }
      const s=document.createElement('script');s.src='v0888.js?v=0.9.0';s.dataset.b5Release='0.8.98';s.onload=()=>{s.dataset.loaded='true';resolve();};s.onerror=reject;document.head.appendChild(s);
    });
  }

  function showLogin(message=""){
    if(recoveryMode)return;
    window.B5PasswordGate?.close?.();
    document.body.classList.add("auth-locked");
    authScreen.classList.remove("hidden");
    loginForm?.classList.remove('hidden');
    recoveryPanel?.classList.add('hidden');
    resetPanel?.classList.add('hidden');
    signedInUser.textContent = "";
    loginMessage.textContent = message;
  }

  function showRecoveryRequest(){
    loginForm?.classList.add('hidden');
    recoveryPanel?.classList.remove('hidden');
    resetPanel?.classList.add('hidden');
    recoveryEmail.value=loginEmail.value.trim();
    recoveryMessage.textContent='';
    setTimeout(()=>recoveryEmail.focus(),0);
  }

  function showPasswordReset(){
    recoveryMode=true;
    document.body.classList.add("auth-locked");
    authScreen.classList.remove("hidden");
    loginForm?.classList.add('hidden');
    recoveryPanel?.classList.add('hidden');
    resetPanel?.classList.remove('hidden');
    resetPasswordMessage.textContent='';
    resetPassword.value='';resetPasswordConfirm.value='';
    setTimeout(()=>resetPassword.focus(),0);
  }

  async function completeShowApp(session, forceReload=false, userChanged=false){
    document.body.classList.remove("auth-locked");
    authScreen.classList.add("hidden");
    signedInUser.textContent = session.user.email || "Signed in";
    if(loginPassword) loginPassword.value = "";
    loginMessage.textContent = "";
    if(loadingApp) return;
    loadingApp = true;
    try { if(forceReload || userChanged) await window.startB5App?.(); }
    finally { loadingApp = false; }
  }

  async function showApp(session, forceReload=false){
    if(recoveryMode)return;
    if(!session?.access_token || !session?.user){showLogin();return;}
    const userChanged = activeUserId !== session.user.id;
    activeUserId = session.user.id;

    const access=await window.B5AccessControl?.authoriseSession?.(session);
    if(access && access.allowed===false){
      await window.db.auth.signOut();
      showLogin(access.message||"This account does not have access to B5.");
      return;
    }

    document.body.classList.remove("auth-locked");
    authScreen.classList.add("hidden");
    signedInUser.textContent = session.user.email || "Signed in";
    if(loginPassword) loginPassword.value = "";
    loginMessage.textContent = "";

    if(window.B5PasswordGate?.enforce){
      const blocked=await window.B5PasswordGate.enforce(session,()=>completeShowApp(session,true,userChanged));
      if(blocked)return;
    }
    await completeShowApp(session,forceReload,userChanged);
  }

  async function initialise(){
    document.body.classList.add("auth-locked");
    if(!window.db){showLogin("Supabase connection is unavailable.");return;}
    try{await loadCurrentReleaseModule();}catch(err){console.error('Unable to load access module',err);showLogin('Unable to load the current application release. Please refresh.');return;}

    window.db.auth.onAuthStateChange((event, session) => {
      setTimeout(async () => {
        if(event === 'PASSWORD_RECOVERY'){showPasswordReset();return;}
        if(event === "SIGNED_OUT" || !session){activeUserId = null;window.resetB5App?.();if(!recoveryMode)showLogin();return;}
        if(recoveryMode)return;
        if(event === "INITIAL_SESSION" || event === "SIGNED_IN" || event === "TOKEN_REFRESHED") await showApp(session, true);
      }, 0);
    });

    const { data, error } = await window.db.auth.getSession();
    if(error){showLogin(error.message);return;}
    if(data?.session){
      const keep=localStorage.getItem(KEEP_KEY)==='true';
      const temporary=sessionStorage.getItem(TEMP_SESSION_KEY)==='true';
      if(!keep&&!temporary){await window.db.auth.signOut();showLogin();return;}
      await showApp(data.session, true);
    } else showLogin();
  }

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();loginMessage.textContent = "";loginBtn.disabled = true;loginBtn.textContent = "Signing In…";
    try {
      const keep=!!keepLoggedIn?.checked;
      localStorage.setItem(KEEP_KEY,keep?'true':'false');
      if(keep)sessionStorage.removeItem(TEMP_SESSION_KEY);else sessionStorage.setItem(TEMP_SESSION_KEY,'true');
      const { data, error } = await window.db.auth.signInWithPassword({email: loginEmail.value.trim(),password: loginPassword?.value || ""});
      if(error){loginMessage.textContent = error.message;return;}
      if(data?.session){await window.logAudit?.("login","auth",data.session.user.id,{method:"email_password",keep_logged_in:keep});await showApp(data.session, true);}
    } finally {loginBtn.disabled = false;loginBtn.textContent = "Sign In";}
  });

  forgotPasswordBtn?.addEventListener('click',showRecoveryRequest);
  recoveryCancelBtn?.addEventListener('click',()=>{recoveryPanel.classList.add('hidden');loginForm.classList.remove('hidden');loginMessage.textContent='';});
  recoverySendBtn?.addEventListener('click',async()=>{
    const email=recoveryEmail.value.trim();
    recoveryMessage.textContent='';
    if(!email){recoveryMessage.textContent='Enter your email address.';return;}
    recoverySendBtn.disabled=true;recoverySendBtn.textContent='Sending…';
    try{
      const redirectTo=`${location.origin}${location.pathname}`;
      const {error}=await window.db.auth.resetPasswordForEmail(email,{redirectTo});
      if(error)throw error;
      recoveryMessage.textContent='If that email belongs to a B5 account, a secure password reset link has been sent. Check your inbox and junk folder.';
      recoveryMessage.classList.add('success-text');
    }catch(err){recoveryMessage.textContent=err?.message||'Unable to send the reset email. Please try again.';recoveryMessage.classList.remove('success-text');}
    finally{recoverySendBtn.disabled=false;recoverySendBtn.textContent='Send Reset Link';}
  });

  resetPasswordBtn?.addEventListener('click',async()=>{
    const password=resetPassword.value,confirm=resetPasswordConfirm.value;
    resetPasswordMessage.textContent='';
    if(password.length<8){resetPasswordMessage.textContent='Use at least 8 characters.';return;}
    if(password!==confirm){resetPasswordMessage.textContent='The passwords do not match.';return;}
    resetPasswordBtn.disabled=true;resetPasswordBtn.textContent='Updating…';
    try{
      const {data,error}=await window.db.auth.updateUser({password});
      if(error)throw error;
      try{await window.logAudit?.('password_recovery_completed','auth',data?.user?.id||null,{method:'email_recovery'});}catch(_){ }
      recoveryMode=false;
      await window.db.auth.signOut();
      history.replaceState({},document.title,location.pathname+location.search);
      showLogin('Password updated successfully. Sign in with your new password.');
    }catch(err){resetPasswordMessage.textContent=err?.message||'Unable to update the password. Please request a new reset link.';}
    finally{resetPasswordBtn.disabled=false;resetPasswordBtn.textContent='Save New Password';}
  });

  logoutBtn.addEventListener("click", async () => {
    logoutBtn.disabled = true;
    try {await window.logAudit?.("logout","auth",activeUserId,{});localStorage.setItem(KEEP_KEY,'false');sessionStorage.removeItem(TEMP_SESSION_KEY);await window.db.auth.signOut();}
    finally {logoutBtn.disabled = false;}
  });

  initialise();
})();
