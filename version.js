window.B5_VERSION = {
  version: "0.9.0",
  build: "Demo Build",
  released: "2026-08-24",
  title: "Secure Password Recovery",
  notes: [
    "Added Forgot Password to the staff sign-in screen with secure Supabase email recovery links.",
    "Password recovery now opens a dedicated B5 reset screen where staff choose and confirm their own new password; managers do not need to know or recreate forgotten passwords.",
    "Added Keep me logged in so staff can explicitly choose persistent access on trusted devices; unchecked sign-ins are treated as temporary browser-session access.",
    "Kept the existing manager-created temporary-password and mandatory first-login password-change workflow for new staff accounts."
  ]
};