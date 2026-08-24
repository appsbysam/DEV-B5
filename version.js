window.B5_VERSION = {
  version: "0.8.97",
  build: "Demo Build",
  released: "2026-08-24",
  title: "Manager User Creation",
  notes: [
    "Managers can now create new staff accounts directly from Manager Mode > Users, including display name, email, base role and individual permissions.",
    "Added secure temporary-password generation and copy controls, with an option to require the user to change the temporary password on first login.",
    "First-login password changes are enforced before the new user can access the operational app, and account creation is handled by a protected Supabase Edge Function."
  ]
};