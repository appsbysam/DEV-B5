/* B5 v0.8.89 — safe continuous calendar rental bars
   Leaves the existing renderCalendar and application shell untouched. */
(function(){
  function dayStart(d){const x=new Date(d);x.setHours(0,0,0,0);return x;}
  function dayEnd(d){const x=dayStart(d);x.setDate(x.getDate()+1);return x;}
  function enhanceCalendar(){
    if(!window.state || state.page!=="calendar") return;
    const grid=document.querySelector(".timeline-grid");
    if(!grid || grid.dataset.continuousBars==="1") return;
    const rows=[...grid.querySelectorAll(".timeline-row:not(.header)")];
    if(!rows.length) return;
    const start=dayStart(new Date());
    const days=Array.from({length:14},(_,i)=>{const d=new Date(start);d.setDate(d.getDate()+i);return d;});
    rows.forEach((row,rowIndex)=>{
      const vehicle=state.vehicles?.[rowIndex];
      if(!vehicle) return;
      const cells=[...row.querySelectorAll(".timeline-cell")];
      if(cells.length!==14) return;
      const segs=(state.segments||[]).filter(s=>String(s.vehicle_id)===String(vehicle.id)&&s.start_at&&s.end_at);
      segs.forEach(seg=>{
        let first=-1,last=-1;
        days.forEach((d,i)=>{
          if(overlaps(dayStart(d),dayEnd(d),seg.start_at,seg.end_at)){
            if(first<0) first=i;
            last=i;
          }
        });
        if(first<0) return;
        for(let i=first;i<=last;i++) cells[i].querySelectorAll(".timeline-bar").forEach(x=>x.remove());
        const ag=segmentAgreement(seg);
        const label=ag?.customer||"Booked";
        const bar=document.createElement("div");
        bar.className="timeline-continuous-bar";
        bar.textContent=label;
        bar.title=label;
        bar.style.setProperty("--calendar-start",String(first+2));
        bar.style.setProperty("--calendar-end",String(last+3));
        row.appendChild(bar);
      });
    });
    grid.dataset.continuousBars="1";
  }
  const observer=new MutationObserver(()=>requestAnimationFrame(enhanceCalendar));
  function start(){
    const content=document.getElementById("content");
    if(content) observer.observe(content,{childList:true,subtree:true});
    enhanceCalendar();
  }
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",start); else start();
})();
