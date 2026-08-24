(() => {
  const authScreen = document.getElementById("authScreen");
  const loginForm = document.getElementById("loginForm");
  const loginEmail = document.getElementById("loginEmail");
  let loginPassword = document.getElementById("loginPassword");
  const loginBtn = document.getElementById("loginBtn");
  const loginMessage = document.getElementById("loginMessage");
  const logoutBtn = document.getElementById("logoutBtn");
  const signedInUser = document.getElementById("signedInUser");

  if(!loginPassword && loginForm && loginBtn){
    const wrap=document.createElement("div");
    wrap.className="field";
    wrap.innerHTML='<label>Password</label><input id="loginPassword" type="password" autocomplete="current-password" required />';
    loginForm.insertBefore(wrap,loginBtn);
    loginPassword=wrap.querySelector("#loginPassword");
  }

  let activeUserId = null;
  let loadingApp = false;

  function showLogin(message=""){
    window.B5PasswordGate?.close?.();
    document.body.classList.add("auth-locked");
    authScreen.classList.remove("hidden");
    signedInUser.textContent = "";
    loginMessage.textContent = message;
  }

  async function completeShowApp(session, forceReload=false, userChanged=false){
    document.body.classList.remove("auth-locked");
    authScreen.classList.add("hidden");
    signedInUser.textContent = session.user.email || "Signed in";
    if(loginPassword) loginPassword.value = "";
    loginMessage.textContent = "";

    if(loadingApp) return;
    loadingApp = true;
    try {
      if(forceReload || userChanged) await window.startB5App?.();
    } finally {
      loadingApp = false;
    }
  }

  async function showApp(session, forceReload=false){
    if(!session?.access_token || !session?.user){
      showLogin();
      return;
    }

    const userChanged = activeUserId !== session.user.id;
    activeUserId = session.user.id;
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

    if(!window.db){
      showLogin("Supabase connection is unavailable.");
      return;
    }

    window.db.auth.onAuthStateChange((event, session) => {
      setTimeout(async () => {
        if(event === "SIGNED_OUT" || !session){
          activeUserId = null;
          window.resetB5App?.();
          showLogin();
          return;
        }

        if(event === "INITIAL_SESSION" || event === "SIGNED_IN" || event === "TOKEN_REFRESHED"){
          await showApp(session, true);
        }
      }, 0);
    });

    const { data, error } = await window.db.auth.getSession();
    if(error){
      showLogin(error.message);
      return;
    }

    if(data?.session) await showApp(data.session, true);
    else showLogin();
  }

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    loginMessage.textContent = "";
    loginBtn.disabled = true;
    loginBtn.textContent = "Signing In…";

    try {
      const { data, error } = await window.db.auth.signInWithPassword({
        email: loginEmail.value.trim(),
        password: loginPassword?.value || ""
      });

      if(error){
        loginMessage.textContent = error.message;
        return;
      }

      if(data?.session){
        await window.logAudit?.("login","auth",data.session.user.id,{method:"email_password"});
        await showApp(data.session, true);
      }
    } finally {
      loginBtn.disabled = false;
      loginBtn.textContent = "Sign In";
    }
  });

  logoutBtn.addEventListener("click", async () => {
    logoutBtn.disabled = true;
    try {
      await window.logAudit?.("logout","auth",activeUserId,{});
      await window.db.auth.signOut();
    } finally {
      logoutBtn.disabled = false;
    }
  });

  initialise();
})();
