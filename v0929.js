/* B5 v0.9.29 — temporary Client Testing page */
(()=>{
  pageMeta.clienttesting=['Client Testing','Operational acceptance checklist'];
  state.clientTestingResults=[];state.clientTestingLoaded=false;
  const sections={
    'Login & General':[[1,'Login & Sign Out'],[2,'Main Navigation'],[3,'Overall Appearance'],[4,'Mobile/Tablet Display']],
    'Dashboard & Daily Operations':[[5,'Dashboard'],[6,'Today Page'],[7,'Quick Actions']],
    'Customers':[[8,'Customer List & Search'],[9,'Add Customer'],[10,'Edit Customer'],[11,'Customer Profile'],[12,'Monthly Customer Settings'],[13,'Birthday Message']],
    'Availability & Rentals':[[14,'Check Availability'],[15,'Create New Rental'],[16,'Rental Details'],[17,'Edit Rental'],[18,'Extend Rental'],[19,'Vehicle Change/Swap'],[20,'Rental Return/Completion'],[21,'Rental Search']],
    'Contracts':[[22,'Rental Contract'],[23,'Contract Signing'],[24,'Finalised Contracts']],
    'Payments & Finance':[[25,'Record Payment'],[26,'Card Payment & Surcharge'],[27,'Outstanding Balance'],[28,'Customer Balance'],[29,'Refund/Payment Adjustment'],[30,'Cash Transactions'],[31,'Business Expenses']],
    'Calendar':[[32,'Rental Calendar'],[33,'Calendar Filters'],[34,'Calendar Updates']],
    'Fleet':[[35,'Fleet Page'],[36,'Fleet Search, Sort & Filters'],[37,'Add Vehicle'],[38,'Edit Vehicle'],[39,'Vehicle Details'],[40,'GPS Vehicles'],[41,'Vehicle Maintenance'],[42,'Vehicle Expenses'],[43,'Vehicle Status']],
    'Fleet Sales':[[44,'Fleet Sales Page'],[45,'Put Vehicle Up For Sale'],[46,'Record Vehicle Sale'],[47,'Sold Vehicle History']],
    'Suppliers':[[48,'Supplier List'],[49,'Add/Edit Supplier'],[50,'Supplier Types'],[51,'Supplier History'],[52,'Supplier Products/Services']],
    'Locations, Fees & Promotions':[[53,'Locations'],[54,'Location Fees'],[55,'Promo Codes']],
    'Reports':[[56,'Vehicle Reports'],[57,'Business Reports'],[58,'Future Income'],[59,'Cash Flow Report']],
    'Staff & Management':[[60,'Staff/User Accounts'],[61,'Manager Access'],[62,'User Passwords'],[63,'Discount Approval'],[64,'Manager Action List'],[65,'Staff/Group Chat']],
    'Notifications & Communications':[[66,'App Notifications'],[67,'Customer Communication Links']],
    'Settings & Final Review':[[68,'Settings'],[69,'Payment Settings'],[70,'Data Accuracy'],[71,'General Usability'],[72,'Final Appearance Review'],[73,'Final Client Approval']]
  };
  const statusMeta={not_tested:['Not Tested','○'],passed:['Passed','✓'],needs_fixing:['Needs Fixing','!'],retest_required:['Retest Required','↻']};
  const uid=()=>String(state.userProfile?.user_id||'');
  const displayName=id=>{const p=(state.staffProfiles||[]).find(x=>String(x.user_id)===String(id));return p?.display_name||p?.email||String(id).slice(0,8);};
  async function loadTesting(){
    if(!window.db)return;const {data,error}=await window.db.from('client_testing_results').select('*');state.clientTestingResults=error?[]:(data||[]);state.clientTestingLoaded=true;if(state.page==='clienttesting')render();
  }
  function resultFor(n,user=uid()){return state.clientTestingResults.find(x=>x.test_number===n&&String(x.user_id)===String(user));}
  function namesFor(n,status){return state.clientTestingResults.filter(x=>x.test_number===n&&x.status===status).map(x=>displayName(x.user_id));}
  function summary(){const answered=new Set(state.clientTestingResults.filter(x=>x.status!=='not_tested').map(x=>x.test_number)).size;const c={passed:0,needs_fixing:0,retest_required:0};state.clientTestingResults.forEach(x=>{if(c[x.status]!==undefined)c[x.status]++;});return {answered,...c};}
  function bubbles(n){return Object.entries(statusMeta).map(([k,[label,symbol]])=>{const names=namesFor(n,k),title=names.length?`${label}: ${names.join(', ')}`:`${label}: nobody`;return `<button type="button" class="ct-bubble ct-${k}" data-show-testers="${n}|${k}" title="${esc(title)}"><span>${symbol}</span> ${label} <b>${names.length}</b></button>`;}).join('');}
  function renderTesting(){
    if(!state.clientTestingLoaded){loadTesting();return '<div class="panel"><div class="panel-body">Loading testing checklist…</div></div>';}
    const s=summary();return `<div class="section-title"><div><h2>Client Testing</h2><p>Tick off each operational area. Your name is recorded automatically.</p></div></div>
    <div class="panel"><div class="panel-body"><div class="kpi-mini">${stat('Items Tested',`${s.answered}/73`,'At least one tester')}${stat('Passed',s.passed,'Tester responses')}${stat('Needs Fixing',s.needs_fixing,'Tester responses')}${stat('Retest',s.retest_required,'Tester responses')}</div></div></div>
    ${Object.entries(sections).map(([section,items])=>`<div class="panel" style="margin-top:14px"><div class="panel-head"><h3>${esc(section)}</h3></div><div class="panel-body">${items.map(([n,title])=>{const mine=resultFor(n)||{status:'not_tested',comment:''};return `<div class="ct-item"><div class="ct-main"><strong>${n}. ${esc(title)}</strong>${mine.comment?`<div class="vehicle-meta">My comment: ${esc(mine.comment)}</div>`:''}</div><div class="ct-bubbles">${bubbles(n)}</div><div class="ct-actions">${Object.entries(statusMeta).map(([k,[label]])=>`<button type="button" class="btn btn-small ${mine.status===k?'btn-primary':'btn-secondary'}" data-set-test="${n}|${k}">${label}</button>`).join('')}</div></div>`;}).join('')}</div></div>`).join('')}`;
  }
  async function setStatus(n,status){
    let comment=resultFor(n)?.comment||'';
    if(status==='needs_fixing'){comment=prompt(`Item ${n} — describe what needs fixing:`,comment||'')||'';if(!comment.trim())return alert('A comment is required when marking Needs Fixing.');}
    if(status!=='needs_fixing'&&status!=='retest_required')comment='';
    const payload={test_number:n,user_id:uid(),status,comment:comment||null,updated_at:new Date().toISOString()};
    const {error}=await window.db.from('client_testing_results').upsert(payload,{onConflict:'test_number,user_id'});if(error)return alert(error.message);
    await window.db.from('client_testing_history').insert({test_number:n,user_id:uid(),status,comment:comment||null});
    await loadTesting();
  }
  function bindTesting(){
    $$('[data-set-test]').forEach(b=>b.onclick=()=>{const [n,s]=b.dataset.setTest.split('|');setStatus(Number(n),s);});
    $$('[data-show-testers]').forEach(b=>b.onclick=()=>{const [n,s]=b.dataset.showTesters.split('|'),names=namesFor(Number(n),s),label=statusMeta[s][0];alert(`${label}\n\n${names.length?names.join('\n'):'Nobody has selected this status yet.'}`);});
  }
  const style=document.createElement('style');style.textContent=`.ct-item{display:grid;grid-template-columns:minmax(220px,1fr) auto;gap:10px;padding:12px 0;border-bottom:1px solid var(--border,#ddd)}.ct-item:last-child{border-bottom:0}.ct-actions{grid-column:1/-1;display:flex;gap:6px;flex-wrap:wrap}.ct-bubbles{display:flex;gap:6px;flex-wrap:wrap;justify-content:flex-end}.ct-bubble{border:1px solid var(--border,#ccc);background:transparent;border-radius:999px;padding:5px 8px;font:inherit;font-size:12px;cursor:pointer}.ct-bubble b{margin-left:3px}.ct-needs_fixing b{font-weight:800}.ct-main{min-width:0}@media(max-width:700px){.ct-item{grid-template-columns:1fr}.ct-bubbles{justify-content:flex-start}.ct-actions{grid-column:1}}`;document.head.appendChild(style);
  const prevRender=render;
  render=function(){
    if(state.page!=='clienttesting')return prevRender.apply(this,arguments);
    const m=pageMeta.clienttesting;$('#pageTitle').textContent=m[0];$('#pageSubtitle').textContent=m[1];$('#content').innerHTML=renderTesting();$$('.nav-btn').forEach(b=>b.classList.toggle('active',b.dataset.page==='clienttesting'));bindTesting();return $('#content').innerHTML;
  };
})();