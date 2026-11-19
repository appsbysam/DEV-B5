/* B5 v0.9.29 — temporary Client Testing page */
(()=>{
  pageMeta.clienttesting=['Client Testing','Operational acceptance checklist'];
  state.clientTestingResults=[];
  state.clientTestingLoaded=false;

  const sections={
    'Login & General':[
      [1,'Login & Sign Out','Check normal login, logout and general access.'],
      [2,'Main Navigation','Open the main pages and confirm navigation feels clear and reliable.'],
      [3,'Overall Appearance','Check logos, colours, text, buttons, spacing and general presentation.'],
      [4,'Mobile/Tablet Display','Check the app on the devices normally used by the business.']
    ],
    'Dashboard & Daily Operations':[
      [5,'Dashboard','Check dashboard figures, alerts and shortcuts are useful and correct.'],
      [6,'Today Page','Check today’s pickups, returns and daily information.'],
      [7,'Quick Actions','Test the main shortcuts such as New Rental and Check Availability.']
    ],
    'Customers':[
      [8,'Customer List & Search','Check the customer list and customer search function.'],
      [9,'Add Customer','Create a test customer and save the required details.'],
      [10,'Edit Customer','Edit a customer and confirm the changes save correctly.'],
      [11,'Customer Profile','Check customer details, rental history, current rentals and balances.'],
      [12,'Monthly Customer Settings','Test Monthly Account and monthly balance-reminder options.'],
      [13,'Birthday Message','Test the birthday-message option and date-of-birth requirement.']
    ],
    'Availability & Rentals':[
      [14,'Check Availability','Search different dates and confirm the correct vehicles and prices appear.'],
      [15,'Create New Rental','Complete a new rental from beginning to end.'],
      [16,'Rental Details','Open a rental and check customer, vehicle, dates, locations, charges and payments.'],
      [17,'Edit Rental','Make permitted changes to an active rental and confirm they save.'],
      [18,'Extend Rental','Extend an active rental and check dates, availability and charges.'],
      [19,'Vehicle Change/Swap','Change vehicles during a rental and confirm the history remains correct.'],
      [20,'Rental Return/Completion','Complete a rental and confirm the rental and vehicle statuses update.'],
      [21,'Rental Search','Check the rental search and filtering functions.']
    ],
    'Contracts':[
      [22,'Rental Contract','Open or generate a rental contract and check its information.'],
      [23,'Contract Signing','Test the electronic contract-signing process.'],
      [24,'Finalised Contracts','Check finalised contracts are protected from normal editing.']
    ],
    'Payments & Finance':[
      [25,'Record Payment','Record test payments using the available payment methods.'],
      [26,'Card Payment & Surcharge','Test card payment, the 5% surcharge and the option to remove it.'],
      [27,'Outstanding Balance','Part-pay a rental and confirm the remaining balance is retained.'],
      [28,'Customer Balance','Check customer balances continue to display correctly over time.'],
      [29,'Refund/Payment Adjustment','Test the available refund or payment-adjustment process.'],
      [30,'Cash Transactions','Test manual incoming and outgoing cash entries.'],
      [31,'Business Expenses','Enter and review a manual business expense.']
    ],
    'Calendar':[
      [32,'Rental Calendar','Check rentals appear against the correct vehicles and dates.'],
      [33,'Calendar Filters','Test the available calendar filtering options.'],
      [34,'Calendar Updates','Change rental/customer information and confirm the calendar updates.']
    ],
    'Fleet':[
      [35,'Fleet Page','Review the fleet page and confirm vehicle information is clear and correct.'],
      [36,'Fleet Search, Sort & Filters','Test the available fleet sorting and filtering options.'],
      [37,'Add Vehicle','Add a test vehicle and check the relevant information can be saved.'],
      [38,'Edit Vehicle','Edit a vehicle and confirm the changes save correctly.'],
      [39,'Vehicle Details','Check a vehicle’s rental, financial, maintenance and supplier history.'],
      [40,'GPS Vehicles','Check GPS vehicles are identified and can be filtered correctly.'],
      [41,'Vehicle Maintenance','Add or review servicing and maintenance information.'],
      [42,'Vehicle Expenses','Add or review an expense against a vehicle.'],
      [43,'Vehicle Status','Test the appropriate active, retired, for-sale and other status controls.']
    ],
    'Fleet Sales':[
      [44,'Fleet Sales Page','Check For Sale and Sold/History vehicles display correctly.'],
      [45,'Put Vehicle Up For Sale','Move a test vehicle into For Sale and check rental availability changes.'],
      [46,'Record Vehicle Sale','Record purchaser, sale price, date, odometer and notes.'],
      [47,'Sold Vehicle History','Confirm sold vehicles retain their previous operational history.']
    ],
    'Suppliers':[
      [48,'Supplier List','Check the supplier list and supplier information.'],
      [49,'Add/Edit Supplier','Create and edit a supplier and confirm the information saves.'],
      [50,'Supplier Types','Test the different supplier types used by the business.'],
      [51,'Supplier History','Check cars supplied and supplier history.'],
      [52,'Supplier Products/Services','Add a product or service and confirm it appears in supplier history.']
    ],
    'Locations, Fees & Promotions':[
      [53,'Locations','Add or edit a pickup/drop-off location and confirm it becomes available.'],
      [54,'Location Fees','Test a location fee and confirm the correct charge is applied.'],
      [55,'Promo Codes','Test percentage and free-day promo codes.']
    ],
    'Reports':[
      [56,'Vehicle Reports','Check individual vehicle income, expenses and net figures.'],
      [57,'Business Reports','Check overall business income, expenses and net figures.'],
      [58,'Future Income','Test the 7-day, next-month and custom future-income reports.'],
      [59,'Cash Flow Report','Review the cash-flow figures against known transactions.']
    ],
    'Staff & Management':[
      [60,'Staff/User Accounts','Check staff accounts, roles and normal user access.'],
      [61,'Manager Access','Check manager-only areas and controls.'],
      [62,'User Passwords','Test manager password reset and user password change.'],
      [63,'Discount Approval','Test a discount that requires manager approval.'],
      [64,'Manager Action List','Check the Action List and its completed/incomplete items.'],
      [65,'Staff/Group Chat','Test sending and receiving internal staff messages.']
    ],
    'Notifications & Communications':[
      [66,'App Notifications','Check operational notifications and alerts currently enabled.'],
      [67,'Customer Communication Links','Test available Email, SMS and WhatsApp customer actions.']
    ],
    'Settings & Final Review':[
      [68,'Settings','Review and test settings relevant to normal operation.'],
      [69,'Payment Settings','Check accepted payment methods and card-surcharge settings.'],
      [70,'Data Accuracy','Use realistic test data and check it stays consistent across the app.'],
      [71,'General Usability','Use B5 as during a normal workday and note anything confusing or slow.'],
      [72,'Final Appearance Review','Review the main pages for visual inconsistencies or readability issues.'],
      [73,'Final Client Approval','Confirm B5 is satisfactory for normal business use after fixes are complete.']
    ]
  };

  // Phase 2: guided acceptance steps. Each tester's progress is saved in Supabase.
  const guidedSteps={
    1:["Sign in with staff account","Confirm user identity","Sign out","Sign in again"],
    2:["Open dashboard","Navigate to Customers","Navigate to Fleet and Rentals","Verify pages load"],
    3:["Check logos and headings","Check text and buttons","Check spacing and layout","Record problems"],
    4:["Open on phone or tablet","Navigate main pages","Check form layout","Try a safe test entry"],
    5:["Open Dashboard","Verify imported customer and vehicle counts","Review alerts","Try shortcuts"],
    6:["Open Today","Review pickups","Review returns","Note if no test records exist yet"],
    7:["Open Quick Actions","Try New Rental","Try Check Availability","Verify destinations"],
    8:["Open Customers","Verify nine imported customers","Search by name","Search by phone","Open matching profile"],
    9:["Open Add Customer","Enter fictional test details","Save customer","Search for saved customer","Check required fields"],
    10:["Open fictional test customer","Edit notes or phone","Save","Reopen and verify"],
    11:["Open customer profile","Verify name and phone","Review rental history","Review balances","Note any untestable empty sections"],
    12:["Open fictional customer","Find monthly settings","Change a setting","Save and reopen","Check saved value"],
    13:["Open fictional customer","Find birthday setting","Check birth date requirement","Enter fictional date","Save and reopen"],
    14:['Open Check Availability','Choose pickup and return dates','Confirm available vehicles match the dates','Check displayed prices and category filters','Try dates that overlap an existing rental'],
    15:['Open New Rental','Select an existing imported customer','Select an available imported vehicle','Enter pickup and return dates and locations','Check the sample daily rate and calculated total','Save the rental without finalising the contract','Reopen it and verify the saved details','Check that the vehicle is no longer offered for overlapping dates'],
    16:['Open the saved rental','Verify customer and vehicle details','Verify pickup, return and location information','Check charges and payment summary'],
    17:['Open an active, non-finalised rental','Change an allowed field','Save and reopen the rental','Confirm the change appears in the calendar and totals where relevant'],
    18:['Open an active rental','Extend the return date','Check for conflicting vehicle bookings','Verify updated charges','Save and confirm the new date'],
    19:['Open an active rental','Select a replacement available vehicle','Save the vehicle swap','Check that the original and replacement vehicle history is correct','Verify availability of both vehicles'],
    20:['Open an active rental due for return','Record the return details','Check any final charges','Complete the rental','Verify the rental status and vehicle availability'],
    21:['Search for an imported customer or rental','Try status and date filters','Open a matching result','Confirm the correct rental is displayed']
  };
  const phase2Ids=[14,15,16,17,18,19,20,21];
  const phase1Ids=Array.from({length:13},(_,i)=>i+1);
  const completedFor=n=>{const v=resultFor(n)?.completed_steps;return Array.isArray(v)?v:[];};
  const progressFor=n=>guidedSteps[n]?completedFor(n).length+'/'+guidedSteps[n].length:'';
  function guidedChecklist(n){
    if(!guidedSteps[n])return '';
    const done=completedFor(n);
    return `<div class="ct-guide"><div class="ct-guide-title">Step-by-step checklist <span>${done.length}/${guidedSteps[n].length}</span></div>
      ${guidedSteps[n].map((step,i)=>`<label class="ct-step"><input type="checkbox" data-ct-step="${n}|${i}" ${done.includes(i)?'checked':''}><span>${i+1}. ${esc(step)}</span></label>`).join('')}
      <div class="vehicle-meta">Tick each step as you complete it. Progress saves to your staff account. Mark Passed only after verifying the outcome; use Needs Fixing to report a problem.</div></div>`;
  }
  async function setStep(n,i,checked){
    if(!uid())return alert('Please sign in again.');
    const old=resultFor(n);
    const done=new Set(completedFor(n));
    if(checked)done.add(i);else done.delete(i);
    const payload={test_number:n,user_id:uid(),tester_name:myName(),status:old?.status||'not_tested',comment:old?.comment||null,completed_steps:[...done].sort((a,b)=>a-b),updated_at:new Date().toISOString()};
    const {error}=await window.db.from('client_testing_results').upsert(payload,{onConflict:'test_number,user_id'});
    if(error)return alert('Could not save checklist step: '+error.message);
    await loadTesting();
    recordTestingActivity('step_changed',n);
  }

  const statusMeta={
    not_tested:['Not Tested','○'],
    passed:['Passed','✓'],
    needs_fixing:['Needs Fixing','!'],
    retest_required:['Retest Required','↻']
  };

  const uid=()=>String(state.userProfile?.user_id||'');
  const myName=()=>String(state.userProfile?.display_name||state.userProfile?.email||'Tester');
  const resultFor=(n,user=uid())=>state.clientTestingResults.find(x=>Number(x.test_number)===Number(n)&&String(x.user_id)===String(user));
  const displayName=r=>r.tester_name||((state.staffProfiles||[]).find(x=>String(x.user_id)===String(r.user_id))?.display_name)||String(r.user_id).slice(0,8);
  const resultsFor=(n,status)=>state.clientTestingResults.filter(x=>Number(x.test_number)===Number(n)&&x.status===status);
  const fmtWhen=v=>{if(!v)return '';try{return new Date(v).toLocaleString();}catch{return '';}};

  async function loadTesting(){
    if(!window.db)return;
    const {data,error}=await window.db.from('client_testing_results').select('*').order('test_number',{ascending:true});
    state.clientTestingResults=error?[]:(data||[]);
    state.clientTestingLoaded=true;
    if(state.page==='clienttesting')render();
  }

  function statusDetails(n,status){
    const rows=resultsFor(n,status),label=statusMeta[status][0];
    if(!rows.length)return `${label}: nobody`;
    return `${label}: ${rows.map(r=>`${displayName(r)}${r.comment?` — ${r.comment}`:''}`).join(' | ')}`;
  }

  function bubbles(n){
    return Object.entries(statusMeta).map(([key,[label,symbol]])=>{
      const rows=resultsFor(n,key);
      return `<button type="button" class="ct-bubble ct-${key} ${resultFor(n)?.status===key?'ct-selected':''}" data-set-test="${n}|${key}" title="${esc(statusDetails(n,key))}"><span>${symbol}</span> ${label} <b>${rows.length}</b></button>`;
    }).join('');
  }

  function summary(){
    const tested=new Set(state.clientTestingResults.filter(x=>x.status!=='not_tested').map(x=>Number(x.test_number))).size;
    const counts={passed:0,needs_fixing:0,retest_required:0};
    state.clientTestingResults.forEach(x=>{if(Object.prototype.hasOwnProperty.call(counts,x.status))counts[x.status]++;});
    return {tested,...counts};
  }

  function renderTesting(){
    if(!state.clientTestingLoaded){loadTesting();return '<div class="panel"><div class="panel-body">Loading testing checklist…</div></div>';}
    const s=summary();
    return `<div class="section-title"><div><h2>Client Testing</h2><p>Choose your result for each item. B5 records your name automatically.</p></div></div>\n      <div class="panel"><div class="panel-body"><h3>Phase 1 — General &amp; Customers</h3><p>Complete tests 1–13 below using the guided checklists.</p><p><strong>Phase 1 progress:</strong> ${phase1Ids.filter(n=>resultFor(n)?.status==="passed").length}/13 passed by you.</p></div></div>
      <div class="panel"><div class="panel-body"><h3>Phase 2 — Reservations &amp; Rentals</h3><p>Start with tests 14–21 under Availability &amp; Rentals. Tick each action as you perform it, then select Passed, Needs Fixing or Retest Required. Your checklist and results save to your staff login. The original 73 tests remain below.</p><p><strong>Phase 2 progress:</strong> ${phase2Ids.filter(n=>resultFor(n)?.status==='passed').length}/8 tests passed by you.</p></div></div>
      <div class="panel"><div class="panel-body"><div class="kpi-mini">
        ${stat('Items Tested',`${s.tested}/73`,'At least one tester')}
        ${stat('Passed',s.passed,'Tester results')}
        ${stat('Needs Fixing',s.needs_fixing,'Tester results')}
        ${stat('Retest',s.retest_required,'Tester results')}
      </div></div></div>
      ${Object.entries(sections).map(([section,items])=>`<div class="panel" style="margin-top:14px"><div class="panel-head"><h3>${esc(section)}</h3></div><div class="panel-body">
        ${items.map(([n,title,description])=>{
          const mine=resultFor(n)||{status:'not_tested',comment:''};
          return `<div class="ct-item">
            <div class="ct-main"><strong>${n}. ${esc(title)}</strong><div class="vehicle-meta">${esc(description)}</div>${mine.comment?`<div class="ct-my-comment">My comment: ${esc(mine.comment)}</div>`:''}${guidedChecklist(n)}</div>
            <div class="ct-bubbles">${bubbles(n)}</div>
            
          </div>`;
        }).join('')}
      </div></div>`).join('')}`;
  }

  async function setStatus(n,status){
    if(!uid())return alert('Your signed-in user could not be identified. Please sign in again.');
    let comment=resultFor(n)?.comment||'';
    if(status==='needs_fixing'){
      comment=prompt(`Item ${n} — briefly describe what needs fixing:`,comment||'')||'';
      if(!comment.trim())return alert('A comment is required when marking Needs Fixing.');
    }
    if(status==='passed'||status==='not_tested')comment='';
    if(status==='passed'&&guidedSteps[n]&&completedFor(n).length!==guidedSteps[n].length)return alert('Complete every checklist step before marking this test Passed.');
    const payload={test_number:n,user_id:uid(),tester_name:myName(),status,comment:comment||null,completed_steps:completedFor(n),updated_at:new Date().toISOString()};
    const {error}=await window.db.from('client_testing_results').upsert(payload,{onConflict:'test_number,user_id'});
    if(error)return alert(`Could not save this test result. ${error.message}`);
    const {error:historyError}=await window.db.from('client_testing_history').insert({test_number:n,user_id:uid(),tester_name:myName(),status,comment:comment||null});
    if(historyError)console.warn('Testing history could not be recorded',historyError);
    await loadTesting();
    recordTestingActivity('status_changed',n);
  }

  function bindTesting(){
    $$('[data-ct-step]').forEach(b=>b.onchange=()=>{const [n,i]=b.dataset.ctStep.split('|').map(Number);setStep(n,i,b.checked);});
    $$('[data-set-test]').forEach(b=>b.onclick=()=>{const [n,status]=b.dataset.setTest.split('|');setStatus(Number(n),status);});

  }

  const style=document.createElement('style');
  style.textContent=`
    .ct-bubble.ct-selected{outline:2px solid #147ac6;outline-offset:2px;font-weight:700}.ct-guide{margin-top:12px;padding:12px;border:1px solid var(--border,#ddd);border-radius:10px}.ct-guide-title{font-weight:700;display:flex;justify-content:space-between;margin-bottom:8px}.ct-step{display:flex;align-items:flex-start;gap:9px;padding:6px 0;font-size:13px;cursor:pointer}.ct-step input{margin-top:3px;flex-shrink:0}\n    .ct-item{display:grid;grid-template-columns:minmax(240px,1fr) auto;gap:10px;padding:14px 0;border-bottom:1px solid var(--border,#ddd)}
    .ct-item:last-child{border-bottom:0}.ct-main{min-width:0}.ct-my-comment{margin-top:6px;font-size:13px;font-weight:600}
    .ct-actions{grid-column:1/-1;display:flex;gap:6px;flex-wrap:wrap}.ct-bubbles{display:flex;gap:6px;flex-wrap:wrap;justify-content:flex-end;align-items:flex-start}
    .ct-bubble{border:1px solid var(--border,#ccc);background:transparent;border-radius:999px;padding:5px 8px;font:inherit;font-size:12px;cursor:pointer;white-space:nowrap}.ct-bubble b{margin-left:3px}.ct-needs_fixing b{font-weight:800}
    @media(max-width:700px){.ct-item{grid-template-columns:1fr}.ct-bubbles{justify-content:flex-start}.ct-actions{grid-column:1}}
  `;
  document.head.appendChild(style);


  // Manager-only activity reporting; the database enforces the same restriction via RLS.
  state.testingActivity=[];
  state.testingActivityLoaded=false;
  async function recordTestingActivity(type,testNumber=null){
    if(!uid()||!window.db)return;
    const {error}=await window.db.from('client_testing_activity').insert({user_id:uid(),activity_type:type,test_number:testNumber});
    if(error)console.warn('Testing activity could not be recorded',error.message);
  }
  async function loadManagerTestingActivity(){
    if(!isManager()||!window.db)return;
    state.testingActivityLoaded=false;
    const [activity,results]=await Promise.all([
      window.db.from('client_testing_activity').select('*').order('created_at',{ascending:false}).limit(3000),
      window.db.from('client_testing_results').select('user_id,test_number,status,updated_at')
    ]);
    state.testingActivity=activity.error?[]:(activity.data||[]);
    state.testingManagerResults=results.error?[]:(results.data||[]);
    state.testingActivityError=activity.error?.message||results.error?.message||'';
    state.testingActivityLoaded=true;
    if(state.page==='manager'&&state.managerView==='testing')render();
  }
  function renderManagerTesting(){
    if(!isManager())return '<div class="alert">Manager access required.</div>';
    const activities=state.testingActivity||[];
    const results=state.testingManagerResults||[];
    const profiles=state.staffProfiles||[];
    const ids=[...new Set([...profiles.map(p=>p.user_id),...activities.map(a=>a.user_id),...results.map(r=>r.user_id)])];
    const fmt=d=>d?new Date(d).toLocaleString():'—';
    return `<div class="section-title"><div><h2>Testing Activity</h2><p>Manager-only staff testing overview</p></div><button class="btn btn-secondary" id="testingBack">Back to Manager Mode</button></div>
      <div class="panel"><div class="panel-body"><button class="btn btn-secondary" id="testingRefresh">Refresh Activity</button>
      ${state.testingActivityError?`<p class="alert">${esc(state.testingActivityError)}</p>`:''}
      <p class="vehicle-meta">Sessions count each time Client Testing is opened from the menu, not time spent testing. Only activity since this feature was enabled is counted.</p>
      <div class="table-wrap"><table><thead><tr><th>Staff member</th><th>Testing opens</th><th>Last activity</th><th>Passed</th><th>Needs fixing</th><th>Retest</th><th>Steps checked</th></tr></thead><tbody>
      ${ids.map(id=>{const profile=profiles.find(p=>p.user_id===id)||{},a=activities.filter(x=>x.user_id===id),r=results.filter(x=>x.user_id===id);return `<tr><td>${esc(profile.display_name||profile.email||String(id).slice(0,8))}</td><td>${a.filter(x=>x.activity_type==='opened').length}</td><td>${fmt(a[0]?.created_at||r.sort((x,y)=>String(y.updated_at).localeCompare(String(x.updated_at)))[0]?.updated_at)}</td><td>${r.filter(x=>x.status==='passed').length}</td><td>${r.filter(x=>x.status==='needs_fixing').length}</td><td>${r.filter(x=>x.status==='retest_required').length}</td><td>${a.filter(x=>x.activity_type==='step_changed').length} actions</td></tr>`}).join('')}
      </tbody></table></div></div></div>`;
  }

  const previousRender=render;
  render=function(){
    if(state.page==='manager'&&isManager()&&state.managerView==='testing'){
      $('#pageTitle').textContent='Testing Activity';
      $('#pageSubtitle').textContent='Manager-only staff testing overview';
      $('#content').innerHTML=renderManagerTesting();
      $('#testingBack')?.addEventListener('click',()=>{state.managerView='activity';render();});
      $('#testingRefresh')?.addEventListener('click',loadManagerTestingActivity);
      return $('#content').innerHTML;
    }
    if(state.page==='manager'&&isManager()){
      const output=previousRender.apply(this,arguments);
      const tiles=document.querySelector('.manager-dashboard');
      if(tiles&&!tiles.querySelector('#testingActivityTile')){
        const btn=document.createElement('button');btn.type='button';btn.id='testingActivityTile';btn.className='manager-tile';
        btn.innerHTML='<div class="manager-tile-label">Testing Activity</div><div class="manager-tile-value">Staff</div><div class="manager-tile-sub">Testing sessions and results · managers only</div>';
        btn.onclick=()=>{state.managerView='testing';render();loadManagerTestingActivity();};
        tiles.appendChild(btn);
      }
      return output;
    }
    if(state.page!=='clienttesting')return previousRender.apply(this,arguments);
    const meta=pageMeta.clienttesting;
    $('#pageTitle').textContent=meta[0];
    $('#pageSubtitle').textContent=meta[1];
    $('#content').innerHTML=renderTesting();
    $$('.nav-btn').forEach(b=>b.classList.toggle('active',b.dataset.page==='clienttesting'));
    bindTesting();
    return $('#content').innerHTML;
  };

  const addTestingNav=()=>{
    const nav=document.getElementById('nav');
    if(!nav||document.querySelector('[data-page="clienttesting"]'))return;
    const btn=document.createElement('button');
    btn.type='button';
    btn.dataset.page='clienttesting';
    btn.className='nav-btn';
    btn.textContent='Client Testing';
    nav.insertBefore(btn,document.getElementById('managerNav')||null);
    btn.addEventListener('click',()=>{
      state.page='clienttesting';
      recordTestingActivity('opened');
      render();
      if(typeof closeSidebar==='function')closeSidebar();
    });
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',addTestingNav,{once:true});else addTestingNav();
})();