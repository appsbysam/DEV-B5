/* B5 v0.8.71 mobile profile access + notification panel fallback */
(function(){
 async function ensureNotificationPanel(){
  try{
   var body=document.getElementById('profileBody');
   if(!body||document.getElementById('notificationSettingsCard'))return;
   if(typeof pushSettingsHtml==='function'){
    body.insertAdjacentHTML('beforeend',await pushSettingsHtml());
    if(typeof bindPushButtons==='function')bindPushButtons();
   }
  }catch(e){console.warn('Unable to render notification settings',e);}
 }
 async function openMobileProfile(){
  if(typeof openUserProfile==='function')await openUserProfile();
  await ensureNotificationPanel();
 }
 function addMobileProfileButton(){
  var sidebar=document.getElementById('sidebar');
  if(!sidebar||document.getElementById('mobileProfileBtn'))return;
  var footer=sidebar.querySelector('.sidebar-footer');
  var btn=document.createElement('button');
  btn.type='button'; btn.id='mobileProfileBtn'; btn.className='mobile-profile-btn';
  btn.innerHTML='<span class="mobile-profile-icon">&#128100;</span><span><strong>My Profile</strong><small>Notifications &amp; account</small></span>';
  btn.onclick=openMobileProfile;
  if(footer)sidebar.insertBefore(btn,footer); else sidebar.appendChild(btn);
 }
 window.addEventListener('load',addMobileProfileButton); addMobileProfileButton();
})();