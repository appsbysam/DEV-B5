window.B5_VERSION = {
  version: "0.9.7",
  build: "Demo Build",
  released: "2026-08-24",
  title: "PWA Installability Repair",
  notes: [
    "Added a dedicated service worker so supported Android browsers can recognise B5 as an installable web application rather than only a generic website shortcut.",
    "Added a fresh v0.9.7 manifest URL with explicit DEV-B5 scope, start URL and application icon paths.",
    "Replaced stale v0.9.1 manifest and shortcut-icon metadata at runtime so Brave no longer falls back to the generic letter icon path.",
    "Retained the approved B5 white-background branding and existing login layout."
  ]
};