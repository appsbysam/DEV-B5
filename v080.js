/* B5 v0.8.0 client workflow enhancements.
   Loaded after app.js and before auth.js so it can extend the existing application cleanly. */

Object.assign(state,{
  calendarSearch:state.calendarSearch||"",
  calendarCategory:state.calendarCategory||"",
  calendarSource:state.calendarSource||"",
  calendarStatus:state.calendarStatus||"",
  calendarMinRate:state.calendarMinRate||"",
  calendarMaxRate:state.calendarMaxRate||"",
  calendarSort:state.calendarSort||"model",
  calendarSortDir:state.calendarSortDir||"asc"
});

function lebanonLocationReference(){
  return Array.isArray(window.LEBANON_LOCATIONS)?window.LEBANON_LOCATIONS:[];
}
function sortedOperationalLocations(){
  return [...state.locations].sort((a,b)=>String(a.name||"").localeCompare(String(b.name||"")));
}
anyLocationOptions=function(selected="Any"){
  return `<option value="Any" ${selected==="Any"?"selected":""}>Any</option>`+
    `<option value="__ADD_LOCATION__">＋ Add new location…</option>`+
    sortedOperationalLocations().map(l=>`<option value="${esc(l.id)}" ${String(l.id)===String(selected)?"selected":""}>${esc(l.name)}</option>`).join("");
};
locationOptions=function(selectedId=""){
  return sortedOperationalLocations().map(l=>`<option value="${esc(l.id)}" ${String(l.id)===String(selectedId)?"selected":""}>${esc(l.name)}</option>`).join("");
};
function locationReferenceOptions(query=""){
  const q=query.trim().toLowerCase();
  return lebanonLocationReference().filter(x=>!q||`${x.name} ${x.district||""}`.toLowerCase().includes(q)).slice(0,40);
}
function openAddLocationModal(targetSelectId=null){
  openModal("Add Pickup / Drop-off Location",`
    <div class="field">
      <label>Search Lebanon area / suburb</label>
      <input id="locSearch" autocomplete="off" placeholder="Start typing, e.g. Hamra, Hasbaya, Jounieh">
      <div id="locReferenceResults" class="location-reference-results"></div>
    </div>
    <div class="grid two-col" style="margin-top:12px">
      <div class="field"><label>Location Name</label><input id="locName"></div>
      <div class="field"><label>District / Area</label><input id="locDistrict"></div>
      <div class="field"><label>Pickup Fee (USD)</label><input id="locPickupFee" type="number" min="0" step="0.01" value="0"></div>
      <div class="field"><label>Drop-off Fee (USD)</label><input id="locDropoffFee" type="number" min="0" step="0.01" value="0"></div>
      <div class="field"><label>Transfer Buffer (minutes)</label><input id="locBuffer" type="number" min="0" step="15" value="60"></div>
    </div>`,async()=>{
      const name=$("#locName").value.trim();
      if(!name){alert("Location name is required.");return false;}
      const existing=state.locations.find(l=>String(l.name||"").toLowerCase()===name.toLowerCase());
      if(existing){
        alert("That location already exists.");
        return true;
      }
      const district=$("#locDistrict").value.trim();
      const payload={
        name,
        pickup_fee:Number($("#locPickupFee").value||0),
        dropoff_fee:Number($("#locDropoffFee").value||0),
        turnaround_minutes:Number($("#locBuffer").value||0),
        notes:district?`District / area: ${district}`:null,
        active:true
      };
      const {data,error}=await window.db.from("locations").insert(payload).select().single();
      if(error){alert(error.message);return false;}
      await logAudit("location_created","location",data.id,{name,district,pickup_fee:payload.pickup_fee,dropoff_fee:payload.dropoff_fee});
      await loadSupabaseData();
      return true;
    },"Add Location");

  const renderRef=()=>{
    const box=$("#locReferenceResults"); if(!box)return;
    const rows=locationReferenceOptions($("#locSearch").value);
    box.innerHTML=rows.length?rows.map(x=>`<button type="button" class="location-reference-item" data-loc-name="${esc(x.name)}" data-loc-district="${esc(x.district||"")}"><strong>${esc(x.name)}</strong><span>${esc(x.district||"Lebanon")}</span></button>`).join(""):`<div class="customer-no-results">No reference match. You can still enter the location manually.</div>`;
    $$(".location-reference-item",box).forEach(btn=>btn.onclick=()=>{
      $("#locName").value=btn.dataset.locName||"";
      $("#locDistrict").value=btn.dataset.locDistrict||"";
      $("#locSearch").value=btn.dataset.locName||"";
      box.innerHTML="";
    });
  };
  $("#locSearch")?.addEventListener("input",renderRef);
  $("#locSearch")?.addEventListener("focus",renderRef);
}

