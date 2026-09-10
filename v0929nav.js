/* B5 v0.9.29 — temporary Client Testing navigation */
(()=>{
  const addTestingNav=()=>{
    const nav=document.getElementById('nav');
    if(!nav||document.querySelector('[data-page="clienttesting"]'))return;
    const btn=document.createElement('button');
    btn.type='button';
    btn.dataset.page='clienttesting';
    btn.className='nav-btn';
    btn.textContent='Client Testing';
    const manager=document.getElementById('managerNav');
    nav.insertBefore(btn,manager||null);
    btn.addEventListener('click',()=>{
      state.page='clienttesting';
      try{location.hash='clienttesting';}catch{}
      render();
      if(typeof closeSidebar==='function')closeSidebar();
    });
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',addTestingNav,{once:true});else addTestingNav();
})();