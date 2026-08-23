/* B5 v0.8.72 mobile profile notifications fix */
(function(){
 function supportedPush(){return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;}
 function prefs(){return (state&&state.userProfile&&state.userProfile.notification_preferences)||{pickup:true,return:true,overdue:true,maintenance:true};}
 function renderNotificationPanel(){
  var body=document.getElementById('profileBody');
  if(!body||document.getElementById('notificationSettingsCard'))return;
  var p=prefs(),supported=supportedPush();
  body.insertAdjacentHTML('beforeend','<div class="notification-card" id="notificationSettingsCard"><div class="notification-card-head"><div><strong>Push Notifications</strong><div class="vehicle-meta">Receive B5 alerts even when the app is not open.</div></div><span class="notification-status" id="mobilePushStatus">'+(supported?'Checking...':'Not supported')+'</span></div><div class="notification-options"><label class="notification-option"><span>Pickup reminders</span><input type="checkbox" data-notification-pref="pickup" '+(p.pickup!==false?'checked':'')+'></label><label class="notification-option"><span>Return reminders</span><input type="checkbox" data-notification-pref="return" '+(p.return!==false?'checked':'')+'></label><label class="notification-option"><span>Overdue rentals</span><input type="checkbox" data-notification-pref="overdue" '+(p.overdue!==false?'checked':'')+'></label><label class="notification-option"><span>Maintenance reminders</span><input type="checkbox" data-notification-pref="maintenance" '+(p.maintenance!==false?'checked':'')+'></label></div><div class="notification-actions"><button class="btn btn-primary" type="button" id="enablePushBtn" '+(!supported?'disabled':'')+'>Enable on This Device</button><button class="btn btn-secondary" type="button" id="disablePushBtn" style="display:none">Disable on Device</button><button class="btn btn-secondary" type="button" id="testPushBtn" style="display:none">Send Test</button><button class="btn btn-primary" type="button" id="savePushPrefs">Save Preferences</button></div><div class="notification-help">B5 checks every 15 minutes for pickups and returns due within 2 hours, overdue rentals and maintenance thresholds at 5,000 / 3,000 / 1,000 km.</div></div>');
  if(typeof bindPushButtons==='function')bindPushButtons();
  refreshPushState();
 }
 async function refreshPushState(){
  var status=document.getElementById('mobilePushStatus'); if(!status||!supportedPush())return;
  try{
   var reg=await navigator.serviceWorker.getRegistration('./');
   var sub=reg?await reg.pushManager.getSubscription():null;
   status.textContent=sub?'Enabled on this device':'Not enabled';
   status.classList.toggle('on',!!sub);
   var en=document.getElementById('enablePushBtn'),dis=document.getElementById('disablePushBtn'),test=document.getElementById('testPushBtn');
   if(en)en.style.display=sub?'none':''; if(dis)dis.style.display=sub?'':'none'; if(test)test.style.display=sub?'':'none';
  }catch(e){status.textContent='Not enabled';}
 }
 function openMobileProfile(){
  if(typeof openUserProfile==='function')openUserProfile();
  setTimeout(renderNotificationPanel,0);
 }
 function addMobileProfileButton(){
  var sidebar=document.getElementById('sidebar'); if(!sidebar||document.getElementById('mobileProfileBtn'))return;
  var footer=sidebar.querySelector('.sidebar-footer'),btn=document.createElement('button');
  btn.type='button'; btn.id='mobileProfileBtn'; btn.className='mobile-profile-btn';
  btn.innerHTML='<span class="mobile-profile-icon">&#128100;</span><span><strong>My Profile</strong><small>Notifications &amp; account</small></span>';
  btn.onclick=openMobileProfile;
  if(footer)sidebar.insertBefore(btn,footer); else sidebar.appendChild(btn);
 }
 window.addEventListener('load',addMobileProfileButton); addMobileProfileButton();
})();