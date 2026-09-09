/* B5 v0.9.24h — Action List rebuild resilience + mobile sidebar close */
(()=>{
  const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
  const escapeHtml=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
  let applying=false;

  function processActionList(){
    if(applying || state.page!=='actionlist') return;
    const body=$('#actionListBody');
    if(!body || !body.querySelector('.action-category')) return;
    applying=true;
    try{
      body.querySelectorAll('.action-category').forEach(section=>{
        const items=$$('.action-item',section);
        let toggle=$('.action-category-toggle',section);
        let category=toggle?.dataset.category||'';
        if(!toggle){
          const heading=$('h3',section);
          if(!heading) return;
          category=heading.textContent.trim();
          toggle=document.createElement('button');
          toggle.type='button';
          toggle.className='action-category-toggle';
          toggle.dataset.category=category;
          heading.replaceWith(toggle);
        }
        const done=items.filter(item=>item.classList.contains('is-done')).length;
        const complete=items.length>0 && done===items.length;
        const key='b5-action-open:'+category;
        const open=localStorage.getItem(key)==='1';
        toggle.classList.toggle('is-complete',complete);
        section.classList.toggle('is-complete',complete);
        toggle.innerHTML=`<span><strong>${escapeHtml(category)}</strong><small>${done} of ${items.length} completed</small></span><span class="action-chevron">${open?'▾':'▸'}</span>`;
        toggle.setAttribute('aria-expanded',String(open));
        items.forEach(item=>item.hidden=!open);
        toggle.onclick=()=>{
          const next=toggle.getAttribute('aria-expanded')!=='true';
          toggle.setAttribute('aria-expanded',String(next));
          items.forEach(item=>item.hidden=!next);
          $('.action-chevron',toggle).textContent=next?'▾':'▸';
          localStorage.setItem(key,next?'1':'0');
        };
      });
    }finally{
      applying=false;
    }
  }

  function scheduleProcess(){requestAnimationFrame(()=>requestAnimationFrame(processActionList));}

  const content=$('#content');
  if(content && !content._b5ActionRebuildObserver){
    const observer=new MutationObserver(mutations=>{
      if(state.page!=='actionlist') return;
      if(mutations.some(m=>m.target===content || m.target.id==='actionListBody')) scheduleProcess();
    });
    observer.observe(content,{childList:true,subtree:true});
    content._b5ActionRebuildObserver=observer;
  }

  document.addEventListener('change',e=>{
    if(e.target?.matches?.('#actionListBody [data-action-id]')){
      setTimeout(scheduleProcess,50);
      setTimeout(scheduleProcess,250);
      setTimeout(scheduleProcess,700);
    }
  },true);

  const nav=$('#nav');
  if(nav && !nav._b5MobileAutoClose){
    nav.addEventListener('click',e=>{
      const item=e.target.closest('.nav-btn');
      if(item && window.innerWidth<760) requestAnimationFrame(()=>typeof closeMobileMenu==='function'&&closeMobileMenu());
    },true);
    nav._b5MobileAutoClose=true;
  }

  if(state.page==='actionlist') scheduleProcess();
})();