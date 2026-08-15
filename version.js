window.B5_VERSION = {
  version: "0.7.4",
  build: "Demo Build",
  released: "2026-08-15",
  title: "Reconciled Fleet Statuses",
  notes: [
    "Updated vehicle availability logic to respect reconciled database statuses.",
    "Vehicles marked Needs Review are no longer treated as available.",
    "Vehicles with unresolved Out on Rental status but no reliable segment are shown as Needs Review.",
    "Added a Needs Review dashboard count so uncertain source records remain visible without distorting availability.",
    "This build is designed to work with the 15 August customer/rental reconciliation imported into Supabase."
  ]
};
