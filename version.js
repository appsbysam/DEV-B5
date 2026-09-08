window.B5_VERSION = {
  version: "0.9.18",
  build: "Demo Build",
  released: "2026-09-08",
  title: "First Login Authentication Fix",
  notes: [
    "Hardened the first-login password-change flow so it verifies and restores the authenticated Supabase session before changing a temporary password.",
    "Added protection against duplicate sign-in/auth-state handling while the same user is entering the app.",
    "New and recovered passwords must be at least 8 characters and contain an uppercase letter, lowercase letter, number and symbol.",
    "Updated first-login guidance so staff can see the password requirements before submitting."
  ]
};