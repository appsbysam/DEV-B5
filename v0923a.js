/* B5 v0.9.23a — preserve the live route when auth/session startup is re-entered */
(()=>{
  const routedStart=window.startB5App;
  let initialStart=true;
  window.startB5App=async function(){
    if(initialStart){
      initialStart=false;
      return routedStart.apply(this,arguments);
    }

    /* Supabase/auth can re-enter app startup after a browser focus/session event.
       The v0.9.21 startup route is intentionally a snapshot from page load, so
       reapplying it here would roll the UI back to that older page. Preserve the
       route the user is actually on while allowing the underlying refresh to run. */
    const currentPage=state.page;
    const currentManagerView=state.managerView;
    const app=document.getElementById('app');
    const previousVisibility=app?.style.visibility||'';
    if(app) app.style.visibility='hidden';
    try{
      const result=await routedStart.apply(this,arguments);
      state.page=currentPage;
      state.managerView=currentManagerView;
      window.render();
      const section=currentPage==='manager'&&currentManagerView?`/${encodeURIComponent(currentManagerView)}`:'';
      history.replaceState(null,'',`#/${encodeURIComponent(currentPage||'dashboard')}${section}`);
      return result;
    }finally{
      if(app) requestAnimationFrame(()=>{app.style.visibility=previousVisibility;});
    }
  };
})();