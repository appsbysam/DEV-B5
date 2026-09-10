/* B5 v0.9.26 — Payments & Finance completion */
(()=>{
  const $=(s,r=document)=>r.querySelector(s);
  const m=n=>money(Number(n||0));
  const defaults=['Cash','Card','Bank Transfer','Other'];
  Object.assign(state,{paymentMethods:defaults.slice(),cardSurchargePercent:5,financeSettingsLoaded:false,financeData:null});

  async function loadFinanceSettings(){
    if(!window.db)return;
    const {data}=await window.db.from('app_public_settings').select('key,value').in('key',['payment_methods','card_surcharge_percent']);
    const map=Object.fromEntries((data||[]).map(x=>[x.key,x.value]));
    try{const parsed=JSON.parse(map.payment_methods||'[]');if(Array.isArray(parsed)&&parsed.length)state.paymentMethods=parsed;}catch{}
    state.cardSurchargePercent=Number(map.card_surcharge_percent||5);
    state.financeSettingsLoaded=true;
  }
  window.B5Finance={loadFinanceSettings};
  loadFinanceSettings();

  function customerBalance(customerId){
    const rentals=state.rentals.filter(r=>String(r.customer_id)===String(customerId));
    return rentals.reduce((sum,r)=>sum+Math.max(0,rentalFinancials(r.uuid).balance),0);
  }

  const oldRenderCustomers=renderCustomers;
  renderCustomers=function(){
    const html=oldRenderCustomers();
    return html.replace(/<\/div>\s*$/,`<div class="panel" style="margin-top:14px"><div class="panel-head"><h3>Customer Account Balances</h3></div><div class="panel-body"><div class="vehicle-meta">Outstanding balances remain attached to the customer across completed rentals and future visits.</div>${state.customers.filter(c=>customerBalance(c.id)>0).length?`<div class="table-wrap" style="margin-top:10px"><table><thead><tr><th>Customer</th><th>Carried Balance</th></tr></thead><tbody>${state.customers.filter(c=>customerBalance(c.id)>0).map(c=>`<tr><td>${esc(customerDisplayName(c))}</td><td><strong>${m(customerBalance(c.id))}</strong></td></tr>`).join('')}</tbody></table></div>`:'<div class="empty">No customer balances are currently carried forward.</div>'}</div></div></div>`);
  };

  paymentModal=function(uuid){
    const r=agreementByUuid(uuid);if(!r)return;
    const f=rentalFinancials(uuid),methods=(state.paymentMethods?.length?state.paymentMethods:defaults);
    openModal(`Record Payment · Rental #${r.id}`,`
      <div class="note">Current rental balance: <strong>${m(f.balance)}</strong>${customerBalance(r.customer_id)>f.balance?` · Customer total outstanding: <strong>${m(customerBalance(r.customer_id))}</strong>`:''}</div>
      <div class="grid two-col" style="margin-top:12px">
        <div class="field"><label>Payment Type</label><select id="pType"><option>Additional Payment</option><option>Final Payment</option><option>Deposit / Down Payment</option><option>Refund</option><option>Adjustment</option></select></div>
        <div class="field"><label>Amount</label><input id="pAmount" type="number" step="0.01" min="0"></div>
        <div class="field"><label>Payment Method</label><select id="pMethod">${methods.map(x=>`<option>${esc(x)}</option>`).join('')}</select></div>
        <div class="field"><label>Reference</label><input id="pReference" placeholder="Generated automatically" disabled></div>
      </div>
      <div id="cardSurchargeBox" class="panel" style="margin-top:12px" hidden><div class="panel-body"><label style="display:flex;gap:8px;align-items:center"><input id="pSurcharge" type="checkbox" checked> Apply ${esc(state.cardSurchargePercent)}% card surcharge</label><div id="pSurchargePreview" class="vehicle-meta" style="margin-top:6px"></div></div></div>`,async()=>{
        const base=Number($('#pAmount').value||0);if(base<=0){alert('Enter a payment amount.');return false;}
        const type=$('#pType').value,method=$('#pMethod').value,isRefund=type==='Refund';
        const apply=method==='Card'&&$('#pSurcharge')?.checked&&!isRefund;
        const surcharge=apply?Number((base*state.cardSurchargePercent/100).toFixed(2)):0;
        const total=base+surcharge,signed=isRefund?-base:total;
        const payload={rental_agreement_id:uuid,payment_type:type,amount:signed,payment_method:method,base_amount:isRefund?-base:base,surcharge_amount:surcharge,surcharge_waived:method==='Card'&&!apply};
        const {data,error}=await window.db.from('payments').insert(payload).select('id,reference').single();
        if(error){alert(error.message);return false;}
        if(surcharge>0){const {error:ce}=await window.db.from('rental_charges').insert({rental_agreement_id:uuid,charge_type:'Card Surcharge',description:`${state.cardSurchargePercent}% card surcharge · ${data.reference||''}`,amount:surcharge});if(ce){alert('Payment saved, but surcharge charge could not be recorded: '+ce.message);}}
        await logAudit('payment_recorded','rental_agreement',uuid,{amount:signed,base_amount:base,surcharge_amount:surcharge,surcharge_waived:method==='Card'&&!apply,type,method,reference:data?.reference||null});
        await loadSupabaseData();return true;
      },'Record Payment');
    const refresh=()=>{const card=$('#pMethod')?.value==='Card',refund=$('#pType')?.value==='Refund',box=$('#cardSurchargeBox');if(box)box.hidden=!card||refund;const base=Number($('#pAmount')?.value||0),apply=card&&!refund&&$('#pSurcharge')?.checked,s=apply?base*state.cardSurchargePercent/100:0;const p=$('#pSurchargePreview');if(p)p.textContent=apply?`Surcharge ${m(s)} · Total received ${m(base+s)}`:'No card surcharge will be applied to this payment.';};
    ['pMethod','pType','pAmount','pSurcharge'].forEach(id=>$('#'+id)?.addEventListener('input',refresh));refresh();
  };

  const oldSettings=renderSettings;
  renderSettings=function(){
    const methods=state.paymentMethods||defaults;
    return oldSettings()+`<div class="panel" style="margin-top:14px"><div class="panel-head"><h3>Payment Methods</h3></div><div class="panel-body"><p class="vehicle-meta">Choose which payment methods staff can use when recording a payment.</p><div id="paymentMethodSettings">${defaults.map(x=>`<label style="display:flex;gap:8px;margin:8px 0"><input type="checkbox" data-fin-method="${esc(x)}" ${methods.includes(x)?'checked':''}> ${esc(x)}</label>`).join('')}</div><div class="field" style="max-width:220px;margin-top:10px"><label>Card surcharge %</label><input id="financeSurchargePct" type="number" min="0" step="0.1" value="${esc(state.cardSurchargePercent)}"></div><button class="btn btn-primary" id="saveFinanceSettings" style="margin-top:10px">Save Payment Settings</button></div></div>`;
  };

  async function saveSettings(){
    const methods=Array.from(document.querySelectorAll('[data-fin-method]:checked')).map(x=>x.dataset.finMethod);if(!methods.length){alert('Keep at least one payment method enabled.');return;}
    const pct=Math.max(0,Number($('#financeSurchargePct')?.value||0));
    const {error}=await window.db.from('app_public_settings').upsert([{key:'payment_methods',value:JSON.stringify(methods)},{key:'card_surcharge_percent',value:String(pct)}],{onConflict:'key'});if(error){alert(error.message);return;}
    state.paymentMethods=methods;state.cardSurchargePercent=pct;alert('Payment settings saved.');render();
  }

  async function financeData(){
    const [ct,ve]=await Promise.all([window.db.from('cash_transactions').select('*'),window.db.from('vehicle_expenses').select('*')]);
    return {cash:ct.data||[],vehicle:ve.data||[]};
  }
  const oldReports=renderReports;
  renderReports=function(){
    const base=oldReports();
    setTimeout(async()=>{if(state.page!=='reports')return;state.financeData=await financeData();const el=$('#fullCashFlow');if(!el)return;const received=(state.payments||[]).reduce((s,p)=>s+Number(p.amount||0),0);const cash=state.financeData.cash;const manualIn=cash.filter(x=>String(x.direction).toLowerCase()==='in'&&!x.rental_agreement_id).reduce((s,x)=>s+Number(x.amount||0),0);const manualOut=cash.filter(x=>String(x.direction).toLowerCase()==='out').reduce((s,x)=>s+Number(x.amount||0),0);const vehicleExpenses=state.financeData.vehicle.reduce((s,x)=>s+Number(x.amount||0),0);const linkedVehicleExpenseIds=new Set(cash.filter(x=>String(x.direction).toLowerCase()==='out'&&x.vehicle_id).map(x=>`${x.vehicle_id}|${Number(x.amount||0).toFixed(2)}|${x.transaction_date||''}`));const unlinkedVehicle=state.financeData.vehicle.filter(x=>!linkedVehicleExpenseIds.has(`${x.vehicle_id}|${Number(x.amount||0).toFixed(2)}|${x.expense_date||''}`)).reduce((s,x)=>s+Number(x.amount||0),0);const out=manualOut+unlinkedVehicle;el.innerHTML=`<div class="stats report-stats"><div class="stat"><span>Rental Payments</span><strong>${m(received)}</strong></div><div class="stat"><span>Other Cash In</span><strong>${m(manualIn)}</strong></div><div class="stat"><span>Total Cash Out</span><strong>${m(out)}</strong></div><div class="stat"><span>Net Cash Flow</span><strong>${m(received+manualIn-out)}</strong></div></div><div class="vehicle-meta">Outgoing cash entries are combined with vehicle expenses only where no matching cash entry exists, reducing double counting.</div>`;},0);
    return base+`<div class="panel" style="margin-top:14px"><div class="panel-head"><h3>Full Cash Flow</h3></div><div class="panel-body" id="fullCashFlow"><div class="empty">Calculating cash flow…</div></div></div>`;
  };

  const oldBind=bindPageEvents;
  bindPageEvents=function(){oldBind.apply(this,arguments);$('#saveFinanceSettings')?.addEventListener('click',saveSettings);};
})();