window.B5_VERSION = {
  version: "0.9.21",
  build: "Demo Build",
  released: "2026-09-09",
  title: "Persistent Page Navigation",
  notes: [
    "Refreshing the app now returns you to the page you were viewing instead of always returning to Dashboard.",
    "Manager Mode remembers its selected section when refreshed.",
    "Current app location is stored in the URL hash so browser Back and Forward navigation can follow page changes.",
    "Restricted manager-only pages safely fall back to Dashboard when the signed-in user does not have manager access."
  ]
};