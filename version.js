window.B5_VERSION = {
  version: "0.9.24f",
  build: "Demo Build",
  released: "2026-09-10",
  title: "Action List Freeze Fix",
  notes: [
    "Fixed the Action List freeze introduced by the completed-category highlighting update.",
    "Removed the MutationObserver feedback loop while retaining live category completion counts and green completed-category headers.",
    "Completed categories still return to grey automatically when a new incomplete action is added."
  ]
};
(()=>{const s=document.createElement('script');s.src='v0924d.js?v=0.9.24f';s.defer=true;document.head.appendChild(s);})();