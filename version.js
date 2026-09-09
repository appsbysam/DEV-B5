window.B5_VERSION = {
  version: "0.9.24h",
  build: "Demo Build",
  released: "2026-09-10",
  title: "Action List & Mobile Navigation Fix",
  notes: [
    "Restored Action List expand/collapse controls and completed-category green highlighting, including after checking or unchecking an item.",
    "Action List presentation is safely reapplied after its asynchronous database refresh without creating a MutationObserver feedback loop.",
    "On mobile, selecting any sidebar navigation item now automatically closes the sidebar after navigation."
  ]
};
(()=>{const s=document.createElement('script');s.src='v0924d.js?v=0.9.24h';s.defer=true;document.head.appendChild(s);})();