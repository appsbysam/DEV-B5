window.B5_VERSION = {
  version: "0.9.24a",
  build: "Demo Build",
  released: "2026-09-09",
  title: "Fleet Lifecycle Data Fix",
  notes: [
    "Ensured the new Fleet Sales and lifecycle fields are loaded into the live vehicle state on every Supabase refresh.",
    "For Sale vehicles are excluded from all new availability searches and bookings while an existing rental can still finish normally.",
    "Retained the full v0.9.24 Fleet Sales, sale recording, add/edit, retire and reactivation functionality."
  ]
};