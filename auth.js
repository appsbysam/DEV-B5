(() => {
  const authScreen = document.getElementById("authScreen");
  const loginForm = document.getElementById("loginForm");
  const loginEmail = document.getElementById("loginEmail");
  const loginPassword = document.getElementById("loginPassword");
  const loginBtn = document.getElementById("loginBtn");
  const loginMessage = document.getElementById("loginMessage");
  const logoutBtn = document.getElementById("logoutBtn");
  const signedInUser = document.getElementById("signedInUser");

  function showLogin(message=""){
    document.body.classList.add("auth-locked");
    authScreen.classList.remove("hidden");
    signedInUser.textContent = "";
    loginMessage.textContent = message;
  }

  async function showApp(session){
    document.body.classList.remove("auth-locked");
    authScreen.classList.add("hidden");
    signedInUser.textContent = session?.user?.email || "Signed in";
    loginPassword.value = "";
    loginMessage.textContent = "";
    await window.startB5App?.();
  }

  async function initialise(){
    if(!window.db){
      showLogin("Supabase connection is unavailable.");
      return;
    }

    const { data, error } = await window.db.auth.getSession();
    if(error){
      showLogin(error.message);
      return;
    }

    if(data.session) await showApp(data.session);
    else showLogin();

    window.db.auth.onAuthStateChange(async (event, session) => {
      if(event === "SIGNED_OUT" || !session){
        window.resetB5App?.();
        showLogin();
      } else if(event === "SIGNED_IN"){
        await showApp(session);
      }
    });
  }

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    loginMessage.textContent = "";
    loginBtn.disabled = true;
    loginBtn.textContent = "Signing In…";

    const { data, error } = await window.db.auth.signInWithPassword({
      email: loginEmail.value.trim(),
      password: loginPassword.value
    });

    loginBtn.disabled = false;
    loginBtn.textContent = "Sign In";

    if(error){
      loginMessage.textContent = error.message;
      return;
    }
    if(data.session) await showApp(data.session);
  });

  logoutBtn.addEventListener("click", async () => {
    logoutBtn.disabled = true;
    await window.db.auth.signOut();
    logoutBtn.disabled = false;
  });

  initialise();
})();
