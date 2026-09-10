window.B5_VERSION = {
  version: "0.9.25b",
  build: "Demo Build",
  released: "2026-09-10",
  title: "Focus Refresh Fix",
  notes: [
    "Switching browser tabs or Alt-Tabbing away and back no longer triggers an unnecessary app re-render.",
    "Silent Supabase token refreshes now keep the current screen exactly as-is while preserving the signed-in session.",
    "Normal browser refresh, route restoration, scroll restoration and navigation continue to work as before."
  ]
};
(()=>{const load=(src)=>{const s=document.createElement('script');s.src=src;s.defer=true;document.head.appendChild(s);};load('v0924d.js?v=0.9.25b');load('v0925.js?v=0.9.25b');load('v0925a.js?v=0.9.25b');})();