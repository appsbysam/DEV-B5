window.B5_VERSION = {
  version: "0.9.32",
  build: "Demo Build",
  released: "2026-09-14",
  title: "Password Recovery Fix",
  notes: [
    "Fixed the password recovery flow so a completed reset returns cleanly to normal sign-in.",
    "Cleared recovery state before a normal sign-in so users are not sent back to Choose a new password.",
    "Updated cache-busting and service-worker release version so the latest authentication code is loaded."
  ]
};
(()=>{const load=(src)=>{const s=document.createElement('script');s.src=src;s.defer=true;document.head.appendChild(s);};load('v0924d.js?v=0.9.32');load('v0925.js?v=0.9.32');load('v0925a.js?v=0.9.32');load('v0926.js?v=0.9.32');load('v0927.js?v=0.9.32');load('v0928.js?v=0.9.32');load('v0929.js?v=0.9.32');load('v0930.js?v=0.9.32');load('v0931.js?v=0.9.32');})();