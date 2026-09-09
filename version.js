window.B5_VERSION = {
  version: "0.9.23a",
  build: "Demo Build",
  released: "2026-09-09",
  title: "Window Focus Navigation Fix",
  notes: [
    "Fixed navigation jumping back to an older remembered page after switching away from the B5 window and returning.",
    "The currently visible page and Manager Mode section are now preserved if authentication/session startup is re-entered while the app is already running.",
    "Normal browser refresh continues to restore the latest page from the URL route."
  ]
};