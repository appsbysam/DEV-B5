/* B5 v0.8.74 — working mobile push controls */
(function(){
 const DEFAULT_PREFS={pickup:true,return:true,overdue:true,maintenance:true};
 function supportedPush(){return 'serviceWorker' in navigator&&'PushManager' in window&&'Notification' in window;}
 function prefs(){return {...DEFAULT_PREFS,...((state&&state.userProfile&&state.userProfile.notification_preferences)||{})};}
 function b64ToBytes(s){const pad='='.repeat((4-s.length%4)%4),b=(s+pad).replace(/-/g,'+').replace(/_/g,'/'),raw=atob(b);return Uint8Array.from([...raw].map(c=>c.charCodeAt(0)));}
 function closeProfile(){const d=document.getElementById('profileModal');if(d&&d.open)d.close();}
 async function getRegistration(){if(!supportedPush())throw new Error('Push notifications are not supported by this browser.');await navigator.serviceWorker.register('./sw.js?v=0.8.74',{scope:'./'});return navigator.serviceWorker.ready;}
 async function getSubscription(){if(!supportedPush())return null;try{return await (await getRegistration()).pushManager.getSubscription();}catch(e){console.warn(e);return null;}}
 function setBusy(button,busy,label){if(!button)return;if(busy){button.dataset.oldText=button.textContent;button.disabled=true;if(label)button.textContent=label;}else{button.disabled=false;if(button.dataset.oldText){button.textContent=button.dataset.oldText;delete button.dataset.oldText;}}}
 async function refreshPushState(){
  const status=document.getElementById('mobilePushStatus');if(!status)return;
  if(!supportedPush()){status.textContent='Not supported';status.classList.remove('on');return;}
  const sub=await getSubscription();
  status.textContent=sub?'Enabled on this device':'Not enabled';status.classList.toggle('on',!!sub);
  const en=document.getElementById('enablePushBtn'),dis=document.getElementById('disablePushBtn'),test=document.getElementById('testPushBtn');
  if(en)en.style.display=sub?'none':'';if(dis)dis.style.display=sub?'':'none';if(test)test.style.display=sub?'':'none';
 }
 async function enableOnDevice(){
  const btn=document.getElementById('enablePushBtn');setBusy(btn,true,'Enabling...');
  try{
   if(!supportedPush())throw new Error('Push notifications are not supported by this browser.');
   const permission=await Notification.requestPermission();
   if(permission!=='granted')throw new Error(permission==='denied'?'Notifications are blocked for B5. Please allow notifications in your browser/site settings and try again.':'Notification permission was not granted.');
   const reg=await getRegistration();
   const {data:setting,error:settingError}=await window.db.from('app_public_settings').select('value').eq('key','vapid_public_key').single();
   if(settingError||!setting?.value)throw new Error('The B5 push notification key could not be loaded.');
   let sub=await reg.pushManager.getSubscription();
   if(!sub)sub=await reg.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:b64ToBytes(setting.value)});
   const raw=sub.toJSON();
   const {data:{session}}=await window.db.auth.getSession();if(!session)throw new Error('Please sign in again.');
   const row={user_id:session.user.id,endpoint:raw.endpoint,p256dh:raw.keys?.p256dh||'',auth:raw.keys?.auth||'',user_agent:navigator.userAgent,device_label:navigator.userAgentData?.platform||navigator.platform||'Device',active:true,updated_at:new Date().toISOString()};
   const {error}=await window.db.from('push_subscriptions').upsert(row,{onConflict:'endpoint'});if(error)throw error;
   try{await logAudit('push_enabled','staff_profile',session.user.id,{device:row.device_label});}catch(e){}
   await refreshPushState();
   alert('Push notifications are now enabled on this device.');
  }catch(e){console.error('Enable push failed',e);alert(e.message||'Unable to enable notifications on this device.');}
  finally{setBusy(btn,false);}
 }
 async function disableOnDevice(){
  const btn=document.getElementById('disablePushBtn');setBusy(btn,true,'Disabling...');
  try{
   const sub=await getSubscription();
   if(sub){await window.db.from('push_subscriptions').update({active:false,updated_at:new Date().toISOString()}).eq('endpoint',sub.endpoint);await sub.unsubscribe();}
   const {data:{session}}=await window.db.auth.getSession();if(session){try{await logAudit('push_disabled','staff_profile',session.user.id,{});}catch(e){}}
   await refreshPushState();alert('Push notifications are disabled on this device.');
  }catch(e){console.error('Disable push failed',e);alert(e.message||'Unable to disable notifications.');}
  finally{setBusy(btn,false);}
 }
 async function savePreferences(){
  const btn=document.getElementById('savePushPrefs');setBusy(btn,true,'Saving...');
  try{
   const values={};document.querySelectorAll('[data-notification-pref]').forEach(x=>values[x.dataset.notificationPref]=!!x.checked);
   const {data:{session}}=await window.db.auth.getSession();if(!session)throw new Error('Please sign in again.');
   const {error}=await window.db.from('staff_profiles').update({notification_preferences:values}).eq('user_id',session.user.id);if(error)throw error;
   if(state.userProfile)state.userProfile.notification_preferences=values;
   try{await logAudit('notification_preferences_updated','staff_profile',session.user.id,values);}catch(e){}
   closeProfile();
  }catch(e){console.error('Save notification preferences failed',e);alert(e.message||'Unable to save notification preferences.');}
  finally{setBusy(btn,false);}
 }
 async function sendTest(){
  const btn=document.getElementById('testPushBtn');if(!btn||btn.disabled)return;
  setBusy(btn,true,'Sending...');
  try{
   const {data,error}=await window.db.functions.invoke('b5-push-notifications',{body:{action:'test'}});
   if(error)throw error;
   if(!data?.sent)throw new Error('No active notification subscription was found for this device.');
  }catch(e){
   console.error('Test push failed',e);
   alert(e.message||'Test notification failed.');
  }finally{
   setBusy(btn,false);
   if(document.getElementById('testPushBtn')===btn){btn.textContent='Send Test';btn.disabled=false;}
  }
 }
 function bindControls(){
  const en=document.getElementById('enablePushBtn'),dis=document.getElementById('disablePushBtn'),save=document.getElementById('savePushPrefs'),test=document.getElementById('testPushBtn');
  if(en)en.onclick=enableOnDevice;if(dis)dis.onclick=disableOnDevice;if(save)save.onclick=savePreferences;if(test)test.onclick=sendTest;
 }
 function renderNotificationPanel(){
  const body=document.getElementById('profileBody');if(!body)return;
  document.getElementById('notificationSettingsCard')?.remove();
  const p=prefs(),supported=supportedPush();
  body.insertAdjacentHTML('beforeend','<div class="notification-card" id="notificationSettingsCard"><div class="notification-card-head"><div><strong>Push Notifications</strong><div class="vehicle-meta">Receive B5 alerts even when the app is not open.</div></div><span class="notification-status" id="mobilePushStatus">'+(supported?'Checking...':'Not supported')+'</span></div><div class="notification-options"><label class="notification-option"><span>Pickup reminders</span><input type="checkbox" data-notification-pref="pickup" '+(p.pickup!==false?'checked':'')+'></label><label class="notification-option"><span>Return reminders</span><input type="checkbox" data-notification-pref="return" '+(p.return!==false?'checked':'')+'></label><label class="notification-option"><span>Overdue rentals</span><input type="checkbox" data-notification-pref="overdue" '+(p.overdue!==false?'checked':'')+'></label><label class="notification-option"><span>Maintenance reminders</span><input type="checkbox" data-notification-pref="maintenance" '+(p.maintenance!==false?'checked':'')+'></label></div><div class="notification-actions"><button class="btn btn-primary" type="button" id="enablePushBtn" '+(!supported?'disabled':'')+'>Enable on This Device</button><button class="btn btn-secondary" type="button" id="disablePushBtn" style="display:none">Disable on This Device</button><button class="btn btn-secondary" type="button" id="testPushBtn" style="display:none">Send Test</button><button class="btn btn-primary" type="button" id="savePushPrefs">Save Preferences</button></div><div class="notification-help">Choose which alerts you want on this account. B5 currently supports pickup reminders, return reminders, overdue rentals and vehicle maintenance reminders.</div></div>');
  bindControls();refreshPushState();
 }
 function openMobileProfile(){if(typeof openUserProfile==='function')openUserProfile();setTimeout(renderNotificationPanel,0);}
 function addMobileProfileButton(){const sidebar=document.getElementById('sidebar');if(!sidebar||document.getElementById('mobileProfileBtn'))return;const footer=sidebar.querySelector('.sidebar-footer'),btn=document.createElement('button');btn.type='button';btn.id='mobileProfileBtn';btn.className='mobile-profile-btn';btn.innerHTML='<span class="mobile-profile-icon">&#128100;</span><span><strong>My Profile</strong><small>Notifications &amp; account</small></span>';btn.onclick=openMobileProfile;if(footer)sidebar.insertBefore(btn,footer);else sidebar.appendChild(btn);}
 window.addEventListener('load',addMobileProfileButton);addMobileProfileButton();
})();