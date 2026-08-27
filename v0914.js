/* B5 v0.9.14 — customer filtering, GPS tracking, discount approvals, immutable contracts and monthly accounts */
(function(){
  window.B5_V0914=true;
  Object.assign(state,{discountRequests:state.discountRequests||[],contractAmendments:state.contractAmendments||[],monthlyReminderLog:state.monthlyReminderLog||[]});

  const oldNormalise=normaliseVehicle;
  normaliseVehicle=function(row){const v=oldNormalise(row);v.gps_enabled=!!row.gps_enabled;return v;};

  /* Add the two new flags to normal add forms without disturbing the existing form layout. */
  const baseOpenModal=openModal;
  openModal=function(title,body,onSave,saveText){
    if(title==='Add Vehicle'&&!body.includes('vGpsEnabled')) body+=`<div class="b5-inline-option"><label><input id="vGpsEnabled" type="checkbox"> GPS tracker fitted</label></div>`;
    if(title==='Add Customer'&&!body.includes('cMonthlyAccount')) body+=`<div class="b5-inline-option"><label><input id="cMonthlyAccount" type="checkbox"> Monthly account customer</label></div>`;
    return baseOpenModal(title,body,onSave,saveText);
  };

  saveVehicle=async function(){
    const make=$('#vMake').value.trim(),model=$('#vModel').value.trim(),plate=$('#vPlate').value.trim();
    if(!model||!plate){alert('Model and plate are required.');return false;}
    const source=$('#vSource').value;
    const payload={make,model,plate,colour:$('#vColor').value.trim()||null,category_id:$('#vCategory').value||null,standard_daily_rate:Number($('#vRate').value||0),source_type:source,supplier_id:source==='External'?($('#vSupplier').value||null):null,transmission:'Automatic',seats:5,operational_status:'Available',gps_enabled:!!$('#vGpsEnabled')?.checked};
    const {data,error}=await window.db.from('vehicles').insert(payload).select().single();if(error){alert(error.message);return false;}await logAudit('vehicle_created','vehicle',data?.id,{plate,make,model,gps_enabled:payload.gps_enabled});await loadSupabaseData();return true;
  };

  saveCustomer=async function(){
    const first=$('#cFirst').value.trim(),family=$('#cFamily').value.trim();if(!first){alert('First name is required.');return false;}const full=[first,family].filter(Boolean).join(' '),monthly=!!$('#cMonthlyAccount')?.checked;
    const {data,error}=await window.db.from('customers').insert({first_name:first,family_name:family||null,full_name:full,mobile:$('#cPhone').value.trim()||null,email:$('#cEmail').value.trim()||null,monthly_account:monthly,monthly_reminder_enabled:monthly}).select().single();if(error){alert(error.message);return false;}await logAudit('customer_created','customer',data?.id,{name:full,monthly_account:monthly});await loadSupabaseData();return true;
  };

  const oldLoad=loadSupabaseData;
  loadSupabaseData=async function(){
    await oldLoad();if(!state.live)return;
    try{
      if(isManager()) await window.db.rpc('ensure_monthly_account_reminders');
      const [d,a,m]=await Promise.all([
        window.db.from('discount_requests').select('*').order('created_at',{ascending:false}),
        window.db.from('contract_amendments').select('*').order('created_at',{ascending:false}),
        window.db.from('monthly_reminder_log').select('*').order('created_at',{ascending:false})
      ]);
      state.discountRequests=d.error?[]:(d.data||[]);state.contractAmendments=a.error?[]:(a.data||[]);state.monthlyReminderLog=m.error?[]:(m.data||[]);
    }catch(e){console.warn('v0.9.14 supplemental data unavailable',e);}
    render();
  };

  function customerText(c){return [c.first_name,c.family_name,c.full_name,c.mobile,c.secondary_phone,c.email,c.license_number,c.passport_number].filter(Boolean).join(' ').toLowerCase();}
  function customerBalance(c){try{return typeof customerOutstanding==='function'?customerOutstanding(c.id):0;}catch{return 0;}}
  function staffName(id){const p=state.staffProfiles?.find(x=>String(x.user_id)===String(id));return p?.display_name||p?.email||'a manager';}

  function openCustomerAccount(id){
    const c=customerById(id);if(!c)return;const rentals=state.rentals.filter(r=>String(r.customer_id)===String(id)).sort((a,b)=>new Date(b.start)-new Date(a.start)),balance=customerBalance(c);
    openModal(customerDisplayName(c),`<div class="customer-account-head"><div><strong>${esc(customerDisplayName(c))}</strong><div class="vehicle-meta">${esc(c.mobile||'No phone')} · ${esc(c.email||'No email')}</div></div>${c.monthly_account?'<span class="monthly-account-badge">MONTHLY ACCOUNT</span>':''}</div><div class="kpi-mini">${stat('Rentals',rentals.length,'Recorded')}${stat('Outstanding',money(balance),'Current balance')}</div>${isManager()?`<div class="b5-account-controls"><label class="b5-switch-line"><input type="checkbox" id="customerMonthlyToggle" ${c.monthly_account?'checked':''}> Monthly payment account</label>${c.monthly_account&&balance>0?`<button type="button" class="btn btn-primary" id="sendMonthlyReminderBtn">Prepare Email Reminder</button>`:''}</div>`:''}<div class="detail-tabs-section"><h3>Rental History</h3>${rentals.length?rentals.map(r=>`<button type="button" class="b5-history-row" data-open-rental="${esc(r.uuid)}"><strong>#${esc(r.id)}</strong><span>${fmtDate(r.start)} → ${fmtDate(r.end)}</span><span class="badge ${statusClass(r.status)}">${esc(r.status)}</span></button>`).join(''):'<div class="empty">No rental history.</div>'}</div>`,null,'Close');
    $('#modalForm').onsubmit=e=>{e.preventDefault();$('#modal').close();};
    $('#customerMonthlyToggle')?.addEventListener('change',async e=>{await setMonthlyAccount(id,e.target.checked);$('#modal').close();setTimeout(()=>openCustomerAccount(id),50);});
    $('#sendMonthlyReminderBtn')?.addEventListener('click',()=>sendMonthlyReminder(id,balance));
    $$('[data-open-rental]').forEach(b=>b.onclick=()=>{const rid=b.dataset.openRental;$('#modal').close();setTimeout(()=>{if(typeof rentalDetailModal==='function')rentalDetailModal(rid);},50);});
  }
  window.openCustomerAccount=openCustomerAccount;

  /* Customers: search is a true live filter over the displayed table; filtered rows remain selectable. */
  function enhanceCustomers(){
    if(state.page!=='customers')return;const content=$('#content'),table=content?.querySelector('table');if(!content||!table)return;
    const title=content.querySelector('.section-title');
    if(!$('#customerLiveSearch')){const box=document.createElement('div');box.className='b5-customer-search';box.innerHTML='<div class="field"><label>Search Customers</label><input id="customerLiveSearch" type="search" autocomplete="off" placeholder="Name, phone, email, licence or passport…"></div><div id="customerFilterCount" class="vehicle-meta"></div>';title?.insertAdjacentElement('afterend',box);}
    const rows=[...table.querySelectorAll('tbody tr')];rows.forEach((row,i)=>{const c=state.customers[i];if(!c)return;row.dataset.customerFilterId=c.id;row.classList.add('b5-selectable-row');row.tabIndex=0;row.title='Open customer';row.onclick=()=>openCustomerAccount(c.id);row.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();openCustomerAccount(c.id);}};});
    const input=$('#customerLiveSearch'),count=$('#customerFilterCount');
    const apply=()=>{const q=input.value.trim().toLowerCase();let shown=0;rows.forEach(row=>{const c=customerById(row.dataset.customerFilterId),show=!q||customerText(c||{}).includes(q);row.hidden=!show;if(show)shown++;});if(count)count.textContent=`${shown} of ${state.customers.length} customers shown`;};
    input.oninput=apply;apply();
  }

  function gpsDecorate(){
    if(state.page!=='fleet')return;
    $$('[data-vehicle-details]').forEach(card=>{const v=vehicleById(card.dataset.vehicleDetails);if(v?.gps_enabled&&!card.querySelector('.gps-badge'))card.querySelector('.kpi-row')?.insertAdjacentHTML('beforeend','<span class="gps-badge" title="GPS tracker fitted">GPS</span>');});
  }

  const oldVehicleDetails=openVehicleDetails;
  openVehicleDetails=function(id){
    oldVehicleDetails(id);const v=vehicleById(id),body=$('#modalBody');if(!v||!body)return;
    const section=body.querySelector('.rental-detail-section');if(section&&!section.querySelector('.gps-detail-control')){const control=document.createElement('div');control.className='gps-detail-control';control.innerHTML=`<label><input type="checkbox" id="vehicleGpsEnabled" ${v.gps_enabled?'checked':''}> GPS tracker fitted</label>`;section.appendChild(control);control.querySelector('input').onchange=async e=>{const enabled=e.target.checked,{error}=await window.db.from('vehicles').update({gps_enabled:enabled}).eq('id',id);if(error){e.target.checked=!enabled;return alert(error.message);}v.gps_enabled=enabled;await logAudit('vehicle_gps_updated','vehicle',id,{gps_enabled:enabled});};}
  };

  function decorateRentalCards(){
    if(state.page!=='rentals')return;
    $$('[data-rental-card]').forEach(card=>{
      const id=card.dataset.rentalCard,r=agreementByUuid(id);if(!r||card.querySelector('.v0914-rental-controls'))return;
      const pending=state.discountRequests.find(x=>String(x.rental_agreement_id)===String(id)&&x.status==='pending');
      const approved=state.discountRequests.find(x=>String(x.rental_agreement_id)===String(id)&&x.status==='approved');
      const amendments=state.contractAmendments.filter(x=>String(x.rental_agreement_id)===String(id));
      const finalised=r.status==='Completed';
      const wrap=document.createElement('div');wrap.className='v0914-rental-controls';
      if(finalised){wrap.innerHTML=`<span class="badge contract-locked-badge">FINAL CONTRACT · LOCKED</span>${isManager()?'<button type="button" class="btn btn-small btn-secondary" data-add-amendment>Add Manager Amendment</button>':''}${amendments.length?`<span class="vehicle-meta">${amendments.length} amendment${amendments.length===1?'':'s'} recorded separately</span>`:''}`;}
      else if(pending){wrap.innerHTML=`<span class="badge badge-demo">Discount ${money(pending.discount_value)} pending approval</span>${isManager()?'<button type="button" class="btn btn-small btn-primary" data-approve-discount>Approve Discount</button>':''}`;}
      else{wrap.innerHTML='<button type="button" class="btn btn-small btn-secondary" data-request-discount>Request Ad-hoc Discount</button>'+(approved?`<span class="badge badge-available">Discount approved by ${esc(staffName(approved.approved_by))}</span>`:'');}
      card.appendChild(wrap);
      wrap.querySelector('[data-request-discount]')?.addEventListener('click',e=>{e.stopPropagation();requestAdHocDiscount(id);});
      wrap.querySelector('[data-approve-discount]')?.addEventListener('click',e=>{e.stopPropagation();approveDiscountRequest(pending.id);});
      wrap.querySelector('[data-add-amendment]')?.addEventListener('click',e=>{e.stopPropagation();addContractAmendment(id);});
    });
  }

  function enhanceManagerApprovals(){
    if(state.page!=='manager'||!isManager())return;const content=$('#content');if(!content||$('#discountApprovalPanel'))return;
    const pending=state.discountRequests.filter(x=>x.status==='pending'),recent=state.discountRequests.filter(x=>x.status==='approved').slice(0,5);
    const panel=document.createElement('div');panel.id='discountApprovalPanel';panel.className='panel b5-approval-panel';panel.innerHTML=`<div class="panel-body"><div class="section-title"><div><h3>Discount Approvals</h3><p>${pending.length} pending request${pending.length===1?'':'s'}</p></div></div>${pending.length?pending.map(x=>{const r=agreementByUuid(x.rental_agreement_id);return `<div class="approval-request"><div><strong>Rental #${esc(r?.id||'')}</strong><div class="vehicle-meta">${esc(r?.customer||'')} · ${money(x.discount_value)} · ${esc(x.reason||'No reason supplied')}</div></div><button class="btn btn-primary btn-small" data-manager-approve="${esc(x.id)}">Approve</button></div>`;}).join(''):'<div class="empty">No discounts waiting for approval.</div>'}${recent.length?`<div class="approval-history"><strong>Recently approved</strong>${recent.map(x=>`<div class="vehicle-meta">${money(x.discount_value)} · Approved by ${esc(staffName(x.approved_by))}</div>`).join('')}</div>`:''}</div>`;
    content.prepend(panel);$$('[data-manager-approve]',panel).forEach(b=>b.onclick=()=>approveDiscountRequest(b.dataset.managerApprove));
  }

  const oldRender=render;
  render=function(){const r=oldRender.apply(this,arguments);setTimeout(()=>{enhanceCustomers();gpsDecorate();decorateRentalCards();enhanceManagerApprovals();},0);return r;};

  window.requestAdHocDiscount=async function(rentalId){
    if(state.discountRequests.some(x=>String(x.rental_agreement_id)===String(rentalId)&&x.status==='pending'))return alert('A discount request is already waiting for manager approval.');
    const rental=agreementByUuid(rentalId);if(!rental||rental.status==='Completed')return alert('Finalised contracts are locked. A manager can add a separate amendment instead.');
    const amount=prompt('Discount amount (USD)');if(amount===null)return;const value=Number(amount);if(!(value>0))return alert('Enter a valid discount amount.');const reason=prompt('Reason for discount');if(reason===null)return;const user=await currentAuthUser();
    const {error}=await window.db.from('discount_requests').insert({rental_agreement_id:rentalId,requested_by:user.id,discount_type:'amount',discount_value:value,reason:reason.trim()||null});if(error)return alert(error.message);await logAudit('discount_requested','rental',rentalId,{amount:value,reason});alert('Discount submitted for manager approval. It will not change the rental total until a manager approves it.');await loadSupabaseData();
  };

  window.approveDiscountRequest=async function(id){
    if(!isManager())return alert('Manager approval required.');const {data,error}=await window.db.rpc('approve_discount_request',{p_request_id:id});if(error)return alert(error.message);if(data?.already_approved)return alert(`This has already been approved by ${data.approved_by_name||'another manager'}.`);alert(`Discount approved by ${data?.approved_by_name||'manager'} and applied to the rental.`);await logAudit('discount_approved','discount_request',id,{});await loadSupabaseData();
  };

  window.addContractAmendment=async function(rentalId){
    if(!isManager())return alert('Only managers can add amendments to finalised contracts.');const r=agreementByUuid(rentalId);if(!r||r.status!=='Completed')return alert('Amendments are intended for finalised contracts.');const description=prompt('Describe the amendment or correction');if(!description?.trim())return;const raw=prompt('Financial adjustment in USD (optional; negative for a credit)','0');if(raw===null)return;const amount=raw.trim()===''?null:Number(raw);if(amount!==null&&!Number.isFinite(amount))return alert('Enter a valid amount.');const user=await currentAuthUser();const {error}=await window.db.from('contract_amendments').insert({rental_agreement_id:rentalId,amendment_type:'Manager Amendment',description:description.trim(),amount,created_by:user.id});if(error)return alert(error.message);await logAudit('contract_amendment_added','rental',rentalId,{description,amount});alert('Amendment recorded separately. The original finalised contract has not been changed.');await loadSupabaseData();
  };

  window.setMonthlyAccount=async function(customerId,enabled){
    if(!isManager())return alert('Manager access required.');const {error}=await window.db.from('customers').update({monthly_account:!!enabled,monthly_reminder_enabled:!!enabled}).eq('id',customerId);if(error)return alert(error.message);const c=customerById(customerId);if(c){c.monthly_account=!!enabled;c.monthly_reminder_enabled=!!enabled;}await logAudit('monthly_account_updated','customer',customerId,{enabled:!!enabled});render();
  };

  window.sendMonthlyReminder=async function(customerId,outstanding){
    if(!isManager())return alert('Manager access required.');const c=customerById(customerId);if(!c?.email)return alert('This customer has no email address.');if(!confirm(`Prepare an outstanding-balance email for ${c.email}?\n\nOutstanding: ${money(outstanding)}`))return;const user=await currentAuthUser();
    const {error}=await window.db.from('monthly_reminder_log').insert({customer_id:customerId,outstanding_balance:Number(outstanding||0),status:'prepared',sent_by:user.id,sent_at:new Date().toISOString()});if(error)return alert(error.message);await logAudit('monthly_reminder_prepared','customer',customerId,{outstanding:Number(outstanding||0)});
    window.location.href=`mailto:${encodeURIComponent(c.email)}?subject=${encodeURIComponent('All Season Car Rental — Outstanding Balance Reminder')}&body=${encodeURIComponent(`Dear ${customerDisplayName(c)},\n\nThis is a reminder that your current outstanding balance with All Season Car Rental is ${money(outstanding)}.\n\nPlease contact us if you have any questions.\n\nAll Season Car Rental`)}`;
  };
})();