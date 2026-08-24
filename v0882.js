/* B5 v0.8.91 — calendar alphabetical sorting + two-colour rental sequence */
(function(){
  const VERSION='0.8.91';
  function dayStart091(d){const x=new Date(d);x.setHours(0,0,0,0);return x;}
  function dayEnd091(d){const x=dayStart091(d);x.setDate(x.getDate()+1);return x;}
  function visibleSegments091(vehicleId,days){const a=dayStart091(days[0]),b=dayEnd091(days[days.length-1]);return (state.segments||[]).filter(s=>String(s.vehicle_id)===String(vehicleId)&&s.start_at&&s.end_at&&overlaps(a,b,s.start_at,s.end_at)).sort((a,b)=>new Date(a.start_at)-new Date(b.start_at));}
  function span091(seg,days){let first=-1,last=-1;days.forEach((d,i)=>{if(overlaps(dayStart091(d),dayEnd091(d),seg.start_at,seg.end_at)){if(first<0)first=i;last=i;}});return first<0?null:{first,last};}
  function vehicleName091(v){return `${v.make||''} ${v.model||''}`.trim();}
  function calendarVehicles091(){const f=state.calendarStatusFilter||'out';return (state.vehicles||[]).filter(v=>{const s=effectiveVehicleStatus(v);if(f==='all')return true;if(f==='out')return s==='Out on Rental';if(f==='reserved')return s==='Reserved';if(f==='available')return s==='Available';if(f==='review')return s==='Needs Review';if(f==='oos')return s==='Out of Order'||s==='Maintenance';return true;}).sort((a,b)=>{const byName=vehicleName091(a).localeCompare(vehicleName091(b),undefined,{sensitivity:'base',numeric:true});if(byName)return byName;return String(a.plate||'').localeCompare(String(b.plate||''),undefined,{sensitivity:'base',numeric:true});});}
  function rentalNo091(v,segs){const current=currentSegmentForVehicle(v.id);const seg=current||segs[0];const ag=seg?segmentAgreement(seg):null;return ag?.id?`#${ag.id}`:'';}

  renderCalendar=function(){
    if(state.calendarStatusFilter==null)state.calendarStatusFilter='out';
    const start=new Date();start.setHours(0,0,0,0);
    const days=Array.from({length:14},(_,i)=>{const d=new Date(start);d.setDate(d.getDate()+i);return d;});
    const vehicles=calendarVehicles091();
    const fixedRows=vehicles.map(v=>{const segs=visibleSegments091(v.id,days),rentalNo=rentalNo091(v,segs);return `<div class="calendar-fixed-row"><strong>${esc(vehicleName091(v))}</strong><small>${esc(v.plate||'No plate')}${rentalNo?` &nbsp; (${esc(rentalNo)})`:''}</small></div>`;}).join('');
    const timelineRows=vehicles.map(v=>{const segs=visibleSegments091(v.id,days);const bars=segs.map((seg,sequence)=>{const span=span091(seg,days);if(!span)return'';const ag=segmentAgreement(seg),label=ag?.customer||'Booked',ref=ag?.uuid||ag?.id||seg.rental_agreement_id||'',tone=sequence%2;return `<button type="button" class="calendar-span-bar rental-tone-${tone}" style="grid-column:${span.first+1}/${span.last+2}" data-calendar-rental="${esc(ref)}" title="${esc(label)}">${esc(label)}</button>`;}).join('');return `<div class="calendar-scroll-row">${days.map(()=>'<div class="calendar-day-cell"></div>').join('')}${bars}</div>`;}).join('');
    return `<div class="calendar-filter-compact"><div><strong>Calendar Filter</strong><small>${vehicles.length} vehicles shown · A–Z</small></div><label>Status <select id="calendarStatusFilter"><option value="out" ${state.calendarStatusFilter==='out'?'selected':''}>Out on Rental</option><option value="reserved" ${state.calendarStatusFilter==='reserved'?'selected':''}>Reserved</option><option value="available" ${state.calendarStatusFilter==='available'?'selected':''}>Available</option><option value="review" ${state.calendarStatusFilter==='review'?'selected':''}>Needs Review</option><option value="oos" ${state.calendarStatusFilter==='oos'?'selected':''}>Out of Order</option><option value="all" ${state.calendarStatusFilter==='all'?'selected':''}>All Vehicles</option></select></label></div><div class="panel"><div class="panel-head"><h3>Fleet Timeline — Next 14 Days</h3><div class="kpi-row"><span class="badge badge-out">Booked</span></div></div><div class="panel-body calendar-board-wrap"><div class="calendar-board"><div class="calendar-fixed"><div class="calendar-fixed-head">Vehicle</div>${fixedRows}</div><div class="calendar-scroll" id="calendarScroll"><div class="calendar-date-row">${days.map(d=>`<div>${d.toLocaleDateString('en-AU',{day:'2-digit',month:'short'})}</div>`).join('')}</div>${timelineRows}</div></div>${vehicles.length?'':'<div class="calendar-empty">No vehicles match this filter.</div>'}</div></div>`;
  };

  if(!document.getElementById('calendarV091Style')){const st=document.createElement('style');st.id='calendarV091Style';st.textContent=`
    .calendar-span-bar.rental-tone-0{background:#b9f227!important;color:#274400!important;border-color:#8cc515!important}
    .calendar-span-bar.rental-tone-1{background:#f3c548!important;color:#5a3c00!important;border-color:#d2a72a!important}
    [data-resolved-theme='dark'] .calendar-span-bar.rental-tone-0{background:#87c91d!important;color:#102b00!important;border-color:#a8e53f!important}
    [data-resolved-theme='dark'] .calendar-span-bar.rental-tone-1{background:#d8a92c!important;color:#2d2100!important;border-color:#f0ca55!important}
  `;document.head.appendChild(st);}

  function applyVersion091(){const btn=document.getElementById('versionBtn');if(btn)btn.textContent=`v${VERSION}`;}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',applyVersion091);else applyVersion091();
  setTimeout(applyVersion091,250);
  if('serviceWorker'in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register(`./sw.js?v=${VERSION}`,{scope:'./'}).catch(console.warn));
})();
