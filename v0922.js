/* B5 v0.9.22 — supplier/GPS fleet filters + refined Action List */
(()=>{
  Object.assign(state,{fleetSupplier:state.fleetSupplier||'',fleetGps:state.fleetGps||''});

  const baseFiltered=window.filteredFleetVehicles;
  window.filteredFleetVehicles=function(){
    let rows=baseFiltered();
    if(state.fleetSupplier==='own') rows=rows.filter(v=>v.source==='Own Fleet');
    else if(state.fleetSupplier) rows=rows.filter(v=>String(v.supplier_id||'')===String(state.fleetSupplier));
    if(state.fleetGps==='yes') rows=rows.filter(v=>!!v.gps_enabled);
    else if(state.fleetGps==='no') rows=rows.filter(v=>!v.gps_enabled);
    return rows;
  };

  const baseRenderFleet=window.renderFleet;
  window.renderFleet=function(){
    let html=baseRenderFleet();
    const supplierOptions=(state.suppliers||[]).filter(s=>s.active!==false).map(s=>`<option value="${esc(s.id)}" ${String(state.fleetSupplier)===String(s.id)?'selected':''}>${esc(s.name||s.company_name||s.supplier_name||'Supplier')}</option>`).join('');
    const controls=`<div class="field"><label>Company / Supplier</label><select id="fleetSupplier"><option value="">All Companies / Suppliers</option><option value="own" ${state.fleetSupplier==='own'?'selected':''}>Own Fleet</option>${supplierOptions}</select></div><div class="field"><label>GPS</label><select id="fleetGps"><option value="">All Vehicles</option><option value="yes" ${state.fleetGps==='yes'?'selected':''}>GPS Fitted</option><option value="no" ${state.fleetGps==='no'?'selected':''}>No GPS</option></select></div>`;
    html=html.replace('<div class="field"><label>Status</label>',controls+'<div class="field"><label>Status</label>');
    return html;
  };

  const baseBind=window.bindPageEvents;
  window.bindPageEvents=function(){
    baseBind.apply(this,arguments);
    const bind=(id,key)=>{const el=document.getElementById(id);if(el)el.onchange=()=>{state[key]=el.value;render();};};
    bind('fleetSupplier','fleetSupplier');bind('fleetGps','fleetGps');
    const clear=document.getElementById('clearFleetFilters');if(clear){const old=clear.onclick;clear.onclick=e=>{state.fleetSupplier='';state.fleetGps='';if(old)old.call(clear,e);};}
  };

  const baseRender=window.render;
  window.render=function(){
    const out=baseRender.apply(this,arguments);
    if(state.page==='actionlist')setTimeout(enhanceActionList,0);
    return out;
  };

  function enhanceActionList(){
    const body=document.getElementById('actionListBody');if(!body||body.dataset.v0922)return;body.dataset.v0922='1';
    const panel=body.closest('.panel'),head=panel?.querySelector('.panel-head');
    if(head&&!document.getElementById('addActionItemBtn')){const b=document.createElement('button');b.id='addActionItemBtn';b.className='btn btn-primary';b.type='button';b.textContent='+ Add New Action';b.onclick=openAddAction;head.appendChild(b);}
    body.querySelectorAll('.action-category').forEach((section,index)=>{
      const h=section.querySelector('h3');if(!h)return;const items=[...section.querySelectorAll('.action-item')],done=items.filter(x=>x.classList.contains('is-done')).length,cat=h.textContent.trim();
      const key='b5-action-open:'+cat;const open=localStorage.getItem(key)==='1';
      const toggle=document.createElement('button');toggle.type='button';toggle.className='action-category-toggle';toggle.innerHTML=`<span><strong>${escapeHtml(cat)}</strong><small>${done} of ${items.length} completed</small></span><span class="action-chevron">${open?'▾':'▸'}</span>`;
      h.replaceWith(toggle);items.forEach(x=>x.hidden=!open);toggle.onclick=()=>{const now=items[0]?.hidden!==false;items.forEach(x=>x.hidden=!now);toggle.querySelector('.action-chevron').textContent=now?'▾':'▸';localStorage.setItem(key,now?'1':'0');};
    });
  }
  function escapeHtml(v){return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));}
  async function openAddAction(){
    const {data,error}=await window.db.from('action_items').select('category').order('sort_order');if(error)return alert('Could not load Action List categories.');
    const cats=[...new Set((data||[]).map(x=>x.category).filter(Boolean))];
    const dlg=document.createElement('dialog');dlg.className='action-edit-dialog';dlg.innerHTML=`<form class="action-edit-card"><div class="modal-head"><div><h3>Add New Action</h3><div class="vehicle-meta">Add a new requirement to the working Action List.</div></div><button class="icon-btn" type="button" data-close>✕</button></div><div class="field"><label>Title</label><input name="title" maxlength="160" required></div><div class="field"><label>Description / Additional Notes</label><textarea name="notes" rows="7"></textarea></div><div class="field"><label>Category</label><select name="category" required>${cats.map(c=>`<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join('')}</select></div><div class="modal-actions"><button class="btn btn-secondary" type="button" data-cancel>Cancel</button><button class="btn btn-primary" type="submit">Add Action</button></div></form>`;document.body.appendChild(dlg);
    const close=()=>{dlg.close();dlg.remove();};dlg.querySelector('[data-close]').onclick=close;dlg.querySelector('[data-cancel]').onclick=close;dlg.addEventListener('cancel',e=>{e.preventDefault();close();});
    dlg.querySelector('form').onsubmit=async e=>{e.preventDefault();const f=e.currentTarget,title=f.title.value.trim(),notes=f.notes.value.trim(),category=f.category.value;if(!title||!category)return;const save=f.querySelector('[type=submit]');save.disabled=true;const {data:maxRows}=await window.db.from('action_items').select('sort_order').order('sort_order',{ascending:false}).limit(1);const sort=(Number(maxRows?.[0]?.sort_order)||0)+1;const key='custom-'+Date.now()+'-'+Math.random().toString(36).slice(2,7);const {data:created,error}=await window.db.from('action_items').insert({item_key:key,category,title,notes:notes||null,completed:false,sort_order:sort}).select().single();if(error){save.disabled=false;return alert('Could not add this action item.');}if(typeof window.logAudit==='function')await window.logAudit('action_item_created','action_item',created.id,{title,category,notes});localStorage.setItem('b5-action-open:'+category,'1');close();render();};dlg.showModal();
  }
})();