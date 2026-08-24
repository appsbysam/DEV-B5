/* B5 v0.8.89 — continuous calendar rental bars */
(function(){
  function calendarDayStart(d){const x=new Date(d);x.setHours(0,0,0,0);return x;}
  function calendarDayEnd(d){const x=calendarDayStart(d);x.setDate(x.getDate()+1);return x;}
  function visibleCalendarSegments(vehicleId,days){
    const rangeStart=calendarDayStart(days[0]);
    const rangeEnd=calendarDayEnd(days[days.length-1]);
    return (state.segments||[]).filter(s=>String(s.vehicle_id)===String(vehicleId)&&s.start_at&&s.end_at&&overlaps(rangeStart,rangeEnd,s.start_at,s.end_at));
  }
  function spanForSegment(seg,days){
    let first=-1,last=-1;
    days.forEach((d,i)=>{if(overlaps(calendarDayStart(d),calendarDayEnd(d),seg.start_at,seg.end_at)){if(first<0)first=i;last=i;}});
    return first<0?null:{first,last};
  }
  renderCalendar=function(){
    const start=new Date();start.setHours(0,0,0,0);
    const days=Array.from({length:14},(_,i)=>{const d=new Date(start);d.setDate(d.getDate()+i);return d;});
    return `<div class="panel"><div class="panel-head"><h3>Fleet Timeline — Next 14 Days</h3><div class="kpi-row"><span class="badge badge-out">Booked</span><span class="badge badge-available">Available gaps</span></div></div><div class="panel-body timeline"><div class="timeline-grid continuous-calendar"><div class="timeline-row header"><div class="timeline-vehicle">Vehicle</div>${days.map(d=>`<div class="timeline-cell">${d.toLocaleDateString("en-AU",{day:"2-digit",month:"short"})}</div>`).join("")}</div>${state.vehicles.slice(0,50).map(v=>{
      const segs=visibleCalendarSegments(v.id,days);
      const bars=segs.map(seg=>{const span=spanForSegment(seg,days);if(!span)return'';const ag=segmentAgreement(seg);const label=ag?.customer||'Booked';const rid=ag?.uuid||ag?.id||seg.rental_agreement_id||'';return `<button type="button" class="timeline-span-bar" style="--bar-start:${span.first+2};--bar-end:${span.last+3}" data-calendar-rental="${esc(rid)}" title="${esc(label)}">${esc(label)}</button>`;}).join('');
      return `<div class="timeline-row continuous-row"><div class="timeline-vehicle">${esc(v.model)}<br><span style="font-weight:400;color:#718096">${esc(v.plate)}</span></div>${days.map(()=>'<div class="timeline-cell"></div>').join('')}${bars}</div>`;
    }).join('')}</div></div></div>`;
  };
  document.addEventListener('click',e=>{const bar=e.target.closest?.('[data-calendar-rental]');if(!bar)return;e.preventDefault();e.stopImmediatePropagation();const id=bar.dataset.calendarRental;if(typeof openRentalDetails==='function')openRentalDetails(id);else if(typeof openRentalInRentals==='function')openRentalInRentals(id);},true);
})();
