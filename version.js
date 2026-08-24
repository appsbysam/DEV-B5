window.B5_VERSION = {
  version: "0.9.10",
  build: "Demo Build",
  released: "2026-08-24",
  title: "Canonical Brave Shortcut Icon Fix",
  notes: [
    "Identified that index.html was still serving the original v0.9.5 icon references despite the later repair releases.",
    "Replaced the exact 192 x 192 PNG at the path already requested by index.html and manifest.webmanifest with freshly generated B5 artwork.",
    "Added a genuine multi-resolution favicon.ico at the application root so Brave's Create shortcut fallback has a canonical icon even when it ignores PWA metadata.",
    "Replaced the legacy assets/icons/favicon.ico and 16 x 16 favicon with correctly encoded icon files instead of mislabeled duplicate PNG data.",
    "Replaced the touch-icon fallback with the B5 artwork and left the service worker network-first so it cannot pin an obsolete icon response."
  ]
};