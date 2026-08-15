window.B5_VERSION = {
  version: "0.7.2",
  build: "Demo Build",
  released: "2026-08-15",
  title: "Modal Exit & Smarter Update Checks",
  notes: [
    "Fixed New Rental / Booking so X and Cancel close immediately without triggering required-field validation.",
    "Required-field validation now runs only when Create Booking is pressed.",
    "Changed version checking from every 10 minutes to a lighter schedule.",
    "B5 now checks shortly after startup, again after 5 minutes, every 6 hours while open, and when returning after a long absence.",
    "No Supabase database changes are required."
  ]
};