const _b5RentalCard079=rentalCard;
rentalCard=function(r,readOnly=false){
  const html=_b5RentalCard079(r,readOnly);
  return html.replace(
    '<div class="rental-card ',
    `<div class="rental-card rental-card-clickable `
  ).replace(
    `data-rental-card="${esc(r.uuid)}"`,
    `data-rental-card="${esc(r.uuid)}" data-open-rental-details="${esc(r.uuid)}" tabindex="0" role="button" aria-label="Open rental details"`
  );
};

function openRentalDetails(uuid){
  const r=agreementByUuid(uuid);if(!r)return;
  const v=vehicleById(r.vehicle_id),c=customerById(r.customer_id),f=rentalFinancials(r.uuid);
  const status=v?effectiveVehicleStatus(v):"Unassigned";
  openModal(`Rental #${r.id}`,`
    <div class="rental-detail-grid">
      <div class="rental-detail-section"><h4>Customer</h4><div><strong>${esc(r.customer)}</strong></div>${c?.mobile?`<div class="vehicle-meta">${esc(c.mobile)}</div>`:""}${c?.email?`<div class="vehicle-meta">${esc(c.email)}</div>`:""}</div>
      <div class="rental-detail-section"><h4>Vehicle</h4><div><strong>${v?`${esc(v.make)} ${esc(v.model)}`:"Unassigned"}</strong></div><div class="vehicle-meta">${v?`${esc(v.plate||"No plate")} · ${esc(v.color||"Colour not recorded")} · ${esc(v.category||"")}`:""}</div>${v?`<div class="vehicle-meta">${esc(v.seats)} seats · ${esc(v.transmission)} · ${money(v.rate)}/day</div>`:""}${v?.supplier?`<div class="vehicle-meta">Supplier: ${esc(v.supplier)}</div>`:""}</div>
      <div class="rental-detail-section"><h4>Rental Period</h4><div>${fmtDate(r.start)}</div><div class="vehicle-meta">to ${fmtDate(r.end)}</div><div class="vehicle-meta">${esc(r.pickup)} → ${esc(r.dropoff)}</div></div>
      <div class="rental-detail-section"><h4>Status</h4><div><span class="badge ${statusClass(r.status)}">${esc(r.status)}</span> <span class="badge ${statusClass(status)}">${esc(status)}</span></div><div class="vehicle-meta" style="margin-top:6px">${esc(r.guarantee||"")}</div></div>
      <div class="rental-detail-section"><h4>Financials</h4><div>Charges: <strong>${money(f.chargeTotal)}</strong></div><div>Payments: <strong>${money(f.paymentTotal)}</strong></div><div>Balance: <strong>${money(f.balance)}</strong></div></div>
      ${r.notes?`<div class="rental-detail-section"><h4>Notes</h4><div>${esc(r.notes)}</div></div>`:""}
    </div>
    ${r.segments.length>1?`<div class="segment-list" style="margin-top:14px">${r.segments.map(s=>{const sv=vehicleById(s.vehicle_id);return `<div class="segment-item">${fmtDate(s.start_at)} → ${fmtDate(s.end_at)}<br><strong>${esc(sv?.make||"")} ${esc(sv?.model||"Vehicle")} · ${esc(sv?.plate||"")}</strong> · ${money(s.agreed_daily_rate)}/day · ${esc(s.reason)}</div>`}).join("")}</div>`:""}
  `,null,"Close");
  $("#modalForm").onsubmit=e=>{e.preventDefault();$("#modal").close();};
}

