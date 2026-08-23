/* B5 v0.8.87 — future security infrastructure (feature flagged OFF) */
(function(){
  window.B5_SECURITY_FEATURES=Object.freeze({enabled:false,pinUnlock:false,biometricUnlock:false,autoLock:false,lockOnClose:false,storageVersion:1});
  window.B5Security={isEnabled:()=>false,supportsPasskeys:()=>!!(window.PublicKeyCredential&&navigator.credentials),defaults:Object.freeze({quickUnlock:'both',autoLockMinutes:5,lockOnClose:true}),activate(){return false;}};

  const previousRenderSettings=renderSettings;
  renderSettings=function(){
    let html=previousRenderSettings();
    const security=`<div class="security-settings-item"><button type="button" class="settings-row security-settings-toggle" id="securitySettingsToggle" aria-expanded="false"><span class="settings-icon">🔒</span><span class="settings-row-copy"><strong>Security & Lock Screen <span class="badge security-soon-badge">Coming Soon</span></strong><small>PIN, biometrics and automatic app locking</small></span><span class="settings-trail security-chevron">›</span></button><div class="security-settings-panel" id="securitySettingsPanel" hidden><fieldset disabled class="security-disabled-fields"><div class="field"><label>Quick Unlock</label><select><option>PIN + Biometrics</option></select></div><div class="field"><label>PIN</label><button type="button" class="btn btn-secondary">Set / Change PIN</button></div><div class="field"><label>Biometrics / Passkey</label><button type="button" class="btn btn-secondary">Enable fingerprint or face</button></div><div class="field"><label>Auto-lock after inactivity</label><select><option>5 minutes</option><option>10 minutes</option><option>15 minutes</option><option>30 minutes</option></select></div><div class="field"><label>Lock when app closes</label><select><option>On</option><option>Off</option></select></div><button type="button" class="btn btn-secondary">Lock Now</button></fieldset><p class="note security-coming-note">Infrastructure prepared. This feature is currently switched off and does not change sign-in or app behaviour.</p></div></div>`;
    const notificationEnd=html.indexOf('</button>',html.indexOf('data-settings-open="notifications"'));
    if(notificationEnd!==-1) html=html.slice(0,notificationEnd+9)+security+html.slice(notificationEnd+9);
    return html;
  };

  const previousBind=bindPageEvents;
  bindPageEvents=function(){
    previousBind();
    if(state.page!=='settings')return;
    const toggle=document.getElementById('securitySettingsToggle'),panel=document.getElementById('securitySettingsPanel');
    if(toggle&&panel)toggle.onclick=()=>{const open=panel.hidden;panel.hidden=!open;toggle.setAttribute('aria-expanded',String(open));toggle.classList.toggle('expanded',open);};
  };
})();
