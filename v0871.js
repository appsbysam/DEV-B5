/* B5 v0.8.71 mobile profile access */
(function(){
 function addMobileProfileButton(){
  var sidebar=document.getElementById('sidebar');
  if(!sidebar||document.getElementById('mobileProfileBtn'))return;
  var footer=sidebar.querySelector('.sidebar-footer');
  var btn=document.createElement('button');
  btn.type='button'; btn.id='mobileProfileBtn'; btn.className='mobile-profile-btn';
  btn.innerHTML='<span class="mobile-profile-icon">&#128100;</span><span><strong>My Profile</strong><small>Notifications &amp; account</small></span>';
  btn.onclick=function(){ if(typeof openUserProfile==='function')openUserProfile(); };
  if(footer)sidebar.insertBefore(btn,footer); else sidebar.appendChild(btn);
 }
 window.addEventListener('load',addMobileProfileButton); addMobileProfileButton();
})();