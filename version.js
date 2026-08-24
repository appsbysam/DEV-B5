window.B5_VERSION = {
  version: "0.9.8",
  build: "Demo Build",
  released: "2026-08-24",
  title: "Canonical PWA Repair",
  notes: [
    "Consolidated PWA and push-notification handling onto the existing sw.js service worker so two workers no longer compete for the same DEV-B5 scope.",
    "Added a real fetch handler to sw.js and registered that worker directly from index.html for reliable installability detection.",
    "Removed stale v0.9.1 manifest and favicon references from the page and switched to stable canonical PWA paths without query-string cache busting.",
    "Replaced browser shortcut fallback favicon assets with B5 artwork so Brave does not fall back to a generic letter icon.",
    "Removed the temporary competing service-worker.js introduced in v0.9.7."
  ]
};