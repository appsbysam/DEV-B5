(() => {
  const authScreen = document.getElementById("authScreen");
  const loginForm = document.getElementById("loginForm");
  const loginEmail = document.getElementById("loginEmail");
  const loginPassword = document.getElementById("loginPassword");
  const loginBtn = document.getElementById("loginBtn");
  const loginMessage = document.getElementById("loginMessage");
  const logoutBtn = document.getElementById("logoutBtn");
  const signedInUser = document.getElementById("signedInUser");

  let activeUserId = null;
  let loadingApp = false;

  function showLogin(message=""){
    document.body.classList.add("auth-locked");
    authScreen.classList.remove("hidden");
    signedInUser.textContent = "";
    loginMessage.textContent = message;
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
    loginPassword.value = "";
    loginMessage.textContent = "";

    if(loadingApp) return;
    loadingApp = true;
    try {
      // Always reload after a restored initial session, fresh sign-in,
      // or token refresh so RLS requests use the current access token.
      if(forceReload || userChanged) {
        await window.startB5App?.();
      }
    } finally {
      loadingApp = false;
    }
  }

  async function initialise(){
    document.body.classList.add("auth-locked");

    if(!window.db){
      showLogin("Supabase connection is unavailable.");
      return;
    }

    // Register the auth listener first so INITIAL_SESSION / token refresh
    // cannot race ahead of the application data request.
    window.db.auth.onAuthStateChange((event, session) => {
      // Defer async work out of the auth callback itself.
      setTimeout(async () => {
        if(event === "SIGNED_OUT" || !session){
          activeUserId = null;
          window.resetB5App?.();
          showLogin();
          return;
        }

        if(
          event === "INITIAL_SESSION" ||
          event === "SIGNED_IN" ||
          event === "TOKEN_REFRESHED"
        ){
          await showApp(session, true);
        }
      }, 0);
    });

    // Explicitly recover the persisted browser session as a fallback.
    const { data, error } = await window.db.auth.getSession();
    if(error){
      showLogin(error.message);
      return;
    }

    if(data?.session){
      await showApp(data.session, true);
    } else {
      showLogin();
    }
  }

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    loginMessage.textContent = "";
    loginBtn.disabled = true;
    loginBtn.textContent = "Signing In…";

    try {
      const { data, error } = await window.db.auth.signInWithPassword({
        email: loginEmail.value.trim(),
        password: loginPassword.value
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
