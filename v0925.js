/* B5 v0.9.25 — Reports completion */
(()=>{
  const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
  const m=n=>money(Number(n||0));
  const ymd=d=>{const z=n=>String(n).padStart(2,'0');return `${d.getFullYear()}-${z(d.getMonth()+1)}-${z(d.getDate())}`;};
  const dayMs=86400000;
  Object.assign(state,{reportVehicle:'',reportFuturePreset:'7',reportFutureFrom:'',reportFutureTo:'',reportData:null,reportLoading:false});

  function validRental(r){return !['Cancelled','Returned','Completed','Closed'].includes(String(r?.status||''));}
  function segmentDaysInRange(seg,from,to){const a=Math.max(new Date(seg.start_at).getTime(),from.getTime()),b=Math.min(new Date(seg.end_at).getTime(),to.getTime()+dayMs);return b>a?Math.max(0,(b-a)/dayMs):0;}
  function segmentRevenue(seg,from=null,to=null){let days;if(from&&to)days=segmentDaysInRange(seg,from,to);else days=Math.max(1,(new Date(seg.end_at)-new Date(seg.start_at))/dayMs);return days*Number(seg.agreed_daily_rate||0);}
  function vehicleName(id){const v=vehicleById(id);return v?`${v.make||''} ${v.model||''}${v.plate?` · ${v.plate}`:''}`.trim():'Unknown vehicle';}
  function agreementForSegment(seg){return state.rentals.find(r=>String(r.uuid)===String(seg.rental_agreement_id));}

  async function loadReportData(){
    if(state.reportLoading)return;
    state.reportLoading=true;
    try{
      const [ve,ct]=await Promise.all([
        window.db.from('vehicle_expenses').select('id,vehicle_id,expense_date,category,amount,vendor,reference,notes').order('expense_date',{ascending:false}),
        window.db.from('cash_transactions').select('id,transaction_date,direction,category,amount,vehicle_id,rental_agreement_id,reference,notes').order('transaction_date',{ascending:false})
      ]);
      state.reportData={vehicleExpenses:ve.data||[],cashTransactions:ct.data||[],error:ve.error||ct.error||null};
    }finally{state.reportLoading=false;if(state.page==='reports')render();}
  }

  function futureRange(){
    const now=new Date();now.setHours(0,0,0,0);
    if(state.reportFuturePreset==='custom'){
      const f=state.reportFutureFrom?new Date(state.reportFutureFrom+'T00:00:00'):now;
      const t=state.reportFutureTo?new Date(state.reportFutureTo+'T00:00:00'):new Date(f.getTime()+6*dayMs);
      return [f,t];
    }
    if(state.reportFuturePreset==='month'){
      const f=new Date(now.getFullYear(),now.getMonth()+1,1),t=new Date(now.getFullYear(),now.getMonth()+2,0);return [f,t];
    }
    return [now,new Date(now.getTime()+6*dayMs)];
  }

  function vehicleCombined(){
    if(!state.reportVehicle)return {income:0,expenses:0,rows:[]};
    const id=state.reportVehicle;
    const segs=state.segments.filter(s=>String(s.vehicle_id)===String(id));
    const income=segs.reduce((sum,s)=>sum+segmentRevenue(s),0);
    const ex=(state.reportData?.vehicleExpenses||[]).filter(x=>String(x.vehicle_id)===String(id));
    const expenses=ex.reduce((sum,x)=>sum+Number(x.amount||0),0);
    const rows=[...segs.map(s=>({date:s.start_at,type:'Income',description:`Rental #${agreementForSegment(s)?.id||''}`,amount:segmentRevenue(s)})),...ex.map(x=>({date:x.expense_date,type:'Expense',description:x.category||x.vendor||'Vehicle expense',amount:-Number(x.amount||0)}))].sort((a,b)=>new Date(b.date)-new Date(a.date));
    return {income,expenses,net:income-expenses,rows};
  }

  function businessCombined(){
    const income=(state.payments||[]).reduce((sum,p)=>sum+Number(p.amount||0),0);
    const cashOut=(state.reportData?.cashTransactions||[]).filter(x=>String(x.direction).toLowerCase()==='out').reduce((s,x)=>s+Number(x.amount||0),0);
    const vehicleOut=(state.reportData?.vehicleExpenses||[]).reduce((s,x)=>s+Number(x.amount||0),0);
    const expenses=cashOut||vehicleOut;
    return {income,expenses,net:income-expenses};
  }

  function futureForecast(){
    const [from,to]=futureRange();
    const rows=state.segments.filter(s=>new Date(s.end_at)>=from&&new Date(s.start_at)<=new Date(to.getTime()+dayMs)).map(s=>({seg:s,rental:agreementForSegment(s)})).filter(x=>validRental(x.rental)).map(({seg,rental})=>({vehicle:vehicleName(seg.vehicle_id),rental:rental?.id||'',start:seg.start_at,end:seg.end_at,amount:segmentRevenue(seg,from,to)})).filter(x=>x.amount>0).sort((a,b)=>new Date(a.start)-new Date(b.start));
    return {from,to,rows,total:rows.reduce((s,x)=>s+x.amount,0)};
  }

  function transactionTable(rows){if(!rows.length)return '<div class="empty">No report entries for this selection.</div>';return `<div class="table-wrap"><table class="today-compact-table"><thead><tr><th>Date</th><th>Type</th><th>Description</th><th>Amount</th></tr></thead><tbody>${rows.map(r=>`<tr><td data-label="Date">${fmtDate(r.date)}</td><td data-label="Type">${esc(r.type)}</td><td data-label="Description">${esc(r.description)}</td><td data-label="Amount">${m(r.amount)}</td></tr>`).join('')}</tbody></table></div>`;}

  const originalReports=renderReports;
  renderReports=function(){
    if(!state.reportData&&!state.reportLoading)setTimeout(loadReportData,0);
    const vc=vehicleCombined(),bc=businessCombined(),ff=futureForecast();
    const vehicles=[...state.vehicles].sort((a,b)=>vehicleName(a.id).localeCompare(vehicleName(b.id)));
    return `<div class="report-compact"><div class="section-title"><div><h2>Reports</h2><p>Income, expenses, net performance and future expected income</p></div></div>
      <div class="panel"><div class="panel-head"><h3>Individual Vehicle — Income & Expenses</h3></div><div class="panel-body"><div class="report-range-row"><div class="field"><label>Vehicle</label><select id="reportVehicle"><option value="">Select vehicle</option>${vehicles.map(v=>`<option value="${esc(v.id)}" ${String(state.reportVehicle)===String(v.id)?'selected':''}>${esc(vehicleName(v.id))}</option>`).join('')}</select></div></div>${state.reportVehicle?`<div class="stats report-stats" style="margin-top:12px"><div class="stat"><span>Income</span><strong>${m(vc.income)}</strong></div><div class="stat"><span>Expenses</span><strong>${m(vc.expenses)}</strong></div><div class="stat"><span>Net</span><strong>${m(vc.net)}</strong></div></div>${transactionTable(vc.rows)}`:'<div class="empty">Choose a vehicle to view its combined income and expense report.</div>'}</div></div>
      <div class="panel" style="margin-top:14px"><div class="panel-head"><h3>Combined Business Report</h3></div><div class="panel-body"><div class="stats report-stats"><div class="stat"><span>Income Received</span><strong>${m(bc.income)}</strong></div><div class="stat"><span>Business Expenses</span><strong>${m(bc.expenses)}</strong></div><div class="stat"><span>Net Result</span><strong>${m(bc.net)}</strong></div></div><div class="vehicle-meta">Income uses recorded payments. Expenses use recorded outgoing cash transactions, with vehicle expenses used as fallback where no outgoing cash transactions exist.</div></div></div>
      <div class="panel" style="margin-top:14px"><div class="panel-head"><h3>Expected Future Income</h3></div><div class="panel-body"><div class="report-range-row"><div class="field"><label>Period</label><select id="futurePreset"><option value="7" ${state.reportFuturePreset==='7'?'selected':''}>Next 7 days</option><option value="month" ${state.reportFuturePreset==='month'?'selected':''}>Next calendar month</option><option value="custom" ${state.reportFuturePreset==='custom'?'selected':''}>Custom date range</option></select></div>${state.reportFuturePreset==='custom'?`<div class="field"><label>From</label><input id="futureFrom" type="date" value="${esc(state.reportFutureFrom||ymd(ff.from))}"></div><div class="field"><label>To</label><input id="futureTo" type="date" value="${esc(state.reportFutureTo||ymd(ff.to))}"></div>`:''}</div><div class="stats" style="margin-top:12px"><div class="stat"><span>Expected Income</span><strong>${m(ff.total)}</strong><small>${ff.from.toLocaleDateString('en-AU')} – ${ff.to.toLocaleDateString('en-AU')}</small></div></div>${ff.rows.length?`<div class="table-wrap"><table class="today-compact-table"><thead><tr><th>Rental</th><th>Vehicle</th><th>Rental Period</th><th>Expected Income</th></tr></thead><tbody>${ff.rows.map(r=>`<tr><td data-label="Rental">#${esc(r.rental)}</td><td data-label="Vehicle">${esc(r.vehicle)}</td><td data-label="Rental Period">${fmtDate(r.start)} → ${fmtDate(r.end)}</td><td data-label="Expected Income">${m(r.amount)}</td></tr>`).join('')}</tbody></table></div>`:'<div class="empty">No expected rental income in this period.</div>'}<div class="vehicle-meta">Forecast is calculated from confirmed/open rental segments overlapping the selected period and their agreed daily rates.</div></div></div></div>`;
  };

  const baseBind=bindPageEvents;
  bindPageEvents=function(){baseBind.apply(this,arguments);if(state.page!=='reports')return;$('#reportVehicle')?.addEventListener('change',e=>{state.reportVehicle=e.target.value;render();});$('#futurePreset')?.addEventListener('change',e=>{state.reportFuturePreset=e.target.value;render();});$('#futureFrom')?.addEventListener('change',e=>{state.reportFutureFrom=e.target.value;render();});$('#futureTo')?.addEventListener('change',e=>{state.reportFutureTo=e.target.value;render();});};
})();