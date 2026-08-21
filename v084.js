/* B5 v0.8.4 — visible version indicator and dynamic Settings version */
(function(){
  function currentVersion(){return (window.B5_VERSION&&window.B5_VERSION.version)||"0.8.4";}

  /* Replace the old hard-coded Settings build text with live version metadata. */
  renderSettings=function(){
    const info=window.B5_VERSION||{};
    return `<div class="grid two-col">
      <div class="panel"><div class="panel-head"><h3>Supabase Connection</h3></div><div class="panel-body">
        <p><strong>Status:</strong> ${state.live?'<span class="badge live-status">Online</span>':'<span class="badge fallback-status">Offline</span>'}</p>
        <button class="btn btn-secondary" id="refreshSupabase">Refresh Live Data</button>
      </div></div>
      <div class="panel"><div class="panel-head"><h3>App Version</h3><span class="badge badge-demo">v${esc(currentVersion())}</span></div><div class="panel-body">
        <p><strong>Current version:</strong> v${esc(currentVersion())}</p>
        ${info.title?`<p class="note"><strong>${esc(info.title)}</strong></p>`:""}
        ${info.released?`<p class="vehicle-meta">Released ${esc(info.released)}</p>`:""}
        <button class="btn btn-secondary" type="button" id="settingsReleaseNotes">View Release Notes</button>
      </div></div>
    </div>`;
  };

  /* Keep the top-bar version visible on phones instead of hiding it with the user name. */
  function ensureMobileVersion(){
    const top=document.querySelector('.topbar');
    if(!top)return;
    let badge=document.getElementById('mobileVersionBadge');
    if(!badge){
      badge=document.createElement('button');
      badge.type='button';
      badge.id='mobileVersionBadge';
      badge.className='mobile-version-badge';
      badge.title='View release notes';
      badge.addEventListener('click',()=>{
        const vb=document.getElementById('versionBtn');
        if(vb)vb.click();
      });
      top.appendChild(badge);
    }
    badge.textContent=`v${currentVersion()}`;
    const desktop=document.getElementById('versionBtn');
    if(desktop)desktop.textContent=`v${currentVersion()}`;
  }

  const oldRender=render;
  render=function(){oldRender();ensureMobileVersion();};

  const oldBind=bindPageEvents;
  bindPageEvents=function(){
    oldBind();
    document.getElementById('settingsReleaseNotes')?.addEventListener('click',()=>document.getElementById('versionBtn')?.click());
  };

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ensureMobileVersion);
  else ensureMobileVersion();
})();
