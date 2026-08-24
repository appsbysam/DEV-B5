window.B5_VERSION = {
  version: "0.9.11",
  build: "Demo Build",
  released: "2026-08-24",
  title: "Original Asset Icon Restoration",
  notes: [
    "Restored PWA and browser icon configuration to the original icon set already stored under assets/icons.",
    "Manifest now uses icon-192.png and icon-512.png for standard app icons and the original icon-maskable files for Android launcher treatment.",
    "Removed the later pwa-icon-v095 files from all active manifest and service-worker icon references.",
    "Updated the service-worker cache generation so obsolete icon metadata and previous shell caches are discarded.",
    "No Supabase or application-data changes were required."
  ]
};