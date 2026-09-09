/* v0.9.19 — Manager Action List */
(()=>{
  const $=(s,r=document)=>r.querySelector(s);
  const esc2=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
  const originalRender=window.render;

  function manager(){ return window.state?.userProfile?.role==='manager' || (typeof isManager==='function' && isManager()); }

  function ensureNav(){
    const nav=$('#nav'); if(!nav) return;
    let btn=$('#actionListNav');
    if(!btn){
      btn=document.createElement('button'); btn.id='actionListNav'; btn.className='nav-btn manager-only'; btn.dataset.page='actionlist'; btn.textContent='Action List';
      const managerBtn=$('#managerNav'); nav.insertBefore(btn,managerBtn||null);
      btn.onclick=()=>{ if(!manager()) return; state.page='actionlist'; render(); document.body.classList.remove('sidebar-open'); };
    }
    btn.hidden=!manager();
  }

  async function renderActionList(){
    if(!manager()){ state.page='dashboard'; return originalRender(); }
    const title=$('#pageTitle'),sub=$('#pageSubtitle'),content=$('#content');
    if(title) title.textContent='Action List'; if(sub) sub.textContent='B5 client requirements and implementation checklist';
    $$('.nav-btn').forEach(b=>b.classList.toggle('active',b.dataset.page==='actionlist'));
    content.innerHTML='<div class="panel"><div class="panel-head"><div><h2>Client Requirements</h2><p>Manager-only working checklist. Every status change is recorded in the audit log.</p></div></div><div id="actionListBody" class="action-list-loading">Loading…</div></div>';
    const {data,error}=await window.db.from('action_items').select('*').order('sort_order');
    const body=$('#actionListBody'); if(!body) return;
    if(error){ body.innerHTML='<div class="empty-state">Could not load the action list.</div>'; return; }
    const groups={}; (data||[]).forEach(x=>(groups[x.category]??=[]).push(x));
    const done=(data||[]).filter(x=>x.completed).length,total=(data||[]).length;
    body.innerHTML=`<div class="action-summary"><strong>${done} of ${total} completed</strong><span>${total?Math.round(done/total*100):0}%</span></div>`+Object.entries(groups).map(([cat,items])=>`<section class="action-category"><h3>${esc2(cat)}</h3>${items.map(i=>`<label class="action-item ${i.completed?'is-done':''}"><input type="checkbox" data-action-id="${i.id}" ${i.completed?'checked':''}><span><strong>${esc2(i.title)}</strong>${i.notes?`<small>${esc2(i.notes)}</small>`:''}</span></label>`).join('')}</section>`).join('');
    body.querySelectorAll('[data-action-id]').forEach(cb=>cb.onchange=()=>toggleItem(cb));
  }

  async function toggleItem(cb){
    const id=cb.dataset.actionId, completed=cb.checked, label=cb.closest('.action-item'), title=label?.querySelector('strong')?.textContent||'Action item';
    cb.disabled=true;
    const {data:userData}=await window.db.auth.getUser(); const uid=userData?.user?.id||null;
    const {error}=await window.db.from('action_items').update({completed,updated_at:new Date().toISOString(),updated_by:uid}).eq('id',id);
    if(error){ cb.checked=!completed; cb.disabled=false; alert('Could not update this item.'); return; }
    if(typeof window.logAudit==='function') await window.logAudit(completed?'action_item_completed':'action_item_reopened','action_item',id,{title,completed});
    renderActionList();
  }

  window.render=function(){ ensureNav(); if(state.page==='actionlist') return renderActionList(); return originalRender.apply(this,arguments); };
  document.addEventListener('DOMContentLoaded',ensureNav);
  setTimeout(ensureNav,800);
})();