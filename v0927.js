/* B5 v0.9.27 — Monthly customer reminders + calendar filtering */
(()=>{
  Object.assign(state,{calendarCustomer:state.calendarCustomer||'',calendarMake:state.calendarMake||''});
  const reminderMethods=[
    ['email','Automatic Email'],['sms','Automatic SMS'],['email_sms','Automatic Email + SMS'],['manual','Manager Review / Manual Send'],['whatsapp','Automatic WhatsApp']
  ];
  const customerPhone=c=>String(c?.mobile||c?.phone||c?.secondary_phone||'').trim();
  const customerEmail=c=>String(c?.email||'').trim();
  const methodLabel=k=>reminderMethods.find(x=>x[0]===k)?.[1]||'Manager Review / Manual Send';
  const balanceFor=c=>{try{return Number(customerOutstanding(c.id)||0);}catch{return 0;}};

  const baseFilteredCalendarVehicles=filteredCalendarVehicles;
  filteredCalendarVehicles=function(){
    let rows=baseFilteredCalendarVehicles();
    if(state.calendarMake) rows=rows.filter(v=>String(v.make||'')===String(state.calendarMake));
    if(state.calendarCustomer){
      const customerId=String(state.calendarCustomer),now=new Date();now.setHours(0,0,0,0);const end=new Date(now);end.setDate(end.getDate()+14);
      const vehicleIds=new Set((state.segments||[]).filter(s=>{
        const ag=segmentAgreement(s);return ag&&String(ag.customer_id)===customerId&&s.end_at&&overlaps(now,end,s.start_at,s.end_at);
      }).map(s=>String(s.vehicle_id)));
      rows=rows.filter(v=>vehicleIds.has(String(v.id)));
    }
    return rows;
  };

  const baseRenderCalendar=renderCalendar;
  renderCalendar=function(){
    let html=baseRenderCalendar();
    const makes=[...new Set((state.vehicles||[]).map(v=>String(v.make||'').trim()).filter(Boolean))].sort((a,b)=>a.localeCompare(b));
    const customers=[...(state.customers||[])].sort((a,b)=>customerDisplayName(a).localeCompare(customerDisplayName(b)));
    const extra=`<div class="field"><label>Customer Name</label><select id="calCustomer"><option value="">All Customers</option>${customers.map(c=>`<option value="${esc(c.id)}" ${String(state.calendarCustomer)===String(c.id)?'selected':''}>${esc(customerDisplayName(c))}</option>`).join('')}</select></div><div class="field"><label>Vehicle Make</label><select id="calMake"><option value="">All Makes</option>${makes.map(x=>`<option ${state.calendarMake===x?'selected':''}>${esc(x)}</option>`).join('')}</select></div>`;
    html=html.replace('<div class="calendar-filter-grid">','<div class="calendar-filter-grid">'+extra);
    return html;
  };

  function reminderOption(c,key,label){
    const hasEmail=!!customerEmail(c),hasPhone=!!customerPhone(c);
    const disabled=(key==='email'&&!hasEmail)||(key==='sms'&&!hasPhone)||(key==='email_sms'&&(!hasEmail||!hasPhone))||(key==='whatsapp'&&!hasPhone);
    const reason=disabled?(key==='email'?'Email address required':key==='email_sms'?'Email and mobile required':'Mobile number required'):'';
    return `<label class="b5-switch-line" style="opacity:${disabled?'.55':'1'}"><input type="checkbox" data-reminder-method="${key}" ${String(c.monthly_reminder_method||'manual')===key?'checked':''} ${disabled?'disabled':''}> <span>${esc(label)}${reason?` <small>— ${esc(reason)}</small>`:''}</span></label>`;
  }

  function appendReminderPreferences(id){
    const c=customerById(id),body=$('#modalBody');if(!c||!body||body.querySelector('#monthlyReminderPreferences'))return;
    const section=document.createElement('div');section.id='monthlyReminderPreferences';section.className='detail-tabs-section';
    const monthly=!!c.monthly_account,enabled=!!c.monthly_reminder_enabled,balance=balanceFor(c);
    section.innerHTML=`<h3>Monthly Balance Reminder</h3><div class="vehicle-meta">${monthly?'Monthly account customer':'Enable Monthly Account to use month-end reminders.'}</div>${monthly?`<label class="b5-switch-line" style="margin-top:10px"><input id="monthlyReminderEnabled" type="checkbox" ${enabled?'checked':''}> Enable month-end balance reminder</label><div style="margin-top:10px">${reminderMethods.map(x=>reminderOption(c,...x)).join('')}</div><div class="vehicle-meta" style="margin-top:8px">Current balance: <strong>${money(balance)}</strong>. Automatic delivery requires the corresponding sender integration to be configured; otherwise B5 creates the month-end manager reminder and provides a manual send option.</div>${balance>0?'<button type="button" class="btn btn-secondary btn-small" id="previewMonthlyReminder" style="margin-top:10px">Prepare Reminder Now</button>':''}`:''}`;
    body.appendChild(section);
    const checks=[...section.querySelectorAll('[data-reminder-method]')];
    checks.forEach(ch=>ch.addEventListener('change',async()=>{
      if(!ch.checked){ch.checked=true;return;}
      checks.forEach(x=>{if(x!==ch)x.checked=false;});
      const {error}=await window.db.from('customers').update({monthly_reminder_method:ch.dataset.reminderMethod}).eq('id',id);if(error){alert(error.message);return;}
      c.monthly_reminder_method=ch.dataset.reminderMethod;await logAudit('monthly_reminder_method_updated','customer',id,{method:ch.dataset.reminderMethod});
    }));
    $('#monthlyReminderEnabled')?.addEventListener('change',async e=>{const {error}=await window.db.from('customers').update({monthly_reminder_enabled:e.target.checked}).eq('id',id);if(error){e.target.checked=!e.target.checked;return alert(error.message);}c.monthly_reminder_enabled=e.target.checked;});
    $('#previewMonthlyReminder')?.addEventListener('click',()=>prepareReminder(c,balance));
  }

  function reminderText(c,balance){return `Hello ${customerDisplayName(c)}, this is your monthly account balance reminder from All Season Car Rental. Your current outstanding balance is ${money(balance)}. Please contact us if you have any questions. Thank you.`;}
  function prepareReminder(c,balance){
    const method=c.monthly_reminder_method||'manual',text=reminderText(c,balance),email=customerEmail(c),phone=customerPhone(c).replace(/[^+\d]/g,'');
    let actions='';
    if((method==='email'||method==='email_sms'||method==='manual')&&email)actions+=`<a class="btn btn-primary" href="mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent('Monthly Account Balance Reminder')}&body=${encodeURIComponent(text)}">Open Email</a> `;
    if((method==='sms'||method==='email_sms'||method==='manual')&&phone)actions+=`<a class="btn btn-secondary" href="sms:${encodeURIComponent(phone)}?body=${encodeURIComponent(text)}">Open SMS</a> `;
    if((method==='whatsapp'||method==='manual')&&phone)actions+=`<a class="btn btn-secondary" target="_blank" rel="noopener" href="https://wa.me/${encodeURIComponent(phone.replace(/^\+/,''))}?text=${encodeURIComponent(text)}">Open WhatsApp</a>`;
    openModal('Monthly Balance Reminder',`<div class="note"><strong>${esc(customerDisplayName(c))}</strong> · ${esc(methodLabel(method))}</div><div class="panel" style="margin-top:12px"><div class="panel-body">${esc(text)}</div></div><div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:12px">${actions||'<span class="vehicle-meta">No compatible contact details are recorded for this customer.</span>'}</div>`,null,'Close');
    $('#modalForm').onsubmit=e=>{e.preventDefault();$('#modal').close();};
  }

  const baseOpenCustomerProfile=openCustomerProfile;
  openCustomerProfile=function(id){baseOpenCustomerProfile(id);appendReminderPreferences(id);};
  if(typeof window.openCustomerAccount==='function'){
    const baseAccount=window.openCustomerAccount;
    window.openCustomerAccount=function(id){baseAccount(id);appendReminderPreferences(id);};
  }

  const baseBind=bindPageEvents;
  bindPageEvents=function(){
    baseBind.apply(this,arguments);
    $('#calCustomer')?.addEventListener('change',e=>{state.calendarCustomer=e.target.value;render();});
    $('#calMake')?.addEventListener('change',e=>{state.calendarMake=e.target.value;render();});
    $('#clearCalendarFilters')?.addEventListener('click',()=>{state.calendarCustomer='';state.calendarMake='';});
  };
})();