function calendarShade(key){
  const palette=["cal-shade-1","cal-shade-2","cal-shade-3","cal-shade-4","cal-shade-5","cal-shade-6"];
  let h=0;for(const ch of String(key||""))h=((h<<5)-h)+ch.charCodeAt(0);
  return palette[Math.abs(h)%palette.length];
}
function filteredCalendarVehicles(){
  const q=(state.calendarSearch||"").trim().toLowerCase();
  const min=state.calendarMinRate===""?null:Number(state.calendarMinRate);
  const max=state.calendarMaxRate===""?null:Number(state.calendarMaxRate);
  const rows=state.vehicles.filter(v=>{
    const hay=`${v.make} ${v.model} ${v.plate} ${v.category} ${v.source}`.toLowerCase();
    const status=effectiveVehicleStatus(v);
    return (!q||hay.includes(q))&&(!state.calendarCategory||String(v.category_id)===String(state.calendarCategory))&&(!state.calendarSource||v.source===state.calendarSource)&&(!state.calendarStatus||status===state.calendarStatus)&&(min===null||Number(v.rate||0)>=min)&&(max===null||Number(v.rate||0)<=max);
  });
  const dir=state.calendarSortDir==="desc"?-1:1;
  rows.sort((a,b)=>{
    let av,bv;
    if(state.calendarSort==="category"){av=a.category||"";bv=b.category||"";}
    else if(state.calendarSort==="price"){av=Number(a.rate||0);bv=Number(b.rate||0);}
    else if(state.calendarSort==="plate"){av=a.plate||"";bv=b.plate||"";}
    else{av=`${a.make} ${a.model}`;bv=`${b.make} ${b.model}`;}
    return typeof av==="number"?(av-bv)*dir:String(av).localeCompare(String(bv))*dir;
  });
  return rows;
}
renderCalendar=function(){
  const start=new Date();start.setHours(0,0,0,0);
  const days=Array.from({length:14},(_,i)=>{const d=new Date(start);d.setDate(d.getDate()+i);return d;});
  const vehicles=filteredCalendarVehicles();
  return `
    <div class="calendar-controls panel"><div class="panel-body">
      <div class="calendar-filter-grid">
        <div class="field"><label>Search Vehicle</label><input id="calSearch" value="${esc(state.calendarSearch)}" placeholder="Make, model or plate"></div>
        <div class="field"><label>Vehicle Type</label><select id="calCategory"><option value="">All Types</option>${state.categories.map(c=>`<option value="${esc(c.id)}" ${String(state.calendarCategory)===String(c.id)?"selected":""}>${esc(c.name)}</option>`).join("")}</select></div>
        <div class="field"><label>Source</label><select id="calSource"><option value="">All Sources</option><option ${state.calendarSource==="Own Fleet"?"selected":""}>Own Fleet</option><option ${state.calendarSource==="External"?"selected":""}>External</option></select></div>
        <div class="field"><label>Status</label><select id="calStatus"><option value="">All Statuses</option>${["Available","Out on Rental","Reserved","Needs Review","Out of Order"].map(s=>`<option ${state.calendarStatus===s?"selected":""}>${s}</option>`).join("")}</select></div>
        <div class="field"><label>Min Price</label><input id="calMinRate" type="number" step="0.01" min="0" value="${esc(state.calendarMinRate)}" placeholder="$0"></div>
        <div class="field"><label>Max Price</label><input id="calMaxRate" type="number" step="0.01" min="0" value="${esc(state.calendarMaxRate)}" placeholder="Any"></div>
        <div class="field"><label>Sort By</label><select id="calSort"><option value="model" ${state.calendarSort==="model"?"selected":""}>Vehicle Name</option><option value="category" ${state.calendarSort==="category"?"selected":""}>Vehicle Type</option><option value="price" ${state.calendarSort==="price"?"selected":""}>Price</option><option value="plate" ${state.calendarSort==="plate"?"selected":""}>Plate</option></select></div>
        <div class="field"><label>Order</label><select id="calSortDir"><option value="asc" ${state.calendarSortDir==="asc"?"selected":""}>Ascending</option><option value="desc" ${state.calendarSortDir==="desc"?"selected":""}>Descending</option></select></div>
      </div>
      <div class="calendar-filter-footer"><span>${vehicles.length} vehicle${vehicles.length===1?"":"s"} shown</span><button class="btn btn-small btn-secondary" id="clearCalendarFilters">Clear Filters</button></div>
    </div></div>
    <div class="panel" style="margin-top:14px"><div class="panel-head"><h3>Fleet Timeline — Next 14 Days</h3><div class="kpi-row"><span class="badge badge-out">Booked</span><span class="vehicle-meta">Colour changes indicate a different renter/booking</span></div></div>
      <div class="panel-body timeline"><div class="timeline-grid">
        <div class="timeline-row header"><div class="timeline-vehicle">Vehicle</div>${days.map(d=>`<div class="timeline-cell">${d.toLocaleDateString("en-AU",{day:"2-digit",month:"short"})}</div>`).join("")}</div>
        ${vehicles.map(v=>`<div class="timeline-row"><div class="timeline-vehicle"><strong>${esc(v.make)} ${esc(v.model)}</strong><br><span>${esc(v.plate||"No plate")}</span><br><span>${esc(v.category)} · ${money(v.rate)}</span></div>
          ${days.map(d=>{const d1=new Date(d),d2=new Date(d);d2.setDate(d2.getDate()+1);const seg=state.segments.find(s=>String(s.vehicle_id)===String(v.id)&&s.end_at&&overlaps(d1,d2,s.start_at,s.end_at));const ag=seg?segmentAgreement(seg):null;return `<div class="timeline-cell">${seg?`<div class="timeline-bar ${calendarShade(ag?.uuid||ag?.customer||seg.rental_agreement_id)}" title="${esc(ag?.customer||"Booked")}">${esc(ag?.customer||"Booked")}</div>`:""}</div>`;}).join("")}
        </div>`).join("")}
      </div></div>
    </div>`;
};

