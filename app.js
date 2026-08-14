
const $ = (s, root=document) => root.querySelector(s);
const $$ = (s, root=document) => [...root.querySelectorAll(s)];

const fallback = {
  locations: [
    {id:"local-1",name:"Hasbaya Office",pickup_fee:0,dropoff_fee:0,turnaround_minutes:30},
    {id:"local-2",name:"Beirut Airport",pickup_fee:75,dropoff_fee:75,turnaround_minutes:180},
    {id:"local-3",name:"Beirut",pickup_fee:65,dropoff_fee:65,turnaround_minutes:180},
    {id:"local-4",name:"Saida",pickup_fee:40,dropoff_fee:40,turnaround_minutes:90},
    {id:"local-5",name:"Nabatieh",pickup_fee:25,dropoff_fee:25,turnaround_minutes:60},
  ],
  customers: [],
  suppliers: [],
  vehicles: [],
  rentals: [],
  categories: []
};

const state = {
  page: "dashboard",
  live: false,
  loading: false,
  error: "",
  vehicles: [],
  rentals: [],
  customers: [],
  suppliers: [],
  locations: fallback.locations,
  categories: [],
  segments: [],
  charges: [],
  payments: [],
  bonds: []
};

const pageMeta = {
  dashboard:["Dashboard","Fleet and rental operations at a glance"],
  today:["Today","Returns, pickups, available cars and attention items"],
  availability:["Availability","Find available vehicles, similar options and indicative pricing"],
  rentals:["Rentals","Bookings, active rentals, extensions, swaps and returns"],
  calendar:["Calendar","Visual fleet booking timeline"],
  fleet:["Fleet","Own and external vehicles"],
  customers:["Customers","Customer directory and rental history"],
  suppliers:["Suppliers","Partner companies and external vehicle sources"],
  locations:["Locations & Fees","Pickup, drop-off and transfer pricing"],
  settings:["Settings","System connection and configuration"]
};

