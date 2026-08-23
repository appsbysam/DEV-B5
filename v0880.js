/* B5 v0.8.87 — future security infrastructure (feature flagged OFF) */
(function(){
  window.B5_SECURITY_FEATURES=Object.freeze({
    enabled:false,
    pinUnlock:false,
    biometricUnlock:false,
    autoLock:false,
    lockOnClose:false,
    storageVersion:1
  });

  window.B5Security={
    isEnabled:()=>window.B5_SECURITY_FEATURES.enabled===true,
    supportsPasskeys:()=>!!(window.PublicKeyCredential&&navigator.credentials),
    defaults:Object.freeze({quickUnlock:'both',autoLockMinutes:5,lockOnClose:true}),
    // Intentionally dormant. Activation will add secure PIN enrolment/verification,
    // WebAuthn/passkey registration, inactivity timers and per-user persistence.
    activate(){return false;}
  };

  const previousRenderSettings=renderSettings;
  renderSettings=function(){
    const current=previousRenderSettings();
    const security=`<div class="panel security-coming-soon" aria-disabled="true"><div class="panel-head"><div><h3>Security & Lock Screen <span class="badge security-soon-badge">Coming Soon</span></h3><div class="vehicle-meta">Quick unlock and automatic app locking.</div></div></div><div class="panel-body"><fieldset disabled class="security-disabled-fields"><div class="field"><label>Quick Unlock</label><select><option>PIN + Biometrics</option></select></div><div class="field"><label>PIN</label><button type="button" class="btn btn-secondary">Set / Change PIN</button></div><div class="field"><label>Biometrics / Passkey</label><button type="button" class="btn btn-secondary">Enable fingerprint or face</button></div><div class="field"><label>Auto-lock after inactivity</label><select><option>5 minutes</option><option>10 minutes</option><option>15 minutes</option><option>30 minutes</option></select></div><div class="field"><label>Lock when app closes</label><select><option>On</option><option>Off</option></select></div><button type="button" class="btn btn-secondary">Lock Now</button></fieldset><p class="note security-coming-note">Infrastructure prepared. This feature is currently switched off and does not change sign-in or app behaviour.</p></div></div>`;
    return `<div class="security-settings-wrap">${security}</div>${current}`;
  };
})();