const _b5BindPageEvents079=bindPageEvents;
bindPageEvents=function(){
  _b5BindPageEvents079();

  ["aPickup","aDropoff"].forEach(id=>$("#"+id)?.addEventListener("change",()=>{
    if($("#"+id).value==="__ADD_LOCATION__"){
      $("#"+id).value="Any";
      openAddLocationModal(id);
    }
  }));

  $$("[data-open-rental-details]").forEach(card=>{
    const open=e=>{if(e.target.closest("button"))return;openRentalDetails(card.dataset.openRentalDetails);};
    card.addEventListener("click",open);
    card.addEventListener("keydown",e=>{if((e.key==="Enter"||e.key===" ")&&!e.target.closest("button")){e.preventDefault();openRentalDetails(card.dataset.openRentalDetails);}});
  });

  const calendarInputs={calSearch:"calendarSearch",calCategory:"calendarCategory",calSource:"calendarSource",calStatus:"calendarStatus",calMinRate:"calendarMinRate",calMaxRate:"calendarMaxRate",calSort:"calendarSort",calSortDir:"calendarSortDir"};
  Object.entries(calendarInputs).forEach(([id,key])=>{
    $("#"+id)?.addEventListener(id==="calSearch"||id==="calMinRate"||id==="calMaxRate"?"input":"change",()=>{state[key]=$("#"+id).value;render();});
  });
  $("#clearCalendarFilters")?.addEventListener("click",()=>{
    Object.assign(state,{calendarSearch:"",calendarCategory:"",calendarSource:"",calendarStatus:"",calendarMinRate:"",calendarMaxRate:"",calendarSort:"model",calendarSortDir:"asc"});
    render();
  });
};