function esc(v){
  return String(v ?? "").replace(/[&<>"']/g, m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));
}
function money(n){ return `$${Number(n||0).toFixed(2)}`; }
function dbReady(){ return !!window.db; }
function todayDate(){ return new Date(); }
function sameDay(a,b){ return a && new Date(a).toDateString()===b.toDateString(); }
function fmtDate(iso){
  if(!iso) return "";
  const d=new Date(iso);
  if(Number.isNaN(d.getTime())) return esc(iso);
  return d.toLocaleString("en-AU",{day:"2-digit",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"});
}
function fmtDay(d){ return d.toLocaleDateString("en-AU",{weekday:"long",day:"numeric",month:"long",year:"numeric"}); }
function overlaps(aStart,aEnd,bStart,bEnd){
  const a1=new Date(aStart),a2=new Date(aEnd),b1=new Date(bStart),b2=new Date(bEnd);
  return a1<b2 && a2>b1;
}
function rentalDays(start,end){
  const ms=new Date(end)-new Date(start);
  return Math.max(1,Math.ceil(ms/(1000*60*60*24)));
}
function localInputValue(d){
  const z=n=>String(n).padStart(2,"0");
  return `${d.getFullYear()}-${z(d.getMonth()+1)}-${z(d.getDate())}T${z(d.getHours())}:${z(d.getMinutes())}`;
}
function vehicleById(id){ return state.vehicles.find(v=>String(v.id)===String(id)); }
function customerById(id){ return state.customers.find(v=>String(v.id)===String(id)); }
function locationById(id){ return state.locations.find(v=>String(v.id)===String(id)); }
function supplierById(id){ return state.suppliers.find(v=>String(v.id)===String(id)); }
function agreementByUuid(id){ return state.rentals.find(r=>String(r.uuid)===String(id)); }

function statusClass(s){
  const x=(s||"").toLowerCase();
  if(x.includes("available")) return "badge-available";
  if(x.includes("out of order")||x.includes("maintenance")) return "badge-oos";
  if(x.includes("reserved")||x.includes("confirmed")) return "badge-reserved";
  if(x.includes("out")||x.includes("active")) return "badge-out";
  if(x.includes("complete")) return "badge-available";
  return "badge-reserved";
}

function updateDataMode(){
  const el=$("#dataMode");
  if(!el) return;
  if(state.live){el.textContent="Online";el.className="badge live-status";}
  else if(state.loading){el.textContent="Connecting…";el.className="badge badge-demo";}
  else{el.textContent="Offline";el.className="badge fallback-status";}
}

function normaliseVehicle(row){
  return {
    id:row.id,
    plate:row.plate||"",
    make:row.make||"",
    model:row.model||"",
    year:row.model_year||"",
    color:row.colour||"",
    category:row.vehicle_categories?.name||"Other",
    category_id:row.category_id||null,
    seats:row.seats||5,
    transmission:row.transmission||"Automatic",
    rate:Number(row.standard_daily_rate||0),
    source:row.source_type||"Own Fleet",
    supplier:row.suppliers?.name||null,
    supplier_id:row.supplier_id||null,
    db_status:row.operational_status||"Available",
    long_term:!!row.long_term_contract,
    notes:row.notes||""
  };
}

function currentSegmentForVehicle(vehicleId){
  const now=new Date();
  return state.segments.find(s=>String(s.vehicle_id)===String(vehicleId) && s.end_at && new Date(s.start_at)<=now && new Date(s.end_at)>now);
}
function nextSegmentForVehicle(vehicleId){
  const now=new Date();
  return state.segments
    .filter(s=>String(s.vehicle_id)===String(vehicleId) && new Date(s.start_at)>now)
    .sort((a,b)=>new Date(a.start_at)-new Date(b.start_at))[0];
}
function effectiveVehicleStatus(v){
  if(["Out of Order","Maintenance","Inactive"].includes(v.db_status)) return v.db_status;
  if(currentSegmentForVehicle(v.id)) return "Out on Rental";
  if(nextSegmentForVehicle(v.id)) return "Reserved";
  return "Available";
}
function segmentAgreement(segment){
  return state.rentals.find(r=>String(r.uuid)===String(segment.rental_agreement_id));
}

function rebuildRentals(agreements,segments){
  return agreements.map(a=>{
    const segs=segments.filter(s=>String(s.rental_agreement_id)===String(a.id)).sort((x,y)=>new Date(x.start_at)-new Date(y.start_at));
    const first=segs[0],last=segs[segs.length-1];
    const c=customerById(a.customer_id);
    const pu=locationById(a.pickup_location_id);
    const dr=locationById(a.expected_dropoff_location_id);
    return {
      id:a.agreement_number||String(a.id).slice(0,8),
      uuid:a.id,
      customer_id:a.customer_id,
      customer:c?.name||c?.full_name||"Customer",
      vehicle_id:last?.vehicle_id||first?.vehicle_id||null,
      first_vehicle_id:first?.vehicle_id||null,
      start:first?.start_at||a.original_pickup_at,
      end:last?.end_at||a.expected_final_return_at,
      pickup:pu?.name||"Any",
      dropoff:dr?.name||"Any",
      pickup_location_id:a.pickup_location_id,
      dropoff_location_id:a.expected_dropoff_location_id,
      rate:Number(last?.agreed_daily_rate||first?.agreed_daily_rate||0),
      status:a.status||"Reserved",
      guarantee:a.guarantee_type||"Specific Vehicle",
      segments:segs,
      notes:a.notes||""
    };
  });
}

async function loadSupabaseData(){
  if(!dbReady()){
    state.live=false;
    state.error="Supabase client unavailable.";
    updateDataMode();render();return;
  }
  state.loading=true;state.error="";updateDataMode();

  try{
    const [categoriesRes,suppliersRes,locationsRes,customersRes,vehiclesRes,agreementsRes,segmentsRes,chargesRes,paymentsRes,bondsRes]
    =await Promise.all([
      window.db.from("vehicle_categories").select("*").order("name"),
      window.db.from("suppliers").select("*").eq("active",true).order("name"),
      window.db.from("locations").select("*").eq("active",true).order("name"),
      window.db.from("customers").select("*").order("full_name"),
      window.db.from("vehicles").select("*, vehicle_categories(name), suppliers(name)").eq("active",true).order("model"),
      window.db.from("rental_agreements").select("*").order("original_pickup_at",{ascending:false}),
      window.db.from("rental_segments").select("*").order("start_at",{ascending:true}),
      window.db.from("rental_charges").select("*"),
      window.db.from("payments").select("*"),
      window.db.from("security_bonds").select("*")
    ]);

    const responses=[categoriesRes,suppliersRes,locationsRes,customersRes,vehiclesRes,agreementsRes,segmentsRes,chargesRes,paymentsRes,bondsRes];
    const err=responses.find(r=>r.error)?.error;
    if(err) throw err;

    state.categories=categoriesRes.data||[];
    state.suppliers=suppliersRes.data||[];
    state.locations=locationsRes.data||[];
    state.customers=(customersRes.data||[]).map(c=>({...c,name:c.full_name,phone:c.mobile}));
    state.vehicles=(vehiclesRes.data||[]).map(normaliseVehicle);
    state.segments=segmentsRes.data||[];
    state.charges=chargesRes.data||[];
    state.payments=paymentsRes.data||[];
    state.bonds=bondsRes.data||[];
    state.rentals=rebuildRentals(agreementsRes.data||[],state.segments);
    state.live=true;
  }catch(err){
    console.error(err);
    state.live=false;
    state.error=err?.message||"Could not load Supabase data.";
  }finally{
    state.loading=false;updateDataMode();render();
  }
}

function render(){
  const [title,sub]=pageMeta[state.page];
  $("#pageTitle").textContent=title;
  $("#pageSubtitle").textContent=sub;
  $$(".nav-btn").forEach(b=>b.classList.toggle("active",b.dataset.page===state.page));
  updateDataMode();
  const map={
    dashboard:renderDashboard,today:renderToday,availability:renderAvailability,
    rentals:renderRentals,calendar:renderCalendar,fleet:renderFleet,
    customers:renderCustomers,suppliers:renderSuppliers,locations:renderLocations,
    settings:renderSettings
  };
  $("#content").innerHTML=(state.error?`<div class="alert">${esc(state.error)}</div>`:"")+map[state.page]();
  bindPageEvents();
}

function stat(label,value,sub){
  return `<div class="stat"><div class="label">${esc(label)}</div><div class="value">${esc(value)}</div><div class="sub">${esc(sub)}</div></div>`;
}

function renderDashboard(){
  const now=todayDate();
  const available=state.vehicles.filter(v=>effectiveVehicleStatus(v)==="Available").length;
  const out=state.vehicles.filter(v=>effectiveVehicleStatus(v)==="Out on Rental").length;
  const reserved=state.vehicles.filter(v=>effectiveVehicleStatus(v)==="Reserved").length;
  const external=state.vehicles.filter(v=>v.source==="External").length;
  const oos=state.vehicles.filter(v=>["Out of Order","Maintenance"].includes(effectiveVehicleStatus(v))).length;
  const returnsToday=state.rentals.filter(r=>["Active","Confirmed","Reserved"].includes(r.status)&&sameDay(r.end,now));
  const pickupsToday=state.rentals.filter(r=>["Reserved","Confirmed"].includes(r.status)&&sameDay(r.start,now));
  const overdue=state.rentals.filter(r=>r.status==="Active"&&new Date(r.end)<now);

  return `
    <div class="grid stats">
      ${stat("Total Fleet",state.vehicles.length,"Own + external")}
      ${stat("Available Now",available,"Ready to rent")}
      ${stat("Out on Rental",out,"Currently away")}
      ${stat("Reserved",reserved,"Future bookings")}
      ${stat("Returning Today",returnsToday.length,"Expected returns")}
      ${stat("Going Out Today",pickupsToday.length,"Today's pickups")}
      ${stat("External Vehicles",external,"Partner-sourced")}
      ${stat("Out of Order",oos,"Unavailable")}
    </div>

    ${overdue.length?`<div class="alert"><strong>${overdue.length} overdue rental${overdue.length>1?"s":""}</strong> require attention.</div>`:""}

    <div class="grid two-col">
      <div class="panel">
        <div class="panel-head"><h2>Today's Returns</h2><button class="btn btn-small btn-secondary" data-goto="today">View Today</button></div>
        <div class="table-wrap">${rentalTable(returnsToday)}</div>
      </div>
      <div class="panel">
        <div class="panel-head"><h2>Today's Pickups</h2></div>
        <div class="table-wrap">${rentalTable(pickupsToday)}</div>
      </div>
    </div>

    <div class="panel" style="margin-top:14px">
      <div class="panel-head">
        <h2>Upcoming Rentals</h2>
        <div class="toolbar">
          <button class="btn btn-small btn-primary" data-goto="availability">Check Availability</button>
          <button class="btn btn-small btn-secondary" data-goto="rentals">Manage Rentals</button>
        </div>
      </div>
      <div class="table-wrap">${rentalTable([...state.rentals].filter(r=>!["Completed","Cancelled"].includes(r.status)).sort((a,b)=>new Date(a.start)-new Date(b.start)).slice(0,10))}</div>
    </div>`;
}

function rentalTable(rows){
  if(!rows.length) return `<div class="empty">Nothing scheduled.</div>`;
  return `<table>
    <thead><tr><th>Rental</th><th>Vehicle</th><th>Customer</th><th>Pickup</th><th>Return</th><th>Status</th></tr></thead>
    <tbody>${rows.map(r=>{
      const v=vehicleById(r.vehicle_id);
      return `<tr>
        <td data-label="Rental">#${esc(r.id)}</td>
        <td data-label="Vehicle">${v?`${esc(v.make)} ${esc(v.model)} · ${esc(v.plate)}`:"Unassigned"}</td>
        <td data-label="Customer">${esc(r.customer)}</td>
        <td data-label="Pickup">${fmtDate(r.start)} · ${esc(r.pickup)}</td>
        <td data-label="Return">${fmtDate(r.end)} · ${esc(r.dropoff)}</td>
        <td data-label="Status"><span class="badge ${statusClass(r.status)}">${esc(r.status)}</span></td>
      </tr>`;
    }).join("")}</tbody></table>`;
}

function renderToday(){
  const today=todayDate();
  const ret=state.rentals.filter(r=>!["Completed","Cancelled"].includes(r.status)&&sameDay(r.end,today));
  const pick=state.rentals.filter(r=>["Reserved","Confirmed"].includes(r.status)&&sameDay(r.start,today));
  const avail=state.vehicles.filter(v=>effectiveVehicleStatus(v)==="Available");
  const external=state.vehicles.filter(v=>v.source==="External"&&effectiveVehicleStatus(v)!=="Available");
  return `
    <div class="section-title"><div><h2>${esc(fmtDay(today))}</h2><p>Daily operations view</p></div></div>
    <div class="grid two-col">
      <div class="panel"><div class="panel-head"><h3>Returns Today</h3><span class="badge badge-out">${ret.length}</span></div><div class="table-wrap">${rentalTable(ret)}</div></div>
      <div class="panel"><div class="panel-head"><h3>Pickups Today</h3><span class="badge badge-reserved">${pick.length}</span></div><div class="table-wrap">${rentalTable(pick)}</div></div>
    </div>
    <div class="grid two-col" style="margin-top:14px">
      <div class="panel"><div class="panel-head"><h3>Vehicles Available in Office</h3><span class="badge badge-available">${avail.length}</span></div>
        <div class="panel-body"><div class="kpi-row">${avail.slice(0,50).map(v=>`<span class="badge badge-available">${esc(v.model)} · ${esc(v.plate)}</span>`).join("")}</div></div>
      </div>
      <div class="panel"><div class="panel-head"><h3>External Vehicles Requiring Action</h3></div><div class="panel-body">
        ${external.length?external.slice(0,20).map(v=>`<div class="note" style="margin-bottom:8px"><strong>${esc(v.make)} ${esc(v.model)}</strong> · ${esc(v.plate)}<br>Supplier: ${esc(v.supplier||"Unknown")} · ${esc(effectiveVehicleStatus(v))}</div>`).join(""):`<div class="empty">No external action items.</div>`}
      </div></div>
    </div>`;
}

function anyLocationOptions(selected="Any"){
  return `<option value="Any" ${selected==="Any"?"selected":""}>Any</option>`+
    state.locations.map(l=>`<option value="${esc(l.id)}" ${String(l.id)===String(selected)?"selected":""}>${esc(l.name)}</option>`).join("");
}
function locationOptions(selectedId=""){
  return state.locations.map(l=>`<option value="${esc(l.id)}" ${String(l.id)===String(selectedId)?"selected":""}>${esc(l.name)}</option>`).join("");
}
function categoryOptions(selected=""){
  return `<option value="">Any</option>`+
    state.categories.map(c=>`<option value="${esc(c.id)}" ${String(c.id)===String(selected)?"selected":""}>${esc(c.name)}</option>`).join("");
}

function segmentConflict(vehicleId,start,end,excludeSegmentId=null){
  return state.segments.some(s=>
    String(s.vehicle_id)===String(vehicleId) &&
    String(s.id)!==String(excludeSegmentId||"") &&
    s.end_at &&
    overlaps(start,end,s.start_at,s.end_at)
  );
}
function vehicleIsAvailable(vehicleId,start,end,excludeSegmentId=null){
  const v=vehicleById(vehicleId);
  if(!v||["Out of Order","Maintenance","Inactive"].includes(v.db_status)) return false;
  return !segmentConflict(vehicleId,start,end,excludeSegmentId);
}
function similarScore(requested,candidate){
  let score=0;
  if(!requested||!candidate) return 0;
  if(candidate.category===requested.category) score+=10;
  if(candidate.seats===requested.seats) score+=3;
  if(candidate.transmission===requested.transmission) score+=3;
  const rateDiff=Math.abs(Number(candidate.rate||0)-Number(requested.rate||0));
  score+=Math.max(0,5-Math.min(5,rateDiff/10));
  return score;
}
function suggestVehicles(requestedVehicleId,start,end,categoryId="",limit=8){
  const requested=vehicleById(requestedVehicleId);
  return state.vehicles
    .filter(v=>String(v.id)!==String(requestedVehicleId)&&vehicleIsAvailable(v.id,start,end))
    .filter(v=>!categoryId||String(v.category_id)===String(categoryId)||v.category===requested?.category)
    .map(v=>({...v,_score:similarScore(requested,v)}))
    .sort((a,b)=>b._score-a._score||Number(a.rate||0)-Number(b.rate||0))
    .slice(0,limit);
}

function pricingFor(vehicle,start,end,pickupId,dropoffId,discount=0,other=0,deposit=0){
  const days=rentalDays(start,end);
  const base=days*Number(vehicle?.rate||0);
  const pickup=pickupId&&pickupId!=="Any"?Number(locationById(pickupId)?.pickup_fee||0):0;
  const dropoff=dropoffId&&dropoffId!=="Any"?Number(locationById(dropoffId)?.dropoff_fee||0):0;
  const total=Math.max(0,base+pickup+dropoff+Number(other||0)-Number(discount||0));
  return {days,base,pickup,dropoff,discount:Number(discount||0),other:Number(other||0),total,deposit:Number(deposit||0),balance:Math.max(0,total-Number(deposit||0))};
}
function pricingHtml(p){
  return `<div class="price-summary">
    <div class="price-line"><span>Rental (${p.days} day${p.days===1?"":"s"})</span><strong>${money(p.base)}</strong></div>
    <div class="price-line"><span>Pickup fee</span><strong>${money(p.pickup)}</strong></div>
    <div class="price-line"><span>Drop-off fee</span><strong>${money(p.dropoff)}</strong></div>
    <div class="price-line"><span>Other charges</span><strong>${money(p.other)}</strong></div>
    <div class="price-line"><span>Discount</span><strong>-${money(p.discount)}</strong></div>
    <div class="price-line total"><span>Indicative total</span><strong>${money(p.total)}</strong></div>
    <div class="price-line"><span>Deposit paid</span><strong>${money(p.deposit)}</strong></div>
    <div class="price-line balance"><span>Indicative balance</span><strong>${money(p.balance)}</strong></div>
  </div>`;
}

function renderAvailability(){
  const start=new Date();start.setDate(start.getDate()+1);start.setHours(10,0,0,0);
  const end=new Date(start);end.setDate(end.getDate()+7);end.setHours(17,0,0,0);
  const ds=d=>localInputValue(d).slice(0,10), ts=d=>localInputValue(d).slice(11,16);
  return `
    <div class="filters">
      <div class="field"><label>Pickup Date</label><input id="aStartDate" type="date" value="${ds(start)}"></div>
      <div class="field"><label>Pickup Time</label><input id="aStartTime" type="time" value="${ts(start)}"></div>
      <div class="field"><label>Pickup Location</label><select id="aPickup">${anyLocationOptions("Any")}</select></div>
      <div class="field"><label>Return Date</label><input id="aEndDate" type="date" value="${ds(end)}"></div>
      <div class="field"><label>Return Time</label><input id="aEndTime" type="time" value="${ts(end)}"></div>
      <div class="field"><label>Drop-off Location</label><select id="aDropoff">${anyLocationOptions("Any")}</select></div>
      <div class="field"><label>Category</label><select id="aCategory">${categoryOptions("")}</select></div>
      <div class="field"><label>Seats</label><select id="aSeats"><option value="">Any</option><option>5</option><option>7</option></select></div>
      <div class="field"><label>Transmission</label><select id="aTrans"><option value="">Any</option><option>Automatic</option><option>Manual</option></select></div>
      <div class="field" style="display:flex;align-items:end"><button id="searchAvailability" class="btn btn-primary" style="width:100%">Search Availability</button></div>
    </div>
    <div id="availabilityResults"><div class="panel"><div class="panel-body"><div class="note">Search the full date/time range. Results are grouped into own fleet, similar/upgrade options and external partner vehicles.</div></div></div></div>`;
}

function availabilitySearch(){
  const start=`${$("#aStartDate").value}T${$("#aStartTime").value}`;
  const end=`${$("#aEndDate").value}T${$("#aEndTime").value}`;
  const pickup=$("#aPickup").value,dropoff=$("#aDropoff").value;
  const categoryId=$("#aCategory").value,seats=$("#aSeats").value,trans=$("#aTrans").value;
  if(new Date(end)<=new Date(start)){ $("#availabilityResults").innerHTML=`<div class="alert">Return must be after pickup.</div>`; return; }

  let candidates=state.vehicles.filter(v=>vehicleIsAvailable(v.id,start,end));
  if(categoryId) candidates=candidates.filter(v=>String(v.category_id)===String(categoryId));
  if(seats) candidates=candidates.filter(v=>String(v.seats)===String(seats));
  if(trans) candidates=candidates.filter(v=>v.transmission===trans);

  const own=candidates.filter(v=>v.source==="Own Fleet");
  const external=candidates.filter(v=>v.source==="External");

  const requestedCategory=state.categories.find(c=>String(c.id)===String(categoryId))?.name||"";
  const upgrades=!categoryId?[]:state.vehicles.filter(v=>
    vehicleIsAvailable(v.id,start,end) &&
    v.source==="Own Fleet" &&
    String(v.category_id)!==String(categoryId) &&
    Number(v.rate||0)>0
  ).sort((a,b)=>Number(a.rate||0)-Number(b.rate||0)).slice(0,8);

  $("#availabilityResults").innerHTML=
    availabilityGroup("Available — Own Fleet",own,start,end,pickup,dropoff)+
    availabilityGroup(requestedCategory?`Alternative / Upgrade Options`:"Alternative Options",upgrades,start,end,pickup,dropoff)+
    availabilityGroup("External / Partner Vehicles",external,start,end,pickup,dropoff);
}

function availabilityGroup(title,rows,start,end,pickup,dropoff){
  return `<div class="panel result-section">
    <div class="panel-head"><h3>${esc(title)}</h3><span class="badge badge-available">${rows.length}</span></div>
    <div class="panel-body">
      ${rows.length?`<div class="vehicle-grid">${rows.slice(0,24).map(v=>{
        const p=pricingFor(v,start,end,pickup,dropoff);
        return `<div class="vehicle-card">
          <div class="kpi-row">
            <span class="badge ${v.source==="External"?"badge-external":"badge-available"}">${esc(v.source)}</span>
            ${v.supplier?`<span class="badge badge-external">${esc(v.supplier)}</span>`:""}
          </div>
          <h3 style="margin-top:10px">${esc(v.make)} ${esc(v.model)}</h3>
          <div class="vehicle-meta">${esc(v.plate||"Plate not recorded")} · ${esc(v.category)} · ${esc(v.seats)} seats · ${esc(v.transmission)}</div>
          <div class="vehicle-rate">${Number(v.rate)>0?`${money(v.rate)}/day`:"Rate not loaded"}</div>
          <div class="vehicle-meta">Indicative: ${Number(v.rate)>0?money(p.total):"Rate required"}</div>
          <div class="card-actions">
            <button class="btn btn-primary btn-small" data-book-vehicle="${esc(v.id)}" data-start="${esc(start)}" data-end="${esc(end)}" data-pickup="${esc(pickup)}" data-dropoff="${esc(dropoff)}">Book</button>
          </div>
        </div>`;
      }).join("")}</div>`:`<div class="empty">No matching vehicles.</div>`}
    </div></div>`;
}

function rentalFinancials(rentalUuid){
  const charges=state.charges.filter(x=>String(x.rental_agreement_id)===String(rentalUuid));
  const payments=state.payments.filter(x=>String(x.rental_agreement_id)===String(rentalUuid));
  const bond=state.bonds.find(x=>String(x.rental_agreement_id)===String(rentalUuid));
  const chargeTotal=charges.reduce((s,x)=>s+Number(x.amount||0),0);
  const paymentTotal=payments.reduce((s,x)=>s+Number(x.amount||0),0);
  return {chargeTotal,paymentTotal,balance:chargeTotal-paymentTotal,bond};
}

function renderRentals(){
  const active=state.rentals.filter(r=>["Active","Confirmed","Reserved"].includes(r.status));
  const completed=state.rentals.filter(r=>r.status==="Completed");
  return `
    <div class="section-title">
      <div><h2>Rental Agreements</h2><p>Bookings, pricing, extensions, swaps and returns</p></div>
      <button class="btn btn-primary" id="newRentalBtn">New Rental</button>
    </div>
    <div class="kpi-mini">
      ${stat("Active / Reserved",active.length,"Open agreements")}
      ${stat("Completed",completed.length,"Historical")}
      ${stat("Rental Segments",state.segments.length,"Vehicle periods")}
      ${stat("Payments",state.payments.length,"Recorded")}
    </div>
    <div class="grid two-col">
      <div class="panel">
        <div class="panel-head"><h3>Open Rentals</h3></div>
        <div class="panel-body">
          ${active.length?active.map(r=>rentalCard(r)).join(""):`<div class="empty">No open rentals.</div>`}
        </div>
      </div>
      <div class="panel">
        <div class="panel-head"><h3>Completed</h3></div>
        <div class="panel-body">
          ${completed.length?completed.slice(0,12).map(r=>rentalCard(r,true)).join(""):`<div class="empty">No completed rentals yet.</div>`}
        </div>
      </div>
    </div>`;
}

function rentalCard(r,readOnly=false){
  const v=vehicleById(r.vehicle_id);
  const f=rentalFinancials(r.uuid);
  return `<div class="rental-card" style="margin-bottom:12px">
    <div class="kpi-row"><span class="badge ${statusClass(r.status)}">${esc(r.status)}</span><span class="badge badge-reserved">${esc(r.guarantee)}</span></div>
    <h3>#${esc(r.id)} · ${esc(r.customer)}</h3>
    <div class="subline">${v?`${esc(v.make)} ${esc(v.model)} · ${esc(v.plate)}`:"Unassigned"}</div>
    <div class="subline">${fmtDate(r.start)} → ${fmtDate(r.end)}</div>
    <div class="subline">${esc(r.pickup)} → ${esc(r.dropoff)}</div>
    ${r.segments.length>1?`<div class="segment-list">${r.segments.map(s=>{const sv=vehicleById(s.vehicle_id);return `<div class="segment-item">${fmtDate(s.start_at)} → ${fmtDate(s.end_at)}<br><strong>${esc(sv?.model||"Vehicle")} · ${esc(sv?.plate||"")}</strong> · ${money(s.agreed_daily_rate)}/day · ${esc(s.reason)}</div>`}).join("")}</div>`:""}
    <div class="subline" style="margin-top:8px">Charges: ${money(f.chargeTotal)} · Payments: ${money(f.paymentTotal)} · Balance: ${money(f.balance)}</div>
    ${!readOnly?`<div class="actions">
      <button class="btn btn-secondary btn-small" data-extend="${esc(r.uuid)}">Extend</button>
      <button class="btn btn-secondary btn-small" data-swap="${esc(r.uuid)}">Change Vehicle</button>
      <button class="btn btn-secondary btn-small" data-payment="${esc(r.uuid)}">Record Payment</button>
      <button class="btn btn-primary btn-small" data-return="${esc(r.uuid)}">Return Vehicle</button>
    </div>`:""}
  </div>`;
}

function renderCalendar(){
  const start=new Date();start.setHours(0,0,0,0);
  const days=Array.from({length:14},(_,i)=>{const d=new Date(start);d.setDate(d.getDate()+i);return d;});
  return `<div class="panel">
    <div class="panel-head"><h3>Fleet Timeline — Next 14 Days</h3><div class="kpi-row"><span class="badge badge-out">Booked</span><span class="badge badge-available">Available gaps</span></div></div>
    <div class="panel-body timeline"><div class="timeline-grid">
      <div class="timeline-row header"><div class="timeline-vehicle">Vehicle</div>${days.map(d=>`<div class="timeline-cell">${d.toLocaleDateString("en-AU",{day:"2-digit",month:"short"})}</div>`).join("")}</div>
      ${state.vehicles.slice(0,50).map(v=>`<div class="timeline-row">
        <div class="timeline-vehicle">${esc(v.model)}<br><span style="font-weight:400;color:#718096">${esc(v.plate)}</span></div>
        ${days.map(d=>{
          const d1=new Date(d),d2=new Date(d);d2.setDate(d2.getDate()+1);
          const seg=state.segments.find(s=>String(s.vehicle_id)===String(v.id)&&s.end_at&&overlaps(d1,d2,s.start_at,s.end_at));
          const ag=seg?segmentAgreement(seg):null;
          return `<div class="timeline-cell">${seg?`<div class="timeline-bar" title="${esc(ag?.customer||"Booked")}">${esc(ag?.customer||"Booked")}</div>`:""}</div>`;
        }).join("")}
      </div>`).join("")}
    </div></div></div>`;
}

function renderFleet(){
  return `<div class="section-title"><div><h2>Fleet Board</h2><p>Live availability derived from rental segments</p></div><button class="btn btn-primary" id="newVehicleBtn">Add Vehicle</button></div>
    <div class="vehicle-grid">${state.vehicles.map(v=>{
      const status=effectiveVehicleStatus(v),current=currentSegmentForVehicle(v.id),next=nextSegmentForVehicle(v.id);
      const currentAg=current?segmentAgreement(current):null,nextAg=next?segmentAgreement(next):null;
      return `<div class="vehicle-card">
        <div class="kpi-row"><span class="badge ${statusClass(status)}">${esc(status)}</span><span class="badge ${v.source==="External"?"badge-external":"badge-available"}">${esc(v.source)}</span></div>
        <h3 style="margin-top:10px">${esc(v.make)} ${esc(v.model)}</h3>
        <div class="vehicle-meta">${esc(v.plate||"Plate not recorded")} · ${esc(v.color||"Colour not recorded")} · ${esc(v.category)}<br>${esc(v.seats)} seats · ${esc(v.transmission)}</div>
        <div class="vehicle-rate">${Number(v.rate)>0?`${money(v.rate)}/day`:"Rate not loaded"}</div>
        ${currentAg?`<div class="vehicle-meta">Current: <strong>${esc(currentAg.customer)}</strong><br>Return: ${fmtDate(current.end_at)}</div>`:""}
        ${nextAg?`<div class="vehicle-meta" style="margin-top:6px">Next: ${esc(nextAg.customer)} · ${fmtDate(next.start_at)}</div>`:""}
        ${v.supplier?`<div class="vehicle-meta">Supplier: <strong>${esc(v.supplier)}</strong></div>`:""}
      </div>`;
    }).join("")}</div>`;
}

function renderCustomers(){
  return `<div class="section-title"><div><h2>Customers</h2><p>Reusable customer records</p></div><button class="btn btn-primary" id="newCustomerBtn">Add Customer</button></div>
    <div class="panel"><div class="table-wrap"><table>
      <thead><tr><th>Name</th><th>Phone</th><th>Open Rentals</th></tr></thead>
      <tbody>${state.customers.map(c=>`<tr>
        <td data-label="Name">${esc(c.name||c.full_name)}</td>
        <td data-label="Phone">${esc(c.phone||c.mobile||"")}</td>
        <td data-label="Open Rentals">${state.rentals.filter(r=>String(r.customer_id)===String(c.id)&&["Active","Reserved","Confirmed"].includes(r.status)).length}</td>
      </tr>`).join("")}</tbody>
    </table></div></div>`;
}
function renderSuppliers(){
  return `<div class="section-title"><div><h2>Suppliers / Partner Companies</h2><p>External vehicle sources</p></div></div>
    <div class="vehicle-grid">${state.suppliers.map(s=>`<div class="vehicle-card"><h3>${esc(s.name)}</h3><div class="vehicle-meta">${esc(s.phone||"")}</div><div class="vehicle-rate">${state.vehicles.filter(v=>String(v.supplier_id)===String(s.id)).length}</div><div class="vehicle-meta">vehicles currently in fleet list</div></div>`).join("")}</div>`;
}
function renderLocations(){
  return `<div class="section-title"><div><h2>Locations & Fees</h2><p>Pickup, drop-off and transfer pricing</p></div></div>
    <div class="panel"><div class="table-wrap"><table>
      <thead><tr><th>Location</th><th>Pickup Fee</th><th>Drop-off Fee</th><th>Transfer Buffer</th></tr></thead>
      <tbody>${state.locations.map(l=>`<tr><td data-label="Location">${esc(l.name)}</td><td data-label="Pickup">${money(l.pickup_fee)}</td><td data-label="Drop-off">${money(l.dropoff_fee)}</td><td data-label="Buffer">${esc(l.turnaround_minutes||0)} mins</td></tr>`).join("")}</tbody>
    </table></div></div>`;
}
function renderSettings(){
  return `<div class="grid two-col">
    <div class="panel"><div class="panel-head"><h3>Supabase Connection</h3></div><div class="panel-body">
      <p><strong>Status:</strong> ${state.live?'<span class="badge live-status">Online</span>':'<span class="badge fallback-status">Offline</span>'}</p>
      <button class="btn btn-secondary" id="refreshSupabase">Refresh Live Data</button>
    </div></div>
    <div class="panel"><div class="panel-head"><h3>Demo Status</h3></div><div class="panel-body">
      <p class="note">V6.0 includes live booking, conflict checking, pricing, similar vehicle suggestions, extensions, vehicle swaps/upgrades, payments, returns and the improved calendar/dashboard.</p>
    </div></div>
  </div>`;
}

function openModal(title,body,onSave,saveText="Save"){
  $("#modalTitle").textContent=title;
  $("#modalBody").innerHTML=body;
  $("#modalSave").textContent=saveText;
  const dlg=$("#modal");dlg.showModal();
  $("#modalForm").onsubmit=async(e)=>{
    e.preventDefault();
    const save=$("#modalSave");save.disabled=true;const old=save.textContent;save.textContent="Saving…";
    try{const ok=onSave?await onSave():true;if(ok===false)return;dlg.close();}
    finally{save.disabled=false;save.textContent=old;}
  };
}

function bookingModal(prefill={}){
  const s=prefill.start?new Date(prefill.start):new Date();
  if(!prefill.start){s.setDate(s.getDate()+1);s.setHours(10,0,0,0);}
  const e=prefill.end?new Date(prefill.end):new Date(s);
  if(!prefill.end)e.setDate(e.getDate()+7);
  const selectedVehicle=prefill.vehicleId||"";
  openModal("New Rental / Booking",`
    <div class="grid two-col">
      <div class="field"><label>Customer</label>
        <select id="rCustomer">
          <option value="">Select customer</option>
          ${state.customers.map(c=>`<option value="${esc(c.id)}">${esc(c.name||c.full_name)}</option>`).join("")}
          <option value="__CREATE_NEW__">＋ Create new customer…</option>
        </select>
      </div>
      <div class="field"><label>Vehicle</label><select id="rVehicle"><option value="">Select vehicle</option>${state.vehicles.filter(v=>!["Out of Order","Maintenance"].includes(v.db_status)).map(v=>`<option value="${esc(v.id)}" ${String(v.id)===String(selectedVehicle)?"selected":""}>${esc(v.make)} ${esc(v.model)} · ${esc(v.plate)}</option>`).join("")}</select></div>
      <div class="field"><label>Pickup Date/Time</label><input id="rStart" type="datetime-local" value="${localInputValue(s)}"></div>
      <div class="field"><label>Return Date/Time</label><input id="rEnd" type="datetime-local" value="${localInputValue(e)}"></div>
      <div class="field"><label>Pickup Location</label><select id="rPickup"><option value="Any">Any</option>${locationOptions(prefill.pickup||"")}</select></div>
      <div class="field"><label>Drop-off Location</label><select id="rDropoff"><option value="Any">Any</option>${locationOptions(prefill.dropoff||"")}</select></div>
      <div class="field"><label>Agreed Daily Rate</label><input id="rRate" type="number" step="0.01" min="0"></div>
      <div class="field"><label>Guarantee</label><select id="rGuarantee"><option>Specific Vehicle</option><option>Vehicle or Similar</option></select></div>
      <div class="field"><label>Discount</label><input id="rDiscount" type="number" step="0.01" min="0" value="0"></div>
      <div class="field"><label>Other Charges</label><input id="rOther" type="number" step="0.01" min="0" value="0"></div>
      <div class="field"><label>Deposit / Down Payment</label><input id="rDeposit" type="number" step="0.01" min="0" value="0"></div>
      <div class="field"><label>Security Bond</label><input id="rBond" type="number" step="0.01" min="0" value="0"></div>
    </div>
    <div id="rConflict"></div>
    <div id="rPricing"></div>`, saveRentalAgreement, "Create Booking");

  const refresh=()=>{
    const v=vehicleById($("#rVehicle").value);
    if(v&&document.activeElement!==$("#rRate")&&(!$("#rRate").value||Number($("#rRate").value)===0)) $("#rRate").value=Number(v.rate||0);
    const start=$("#rStart").value,end=$("#rEnd").value;
    if(!v||!start||!end||new Date(end)<=new Date(start)){ $("#rPricing").innerHTML="";return; }
    const requestedRate=Number($("#rRate").value||v.rate||0);
    const vp={...v,rate:requestedRate};
    const p=pricingFor(vp,start,end,$("#rPickup").value,$("#rDropoff").value,$("#rDiscount").value,$("#rOther").value,$("#rDeposit").value);
    $("#rPricing").innerHTML=pricingHtml(p);
    if(segmentConflict(v.id,start,end)){
      const sims=suggestVehicles(v.id,start,end,v.category_id,5);
      $("#rConflict").innerHTML=`<div class="conflict-box"><strong>Vehicle conflict detected.</strong><br>This vehicle overlaps another rental.${sims.length?`<br><br><strong>Available alternatives:</strong><br>${sims.map(x=>`${esc(x.make)} ${esc(x.model)} · ${esc(x.plate)}`).join("<br>")}`:""}</div>`;
    }else{
      $("#rConflict").innerHTML=`<div class="ok-box">Vehicle is available for this complete period.</div>`;
    }
  };
  $("#rCustomer")?.addEventListener("change",async()=>{
    if($("#rCustomer").value!=="__CREATE_NEW__") return;
    const fullName=prompt("New customer name:");
    if(!fullName){ $("#rCustomer").value=""; return; }
    const mobile=prompt("Mobile number (optional):")||null;
    const {data,error}=await window.db.from("customers").insert({full_name:fullName.trim(),mobile}).select().single();
    if(error){ alert(error.message); $("#rCustomer").value=""; return; }
    state.customers.push({...data,name:data.full_name,phone:data.mobile});
    const sel=$("#rCustomer");
    const opt=document.createElement("option");
    opt.value=data.id; opt.textContent=data.full_name;
    sel.insertBefore(opt,sel.querySelector('option[value="__CREATE_NEW__"]'));
    sel.value=data.id;
  });
  ["rVehicle","rStart","rEnd","rPickup","rDropoff","rRate","rDiscount","rOther","rDeposit"].forEach(id=>$("#"+id)?.addEventListener("input",refresh));
  if(selectedVehicle){const v=vehicleById(selectedVehicle);$("#rRate").value=Number(v?.rate||0);}
  refresh();
}

async function saveRentalAgreement(){
  if(!state.live){alert("Supabase is not live.");return false;}
  const customerId=$("#rCustomer").value,vehicleId=$("#rVehicle").value,start=$("#rStart").value,end=$("#rEnd").value;
  if(!customerId||customerId==="__CREATE_NEW__"||!vehicleId){alert("Select a customer and vehicle.");return false;}
  if(new Date(end)<=new Date(start)){alert("Return must be after pickup.");return false;}
  if(segmentConflict(vehicleId,start,end)){alert("This vehicle conflicts with another booking. Choose one of the available alternatives.");return false;}
  const vehicle=vehicleById(vehicleId);
  const rate=Number($("#rRate").value||vehicle?.rate||0);
  const pickupId=$("#rPickup").value==="Any"?null:$("#rPickup").value;
  const dropoffId=$("#rDropoff").value==="Any"?null:$("#rDropoff").value;
  const p=pricingFor({...vehicle,rate},start,end,pickupId,dropoffId,$("#rDiscount").value,$("#rOther").value,$("#rDeposit").value);

  const {data:agreement,error:aErr}=await window.db.from("rental_agreements").insert({
    customer_id:customerId,
    original_pickup_at:new Date(start).toISOString(),
    expected_final_return_at:new Date(end).toISOString(),
    pickup_location_id:pickupId,
    expected_dropoff_location_id:dropoffId,
    guarantee_type:$("#rGuarantee").value,
    status:"Reserved"
  }).select().single();
  if(aErr){alert(aErr.message);return false;}

  const {error:sErr}=await window.db.from("rental_segments").insert({
    rental_agreement_id:agreement.id,
    vehicle_id:vehicleId,
    start_at:new Date(start).toISOString(),
    end_at:new Date(end).toISOString(),
    agreed_daily_rate:rate,
    standard_daily_rate_snapshot:Number(vehicle?.rate||0),
    reason:"Original Rental",
    pricing_mode:"Use Agreed Rate"
  });
  if(sErr){await window.db.from("rental_agreements").delete().eq("id",agreement.id);alert(sErr.message);return false;}

  const charges=[
    {rental_agreement_id:agreement.id,charge_type:"Rental",description:`${p.days} rental day(s)`,amount:p.base},
    ...(p.pickup?[{rental_agreement_id:agreement.id,charge_type:"Pickup Fee",description:"Pickup / delivery fee",amount:p.pickup}]:[]),
    ...(p.dropoff?[{rental_agreement_id:agreement.id,charge_type:"Drop-off Fee",description:"Drop-off / collection fee",amount:p.dropoff}]:[]),
    ...(p.other?[{rental_agreement_id:agreement.id,charge_type:"Other",description:"Other charge",amount:p.other}]:[]),
    ...(p.discount?[{rental_agreement_id:agreement.id,charge_type:"Discount",description:"Discount",amount:-p.discount}]:[])
  ];
  const {error:cErr}=await window.db.from("rental_charges").insert(charges);
  if(cErr){alert("Booking created, but charge lines could not be saved: "+cErr.message);}

  if(p.deposit>0){
    const {error:pErr}=await window.db.from("payments").insert({
      rental_agreement_id:agreement.id,payment_type:"Deposit / Down Payment",amount:p.deposit,payment_method:"Not specified"
    });
    if(pErr) alert("Booking created, but deposit could not be saved: "+pErr.message);
  }
  const bond=Number($("#rBond").value||0);
  if(bond>0){
    const {error:bErr}=await window.db.from("security_bonds").insert({
      rental_agreement_id:agreement.id,amount_required:bond,amount_collected:0,deductions:0,amount_refunded:0
    });
    if(bErr) alert("Booking created, but bond could not be saved: "+bErr.message);
  }
  await loadSupabaseData();state.page="rentals";render();return true;
}

function extendModal(uuid){
  const r=agreementByUuid(uuid);if(!r)return;
  const currentSeg=r.segments[r.segments.length-1],v=vehicleById(currentSeg?.vehicle_id);
  const oldEnd=new Date(r.end),suggested=new Date(oldEnd);suggested.setDate(suggested.getDate()+7);
  openModal(`Extend Rental #${r.id}`,`
    <div class="note"><strong>${esc(r.customer)}</strong><br>${esc(v?.make)} ${esc(v?.model)} · ${esc(v?.plate)}<br>Current return: ${fmtDate(r.end)}</div>
    <div class="field" style="margin-top:12px"><label>New Return Date/Time</label><input id="eEnd" type="datetime-local" value="${localInputValue(suggested)}"></div>
    <div id="eStatus"></div>`,async()=>{
      const newEnd=$("#eEnd").value;
      if(new Date(newEnd)<=new Date(r.end)){alert("New return must be after the current return.");return false;}
      if(segmentConflict(v.id,r.end,newEnd,currentSeg.id)){alert("The current vehicle has another booking during the requested extension. Choose an alternative from the suggestions.");return false;}
      const extraDays=rentalDays(r.end,newEnd),extra=extraDays*Number(currentSeg.agreed_daily_rate||0);
      const {error:u1}=await window.db.from("rental_agreements").update({expected_final_return_at:new Date(newEnd).toISOString()}).eq("id",r.uuid);
      if(u1){alert(u1.message);return false;}
      const {error:u2}=await window.db.from("rental_segments").update({end_at:new Date(newEnd).toISOString()}).eq("id",currentSeg.id);
      if(u2){alert(u2.message);return false;}
      if(extra>0) await window.db.from("rental_charges").insert({rental_agreement_id:r.uuid,charge_type:"Extension",description:`${extraDays} additional day(s)`,amount:extra});
      await loadSupabaseData();return true;
    },"Extend Rental");

  const check=()=>{
    const newEnd=$("#eEnd").value;
    if(!newEnd||new Date(newEnd)<=new Date(r.end)){ $("#eStatus").innerHTML="";return; }
    const conflict=segmentConflict(v.id,r.end,newEnd,currentSeg.id);
    if(!conflict){
      const extraDays=rentalDays(r.end,newEnd),extra=extraDays*Number(currentSeg.agreed_daily_rate||0);
      $("#eStatus").innerHTML=`<div class="ok-box">Available. Additional ${extraDays} day(s): <strong>${money(extra)}</strong>.</div>`;
    }else{
      const sims=suggestVehicles(v.id,r.end,newEnd,v.category_id,6);
      $("#eStatus").innerHTML=`<div class="conflict-box"><strong>Extension conflict.</strong><br>${esc(v.model)} has another booking.${sims.length?`<br><br>Potential replacement vehicles:<br>${sims.map(x=>`${esc(x.make)} ${esc(x.model)} · ${esc(x.plate)} · ${money(x.rate)}/day`).join("<br>")}`:""}</div>`;
    }
  };
  $("#eEnd").addEventListener("input",check);check();
}

function swapModal(uuid){
  const r=agreementByUuid(uuid);if(!r)return;
  const currentSeg=r.segments[r.segments.length-1],currentV=vehicleById(currentSeg?.vehicle_id);
  const now=new Date();const earliest=new Date(currentSeg.start_at)>now?new Date(currentSeg.start_at):now;
  const candidates=state.vehicles.filter(v=>String(v.id)!==String(currentV?.id)&&vehicleIsAvailable(v.id,earliest,r.end));
  openModal(`Change Vehicle · Rental #${r.id}`,`
    <div class="note">Current vehicle: <strong>${esc(currentV?.make)} ${esc(currentV?.model)} · ${esc(currentV?.plate)}</strong></div>
    <div class="grid two-col" style="margin-top:12px">
      <div class="field"><label>Change Date/Time</label><input id="sAt" type="datetime-local" value="${localInputValue(earliest)}"></div>
      <div class="field"><label>Replacement Vehicle</label><select id="sVehicle">${candidates.map(v=>`<option value="${esc(v.id)}">${esc(v.make)} ${esc(v.model)} · ${esc(v.plate)} · ${money(v.rate)}/day</option>`).join("")}</select></div>
      <div class="field"><label>Reason</label><select id="sReason"><option>Customer Upgrade</option><option>Customer Downgrade</option><option>Like-for-Like Swap</option><option>Mechanical Replacement</option><option>Courtesy Replacement</option><option>Other</option></select></div>
      <div class="field"><label>Pricing</label><select id="sPricing"><option>Use Replacement Vehicle Rate</option><option>Keep Existing Rate</option><option>Enter Custom Rate</option></select></div>
      <div class="field"><label>Custom Rate</label><input id="sCustomRate" type="number" step="0.01" min="0" value="${Number(currentSeg?.agreed_daily_rate||0)}"></div>
    </div>
    <div id="sPreview"></div>`,async()=>{
      const at=$("#sAt").value,newVid=$("#sVehicle").value,newV=vehicleById(newVid);
      if(!newVid){alert("No replacement vehicle selected.");return false;}
      if(new Date(at)<=new Date(currentSeg.start_at)||new Date(at)>=new Date(r.end)){alert("Change time must fall within the rental period.");return false;}
      if(!vehicleIsAvailable(newVid,at,r.end)){alert("Replacement vehicle is no longer available for the remaining period.");return false;}
      let rate=Number(newV.rate||0);
      if($("#sPricing").value==="Keep Existing Rate") rate=Number(currentSeg.agreed_daily_rate||0);
      if($("#sPricing").value==="Enter Custom Rate") rate=Number($("#sCustomRate").value||0);

      const {error:u}=await window.db.from("rental_segments").update({end_at:new Date(at).toISOString()}).eq("id",currentSeg.id);
      if(u){alert(u.message);return false;}
      const {error:i}=await window.db.from("rental_segments").insert({
        rental_agreement_id:r.uuid,vehicle_id:newVid,start_at:new Date(at).toISOString(),end_at:new Date(r.end).toISOString(),
        agreed_daily_rate:rate,standard_daily_rate_snapshot:Number(newV.rate||0),reason:$("#sReason").value,pricing_mode:$("#sPricing").value
      });
      if(i){alert(i.message);return false;}

      const remainingDays=rentalDays(at,r.end);
      const oldRemaining=remainingDays*Number(currentSeg.agreed_daily_rate||0);
      const newRemaining=remainingDays*rate;
      const adjustment=newRemaining-oldRemaining;
      if(Math.abs(adjustment)>0.001){
        await window.db.from("rental_charges").insert({rental_agreement_id:r.uuid,charge_type:"Vehicle Change Adjustment",description:$("#sReason").value,amount:adjustment});
      }
      await loadSupabaseData();return true;
    },"Change Vehicle");

  const preview=()=>{
    const newV=vehicleById($("#sVehicle").value);if(!newV)return;
    let rate=Number(newV.rate||0);
    if($("#sPricing").value==="Keep Existing Rate") rate=Number(currentSeg.agreed_daily_rate||0);
    if($("#sPricing").value==="Enter Custom Rate") rate=Number($("#sCustomRate").value||0);
    $("#sPreview").innerHTML=`<div class="ok-box">Replacement rate: <strong>${money(rate)}/day</strong>. The original vehicle segment remains in history.</div>`;
  };
  ["sVehicle","sPricing","sCustomRate"].forEach(id=>$("#"+id)?.addEventListener("input",preview));preview();
}

function paymentModal(uuid){
  const r=agreementByUuid(uuid);if(!r)return;
  const f=rentalFinancials(uuid);
  openModal(`Record Payment · Rental #${r.id}`,`
    <div class="note">Current balance: <strong>${money(f.balance)}</strong></div>
    <div class="grid two-col" style="margin-top:12px">
      <div class="field"><label>Payment Type</label><select id="pType"><option>Additional Payment</option><option>Final Payment</option><option>Deposit / Down Payment</option><option>Refund</option><option>Adjustment</option></select></div>
      <div class="field"><label>Amount</label><input id="pAmount" type="number" step="0.01" min="0"></div>
      <div class="field"><label>Payment Method</label><select id="pMethod"><option>Cash</option><option>Card</option><option>Bank Transfer</option><option>Other</option></select></div>
      <div class="field"><label>Reference</label><input id="pReference"></div>
    </div>`,async()=>{
      const amount=Number($("#pAmount").value||0);if(amount<=0){alert("Enter a payment amount.");return false;}
      const signedAmount=$("#pType").value==="Refund"?-amount:amount;
      const {error}=await window.db.from("payments").insert({rental_agreement_id:uuid,payment_type:$("#pType").value,amount:signedAmount,payment_method:$("#pMethod").value,reference:$("#pReference").value||null});
      if(error){alert(error.message);return false;}await loadSupabaseData();return true;
    },"Record Payment");
}

function returnModal(uuid){
  const r=agreementByUuid(uuid);if(!r)return;
  const now=new Date();
  openModal(`Return Vehicle · Rental #${r.id}`,`
    <div class="note"><strong>${esc(r.customer)}</strong><br>Expected return: ${fmtDate(r.end)}</div>
    <div class="grid two-col" style="margin-top:12px">
      <div class="field"><label>Actual Return Date/Time</label><input id="retAt" type="datetime-local" value="${localInputValue(now)}"></div>
      <div class="field"><label>Return Location</label><select id="retLocation"><option value="">Use expected location</option>${locationOptions(r.dropoff_location_id||"")}</select></div>
    </div>`,async()=>{
      const ret=$("#retAt").value;if(!ret){return false;}
      const last=r.segments[r.segments.length-1];
      const {error:u1}=await window.db.from("rental_segments").update({end_at:new Date(ret).toISOString()}).eq("id",last.id);
      if(u1){alert(u1.message);return false;}
      const payload={actual_final_return_at:new Date(ret).toISOString(),status:"Completed"};
      if($("#retLocation").value) payload.actual_dropoff_location_id=$("#retLocation").value;
      const {error:u2}=await window.db.from("rental_agreements").update(payload).eq("id",uuid);
      if(u2){alert(u2.message);return false;}
      await loadSupabaseData();return true;
    },"Complete Return");
}

async function saveVehicle(){
  const make=$("#vMake").value.trim(),model=$("#vModel").value.trim(),plate=$("#vPlate").value.trim();
  if(!model||!plate){alert("Model and plate are required.");return false;}
  const source=$("#vSource").value;
  const payload={make,model,plate,colour:$("#vColor").value.trim()||null,category_id:$("#vCategory").value||null,standard_daily_rate:Number($("#vRate").value||0),source_type:source,supplier_id:source==="External"?($("#vSupplier").value||null):null,transmission:"Automatic",seats:5,operational_status:"Available"};
  const {error}=await window.db.from("vehicles").insert(payload);if(error){alert(error.message);return false;}await loadSupabaseData();return true;
}
async function saveCustomer(){
  const name=$("#cName").value.trim();if(!name){alert("Customer name is required.");return false;}
  const {error}=await window.db.from("customers").insert({full_name:name,mobile:$("#cPhone").value.trim()||null});if(error){alert(error.message);return false;}await loadSupabaseData();return true;
}

function bindPageEvents(){
  $$("[data-goto]").forEach(b=>b.onclick=()=>go(b.dataset.goto));
  $("#searchAvailability")?.addEventListener("click",availabilitySearch);
  $("#refreshSupabase")?.addEventListener("click",loadSupabaseData);
  $$("[data-book-vehicle]").forEach(b=>b.onclick=()=>bookingModal({vehicleId:b.dataset.bookVehicle,start:b.dataset.start,end:b.dataset.end,pickup:b.dataset.pickup,dropoff:b.dataset.dropoff}));
  $$("[data-extend]").forEach(b=>b.onclick=()=>extendModal(b.dataset.extend));
  $$("[data-swap]").forEach(b=>b.onclick=()=>swapModal(b.dataset.swap));
  $$("[data-payment]").forEach(b=>b.onclick=()=>paymentModal(b.dataset.payment));
  $$("[data-return]").forEach(b=>b.onclick=()=>returnModal(b.dataset.return));

  $("#newRentalBtn")?.addEventListener("click",()=>bookingModal());
  $("#newVehicleBtn")?.addEventListener("click",()=>openModal("Add Vehicle",`
    <div class="grid two-col">
      <div class="field"><label>Make</label><input id="vMake"></div>
      <div class="field"><label>Model</label><input id="vModel"></div>
      <div class="field"><label>Plate</label><input id="vPlate"></div>
      <div class="field"><label>Colour</label><input id="vColor"></div>
      <div class="field"><label>Category</label><select id="vCategory">${categoryOptions("")}</select></div>
      <div class="field"><label>Daily Rate</label><input id="vRate" type="number" step="0.01" min="0"></div>
      <div class="field"><label>Source</label><select id="vSource"><option>Own Fleet</option><option>External</option></select></div>
      <div class="field"><label>Supplier</label><select id="vSupplier"><option value="">None</option>${state.suppliers.map(s=>`<option value="${esc(s.id)}">${esc(s.name)}</option>`).join("")}</select></div>
    </div>`,saveVehicle));
  $("#newCustomerBtn")?.addEventListener("click",()=>openModal("Add Customer",`
    <div class="field"><label>Full Name</label><input id="cName"></div>
    <div class="field" style="margin-top:10px"><label>Mobile</label><input id="cPhone"></div>`,saveCustomer));
}

function go(page){state.page=page;render();if(window.innerWidth<760)$("#sidebar").classList.remove("open");}
$$(".nav-btn").forEach(b=>b.addEventListener("click",()=>go(b.dataset.page)));
$("#menuBtn").addEventListener("click",()=>$("#sidebar").classList.toggle("open"));
$("#quickAvailability").addEventListener("click",()=>go("availability"));
$("#quickRental").addEventListener("click",()=>{go("rentals");setTimeout(()=>bookingModal(),50);});

let appStarted=false;
window.startB5App=async function(){if(!appStarted){appStarted=true;render();}await loadSupabaseData();};
window.resetB5App=function(){
  state.live=false;state.error="";state.vehicles=[];state.rentals=[];state.customers=[];state.suppliers=[];
  state.locations=fallback.locations;state.categories=[];state.segments=[];state.charges=[];state.payments=[];state.bonds=[];appStarted=false;
};
