window.B5_VERSION = {
  version: "0.9.1",
  build: "Demo Build",
  released: "2026-08-24",
  title: "Login Resilience & Sign Out",
  notes: [
    "Fixed the vehicle category read permission that could cause a permission-denied message and empty navigation immediately after sign-in.",
    "Added a guarded one-time retry for transient authentication or network failures during the initial mobile/PWA data load.",
    "Added Sign Out at the bottom of the side menu and inside My Profile, while retaining the existing desktop sign-out control.",
    "Improved Locations & Fees mobile labels with a colon and spacing after Location, Pickup, Drop-off and Buffer."
  ]
};