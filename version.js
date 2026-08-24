window.B5_VERSION = {
  version: "0.8.98",
  build: "Demo Build",
  released: "2026-08-24",
  title: "Permission & Access Control Hardening",
  notes: [
    "Fixed custom user permissions so the signed-in user's saved role and individual permission switches are now loaded and enforced throughout B5.",
    "Restricted navigation and operational actions now disappear when access is disabled; dependent permissions such as Create Rentals cannot bypass a disabled View Rentals permission.",
    "Inactive staff profiles are now refused entry at sign-in, and Manager Mode visibility follows the user's saved Manager permission rather than relying only on the legacy role field.",
    "Added database-side permission helpers and RLS hardening for core rental, customer, fleet and payment data so access controls are enforced beyond the browser interface."
  ]
};