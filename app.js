
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
  vehicles: fallback.vehicles,
  rentals: fallback.rentals,
  customers: fallback.customers,
  suppliers: fallback.suppliers,
  locations: fallback.locations,
  categories: fallback.categories,
  segments: []
};

function esc(v){
  return String(v ?? "").replace(/[&<>"']/g, m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));
}
function vehicleById(id){ return state.vehicles.find(v => String(v.id) === String(id)); }
function customerById(id){ return state.customers.find(v => String(v.id) === String(id)); }
function locationById(id){ return state.locations.find(v => String(v.id) === String(id)); }
function supplierById(id){ return state.suppliers.find(v => String(v.id) === String(id)); }

function statusClass(s){
  s = (s||"").toLowerCase();
  if(s.includes("available")) return "badge-available";
  if(s.includes("out of order") || s.includes("maintenance")) return "badge-oos";
  if(s.includes("reserved")) return "badge-reserved";
  if(s.includes("out") || s.includes("active")) return "badge-out";
  return "badge-reserved";
}
function money(n){ return `$${Number(n||0).toFixed(0)}`; }
function fmtDate(iso){
  if(!iso) return "";
  const d = new Date(iso);
  if(Number.isNaN(d.getTime())) return esc(iso);
  return d.toLocaleString("en-AU",{day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit"});
}
function fmtDay(d){
  return d.toLocaleDateString("en-AU",{weekday:"long",day:"numeric",month:"long",year:"numeric"});
}
function overlaps(aStart,aEnd,bStart,bEnd){
  const a1 = new Date(aStart), a2 = new Date(aEnd), b1 = new Date(bStart), b2 = new Date(bEnd);
  return a1 < b2 && a2 > b1;
}
function rentalDays(start,end){
  const ms = new Date(end)-new Date(start);
  return Math.max(1, Math.ceil(ms/(1000*60*60*24)));
}
function dbReady(){ return !!window.db; }

function updateDataMode(){
  const el = $("#dataMode");
  if(!el) return;
  if(state.live){
    el.textContent = "Live Supabase";
    el.className = "badge live-status";
  } else if(state.loading){
    el.textContent = "Connecting…";
    el.className = "badge badge-demo";
  } else {
    el.textContent = "Offline / Fallback";
    el.className = "badge fallback-status";
  }
}

function normaliseVehicle(row){
  const cat = row.vehicle_categories?.name || "";
  const sup = row.suppliers?.name || "";
  return {
    id: row.id,
    plate: row.plate || "",
    make: row.make || "",
    model: row.model || "",
    year: row.model_year || "",
    color: row.colour || "",
    category: cat || "Other",
    category_id: row.category_id || null,
    seats: row.seats || 5,
    transmission: row.transmission || "Automatic",
    rate: Number(row.standard_daily_rate || 0),
    source: row.source_type || "Own Fleet",
    supplier: sup || null,
    supplier_id: row.supplier_id || null,
    status: row.operational_status || "Available",
    long_term: !!row.long_term_contract,
    notes: row.notes || ""
  };
}

function rebuildRentals(agreements, segments){
  const out = [];
  for(const a of agreements){
    const segs = segments.filter(s=>String(s.rental_agreement_id)===String(a.id)).sort((x,y)=>new Date(x.start_at)-new Date(y.start_at));
    const first = segs[0];
    const last = segs[segs.length-1];
    const c = customerById(a.customer_id);
    const pu = locationById(a.pickup_location_id);
    const dr = locationById(a.expected_dropoff_location_id);
    out.push({
      id: a.agreement_number || String(a.id).slice(0,8),
      uuid: a.id,
      customer_id: a.customer_id,
      customer: c?.name || c?.full_name || "Customer",
      vehicle_id: first?.vehicle_id || null,
      start: first?.start_at || a.original_pickup_at,
      end: last?.end_at || a.expected_final_return_at,
      pickup: pu?.name || "Any",
      dropoff: dr?.name || "Any",
      pickup_location_id: a.pickup_location_id,
      dropoff_location_id: a.expected_dropoff_location_id,
      rate: Number(first?.agreed_daily_rate || 0),
      status: a.status || "Reserved",
      guarantee: a.guarantee_type || "Specific Vehicle",
      segments: segs
    });
  }
  return out;
}

async function loadSupabaseData(){
  if(!dbReady()){
    state.live = false;
    state.error = "Supabase client unavailable.";
    updateDataMode();
    render();
    return;
  }

  state.loading = true;
  state.error = "";
  updateDataMode();

  try{
    const [
      categoriesRes,
      suppliersRes,
      locationsRes,
      customersRes,
      vehiclesRes,
      agreementsRes,
      segmentsRes
    ] = await Promise.all([
      window.db.from("vehicle_categories").select("*").order("name"),
      window.db.from("suppliers").select("*").eq("active",true).order("name"),
      window.db.from("locations").select("*").eq("active",true).order("name"),
      window.db.from("customers").select("*").order("full_name"),
      window.db.from("vehicles").select("*, vehicle_categories(name), suppliers(name)").eq("active",true).order("model"),
      window.db.from("rental_agreements").select("*").order("original_pickup_at",{ascending:false}),
      window.db.from("rental_segments").select("*").order("start_at",{ascending:true})
    ]);

    const responses = [categoriesRes,suppliersRes,locationsRes,customersRes,vehiclesRes,agreementsRes,segmentsRes];
    const err = responses.find(r=>r.error)?.error;
    if(err) throw err;

    state.categories = categoriesRes.data || [];
    state.suppliers = (suppliersRes.data || []).map(s=>({...s}));
    state.locations = locationsRes.data || [];
    state.customers = (customersRes.data || []).map(c=>({...c,name:c.full_name,phone:c.mobile}));
    state.vehicles = (vehiclesRes.data || []).map(normaliseVehicle);
    state.segments = segmentsRes.data || [];
    state.rentals = rebuildRentals(agreementsRes.data || [], state.segments);
    state.live = true;
  }catch(err){
    console.error(err);
    state.live = false;
    state.error = err?.message || "Could not load Supabase data.";
  }finally{
    state.loading = false;
    updateDataMode();
    render();
  }
}

const pageMeta = {
  dashboard:["Dashboard","Fleet and rental operations at a glance"],
  today:["Today","Returns, pickups, available cars and attention items"],
  availability:["Availability","Search the fleet across a complete date and time range"],
  rentals:["Rentals","Manage reservations, active rentals, extensions and returns"],
  calendar:["Calendar","Visual fleet booking timeline"],
  fleet:["Fleet","Own and external vehicles"],
  customers:["Customers","Customer directory and rental history"],
  suppliers:["Suppliers","Partner companies and external vehicle sources"],
  locations:["Locations & Fees","Pickup, drop-off and transfer pricing"],
  settings:["Settings","System connection and configuration"]
};

function render(){
  const [title,sub] = pageMeta[state.page];
  $("#pageTitle").textContent = title;
  $("#pageSubtitle").textContent = sub;
  $$(".nav-btn").forEach(b=>b.classList.toggle("active",b.dataset.page===state.page));
  updateDataMode();

  const map = {
    dashboard:renderDashboard,
    today:renderToday,
    availability:renderAvailability,
    rentals:renderRentals,
    calendar:renderCalendar,
    fleet:renderFleet,
    customers:renderCustomers,
    suppliers:renderSuppliers,
    locations:renderLocations,
    settings:renderSettings
  };
  $("#content").innerHTML = (state.error ? `<div class="alert">Supabase connection: ${esc(state.error)} The app is showing fallback data.</div>` : "") + map[state.page]();
  bindPageEvents();
}

function todayDate(){ return new Date(); }
function sameDay(a,b){ return new Date(a).toDateString() === b.toDateString(); }

function renderDashboard(){
  const available = state.vehicles.filter(v=>v.status==="Available").length;
  const out = state.vehicles.filter(v=>v.status==="Out on Rental").length;
  const reserved = state.vehicles.filter(v=>v.status==="Reserved").length;
  const external = state.vehicles.filter(v=>v.source==="External").length;
  const oos = state.vehicles.filter(v=>["Out of Order","Maintenance"].includes(v.status)).length;
  const today = todayDate();
  const returnsToday = state.rentals.filter(r => sameDay(r.end,today));
  const pickupsToday = state.rentals.filter(r => sameDay(r.start,today));

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

    <div class="grid two-col">
      <div class="panel">
        <div class="panel-head"><h2>Today's Returns</h2><button class="btn btn-small btn-secondary" data-goto="today">View Today</button></div>
        <div class="table-wrap">${rentalTable(returnsToday)}</div>
      </div>
      <div class="panel">
        <div class="panel-head"><h2>Attention Required</h2></div>
        <div class="panel-body">
          ${oos ? `<div class="alert">${oos} vehicle${oos>1?"s":""} currently unavailable due to maintenance/out-of-order status.</div>` : ""}
          <div class="note">${state.live ? "Live Supabase data is active." : "Fallback mode is active."} Availability checks use rental segments stored in the current data source.</div>
        </div>
      </div>
    </div>

    <div class="panel" style="margin-top:14px">
      <div class="panel-head"><h2>Upcoming Rentals</h2><button class="btn btn-small btn-secondary" data-goto="rentals">View All</button></div>
      <div class="table-wrap">${rentalTable([...state.rentals].sort((a,b)=>new Date(a.start)-new Date(b.start)).slice(0,8))}</div>
    </div>`;
}
function stat(label,value,sub){
  return `<div class="stat"><div class="label">${esc(label)}</div><div class="value">${esc(value)}</div><div class="sub">${esc(sub)}</div></div>`;
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
    }).join("")}</tbody>
  </table>`;
}

function renderToday(){
  const today = todayDate();
  const ret = state.rentals.filter(r=>sameDay(r.end,today));
  const pick = state.rentals.filter(r=>sameDay(r.start,today));
  const avail = state.vehicles.filter(v=>v.status==="Available");
  const external = state.vehicles.filter(v=>v.source==="External" && v.status!=="Available");
  return `
    <div class="section-title"><div><h2>${esc(fmtDay(today))}</h2><p>Daily operations view</p></div></div>
    <div class="grid two-col">
      <div class="panel"><div class="panel-head"><h3>Returns Today</h3><span class="badge badge-out">${ret.length}</span></div><div class="table-wrap">${rentalTable(ret)}</div></div>
      <div class="panel"><div class="panel-head"><h3>Pickups Today</h3><span class="badge badge-reserved">${pick.length}</span></div><div class="table-wrap">${rentalTable(pick)}</div></div>
    </div>
    <div class="grid two-col" style="margin-top:14px">
      <div class="panel"><div class="panel-head"><h3>Vehicles Available in Office</h3><span class="badge badge-available">${avail.length}</span></div><div class="panel-body">
        <div class="kpi-row">${avail.slice(0,40).map(v=>`<span class="badge badge-available">${esc(v.model)} · ${esc(v.plate)}</span>`).join("")}</div>
      </div></div>
      <div class="panel"><div class="panel-head"><h3>External Vehicles Requiring Action</h3></div><div class="panel-body">
        ${external.length ? external.slice(0,20).map(v=>`<div class="note" style="margin-bottom:8px"><strong>${esc(v.make)} ${esc(v.model)}</strong> · ${esc(v.plate)}<br>Supplier: ${esc(v.supplier||"Unknown")} · ${esc(v.status)}</div>`).join("") : `<div class="empty">No external action items.</div>`}
      </div></div>
    </div>`;
}

function anyLocationOptions(selected="Any"){
  return `<option value="Any" ${selected==="Any"?"selected":""}>Any</option>` +
    state.locations.map(l=>`<option value="${esc(l.id)}" ${String(l.id)===String(selected)?"selected":""}>${esc(l.name)}</option>`).join("");
}
function locationOptions(selectedId=""){
  return state.locations.map(l=>`<option value="${esc(l.id)}" ${String(l.id)===String(selectedId)?"selected":""}>${esc(l.name)}</option>`).join("");
}

function renderAvailability(){
  const now = new Date();
  const start = new Date(now); start.setDate(start.getDate()+1); start.setHours(10,0,0,0);
  const end = new Date(start); end.setDate(end.getDate()+7); end.setHours(17,0,0,0);
  const ds = d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
  const ts = d=>`${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`;
  return `
    <div class="filters">
      <div class="field"><label>Pickup Date</label><input id="aStartDate" type="date" value="${ds(start)}"></div>
      <div class="field"><label>Pickup Time</label><input id="aStartTime" type="time" value="${ts(start)}"></div>
      <div class="field"><label>Pickup Location</label><select id="aPickup">${anyLocationOptions("Any")}</select></div>
      <div class="field"><label>Return Date</label><input id="aEndDate" type="date" value="${ds(end)}"></div>
      <div class="field"><label>Return Time</label><input id="aEndTime" type="time" value="${ts(end)}"></div>
      <div class="field"><label>Drop-off Location</label><select id="aDropoff">${anyLocationOptions("Any")}</select></div>
      <div class="field"><label>Category</label><select id="aCategory"><option value="">Any</option>${[...new Set(state.vehicles.map(v=>v.category).filter(Boolean))].sort().map(x=>`<option>${esc(x)}</option>`).join("")}</select></div>
      <div class="field"><label>Seats</label><select id="aSeats"><option value="">Any</option><option>5</option><option>7</option></select></div>
      <div class="field"><label>Transmission</label><select id="aTrans"><option value="">Any</option><option>Automatic</option><option>Manual</option></select></div>
      <div class="field" style="display:flex;align-items:end"><button id="searchAvailability" class="btn btn-primary" style="width:100%">Search Availability</button></div>
    </div>
    <div id="availabilityResults">
      <div class="panel"><div class="panel-body"><div class="note">Pickup and drop-off may be set to <strong>Any</strong> when location is not relevant to the search. Location charges are only added when a specific location is selected.</div></div></div>
    </div>`;
}

function availabilitySearch(){
  const start = `${$("#aStartDate").value}T${$("#aStartTime").value}`;
  const end = `${$("#aEndDate").value}T${$("#aEndTime").value}`;
  const cat = $("#aCategory").value;
  const seats = $("#aSeats").value;
  const trans = $("#aTrans").value;
  const pickupVal = $("#aPickup").value;
  const dropoffVal = $("#aDropoff").value;
  const pickup = pickupVal==="Any" ? null : locationById(pickupVal);
  const dropoff = dropoffVal==="Any" ? null : locationById(dropoffVal);

  if(new Date(end)<=new Date(start)){
    $("#availabilityResults").innerHTML=`<div class="alert">Return must be after pickup.</div>`; return;
  }

  let candidates = state.vehicles.filter(v => !["Out of Order","Maintenance","Inactive"].includes(v.status));
  if(cat) candidates = candidates.filter(v=>v.category===cat);
  if(seats) candidates = candidates.filter(v=>String(v.seats)===seats);
  if(trans) candidates = candidates.filter(v=>v.transmission===trans);

  const results = candidates.map(v=>{
    const conflict = state.segments.some(s=>String(s.vehicle_id)===String(v.id) && s.end_at && overlaps(start,end,s.start_at,s.end_at));
    const days = rentalDays(start,end);
    const locationFees = Number(pickup?.pickup_fee||0)+Number(dropoff?.dropoff_fee||0);
    return {...v, conflict, days, estimate: days*Number(v.rate||0)+locationFees, locationFees};
  });

  const own = results.filter(v=>!v.conflict && v.source==="Own Fleet");
  const external = results.filter(v=>!v.conflict && v.source==="External");
  const unavailable = results.filter(v=>v.conflict);

  $("#availabilityResults").innerHTML = `
    ${availabilityGroup("Available — Own Fleet",own)}
    ${availabilityGroup("External / Partner Vehicles",external)}
    ${availabilityGroup("Unavailable for These Dates",unavailable,true)}
  `;
}
function availabilityGroup(title,rows,blocked=false){
  return `<div class="panel" style="margin-bottom:14px">
    <div class="panel-head"><h3>${esc(title)}</h3><span class="badge ${blocked?"badge-oos":"badge-available"}">${rows.length}</span></div>
    <div class="panel-body">
      ${rows.length?`<div class="vehicle-grid">${rows.map(v=>`
        <div class="vehicle-card">
          <div class="kpi-row">
            <span class="badge ${v.source==="External"?"badge-external":"badge-available"}">${esc(v.source)}</span>
            ${v.supplier?`<span class="badge badge-external">${esc(v.supplier)}</span>`:""}
          </div>
          <h3 style="margin-top:10px">${esc(v.make)} ${esc(v.model)}</h3>
          <div class="vehicle-meta">${esc(v.plate||"Plate not recorded")} · ${esc(v.category)} · ${esc(v.seats)} seats · ${esc(v.transmission)}</div>
          <div class="vehicle-rate">${Number(v.rate)>0?`${money(v.rate)}/day`:"Rate not loaded"}</div>
          <div class="vehicle-meta">${blocked?"Conflicts with an existing rental segment":`Estimated rental: ${Number(v.rate)>0?money(v.estimate):"Rate required"}${v.locationFees?` incl. ${money(v.locationFees)} location fees`:""}`}</div>
          ${blocked?"":`<div class="card-actions"><button class="btn btn-primary btn-small">Create Quote</button><button class="btn btn-secondary btn-small">Reserve</button></div>`}
        </div>`).join("")}</div>`:`<div class="empty">No matching vehicles.</div>`}
    </div>
  </div>`;
}

function renderRentals(){
  return `
    <div class="section-title"><div><h2>Rental Agreements</h2><p>Reservations and active rentals</p></div><button class="btn btn-primary" id="newRentalBtn">New Rental</button></div>
    <div class="panel"><div class="table-wrap">
      <table><thead><tr><th>Agreement</th><th>Customer</th><th>Vehicle</th><th>Period</th><th>Locations</th><th>Rate</th><th>Est. Rental</th><th>Status</th></tr></thead>
      <tbody>${state.rentals.map(r=>{const v=vehicleById(r.vehicle_id);return `<tr>
        <td data-label="Agreement">#${esc(r.id)}</td>
        <td data-label="Customer">${esc(r.customer)}</td>
        <td data-label="Vehicle">${v?`${esc(v.make)} ${esc(v.model)} · ${esc(v.plate)}`:"Unassigned"}</td>
        <td data-label="Period">${fmtDate(r.start)} → ${fmtDate(r.end)}</td>
        <td data-label="Locations">${esc(r.pickup)} → ${esc(r.dropoff)}</td>
        <td data-label="Rate">${Number(r.rate)>0?`${money(r.rate)}/day`:"Not set"}</td>
        <td data-label="Estimate">${Number(r.rate)>0?money(rentalDays(r.start,r.end)*r.rate):"—"}</td>
        <td data-label="Status"><span class="badge ${statusClass(r.status)}">${esc(r.status)}</span></td>
      </tr>`}).join("")}</tbody></table>
    </div></div>`;
}

function renderCalendar(){
  const start = new Date(); start.setHours(0,0,0,0);
  const days = Array.from({length:14},(_,i)=>{const d=new Date(start);d.setDate(d.getDate()+i);return d;});
  return `
    <div class="panel">
      <div class="panel-head"><h3>Fleet Timeline — 14 Days</h3><div class="kpi-row"><span class="badge badge-out">Booked</span></div></div>
      <div class="panel-body timeline">
        <div class="timeline-grid">
          <div class="timeline-row header"><div class="timeline-vehicle">Vehicle</div>${days.map(d=>`<div class="timeline-cell">${d.toLocaleDateString("en-AU",{day:"2-digit",month:"short"})}</div>`).join("")}</div>
          ${state.vehicles.slice(0,30).map(v=>`
            <div class="timeline-row">
              <div class="timeline-vehicle">${esc(v.model)}<br><span style="font-weight:400;color:#718096">${esc(v.plate)}</span></div>
              ${days.map(d=>{
                const startDay=new Date(d), endDay=new Date(d); endDay.setDate(endDay.getDate()+1);
                const seg=state.segments.find(s=>String(s.vehicle_id)===String(v.id) && s.end_at && overlaps(startDay,endDay,s.start_at,s.end_at));
                return `<div class="timeline-cell">${seg?`<div class="timeline-bar">Booked</div>`:""}</div>`;
              }).join("")}
            </div>`).join("")}
        </div>
      </div>
    </div>`;
}

function renderFleet(){
  return `
    <div class="section-title"><div><h2>Fleet Board</h2><p>${state.live?"Live Supabase fleet":"Fallback fleet"}</p></div><button class="btn btn-primary" id="newVehicleBtn">Add Vehicle</button></div>
    <div class="vehicle-grid">
      ${state.vehicles.map(v=>`
        <div class="vehicle-card">
          <div class="kpi-row">
            <span class="badge ${statusClass(v.status)}">${esc(v.status)}</span>
            <span class="badge ${v.source==="External"?"badge-external":"badge-available"}">${esc(v.source)}</span>
          </div>
          <h3 style="margin-top:10px">${esc(v.make)} ${esc(v.model)}</h3>
          <div class="vehicle-meta">${esc(v.plate||"Plate not recorded")} · ${esc(v.color||"Colour not recorded")} · ${esc(v.category)}<br>${esc(v.seats)} seats · ${esc(v.transmission)}</div>
          <div class="vehicle-rate">${Number(v.rate)>0?`${money(v.rate)}/day`:"Rate not loaded"}</div>
          ${v.supplier?`<div class="vehicle-meta">Supplier: <strong>${esc(v.supplier)}</strong></div>`:""}
        </div>`).join("")}
    </div>`;
}

function renderCustomers(){
  return `
    <div class="section-title"><div><h2>Customers</h2><p>Reusable customer records</p></div><button class="btn btn-primary" id="newCustomerBtn">Add Customer</button></div>
    <div class="panel"><div class="table-wrap"><table>
      <thead><tr><th>Name</th><th>Phone</th><th>Active/Upcoming Rentals</th></tr></thead>
      <tbody>${state.customers.map(c=>`<tr>
        <td data-label="Name">${esc(c.name||c.full_name)}</td>
        <td data-label="Phone">${esc(c.phone||c.mobile||"")}</td>
        <td data-label="Rentals">${state.rentals.filter(r=>String(r.customer_id)===String(c.id) && ["Active","Reserved","Confirmed"].includes(r.status)).length}</td>
      </tr>`).join("")}</tbody>
    </table></div></div>`;
}

function renderSuppliers(){
  return `
    <div class="section-title"><div><h2>Suppliers / Partner Companies</h2><p>External vehicle sources</p></div></div>
    <div class="vehicle-grid">${state.suppliers.map(s=>`
      <div class="vehicle-card"><h3>${esc(s.name)}</h3><div class="vehicle-meta">${esc(s.phone||"")}</div>
      <div class="vehicle-rate">${state.vehicles.filter(v=>String(v.supplier_id)===String(s.id) || v.supplier===s.name).length}</div><div class="vehicle-meta">vehicles currently in fleet list</div></div>`).join("")}
    </div>`;
}

function renderLocations(){
  return `
    <div class="section-title"><div><h2>Locations & Fees</h2><p>Default pickup and drop-off pricing</p></div></div>
    <div class="panel"><div class="table-wrap"><table>
      <thead><tr><th>Location</th><th>Pickup / Delivery Fee</th><th>Drop-off / Collection Fee</th><th>Transfer Buffer</th></tr></thead>
      <tbody>${state.locations.map(l=>`<tr>
        <td data-label="Location">${esc(l.name)}</td>
        <td data-label="Pickup Fee">${money(l.pickup_fee)}</td>
        <td data-label="Drop-off Fee">${money(l.dropoff_fee)}</td>
        <td data-label="Transfer">${esc(l.turnaround_minutes||0)} mins</td>
      </tr>`).join("")}</tbody>
    </table></div></div>
    <div class="note" style="margin-top:14px">Availability filters now include <strong>Any</strong> for both pickup and drop-off. “Any” adds no location fee to the indicative calculation.</div>`;
}

function renderSettings(){
  return `
    <div class="grid two-col">
      <div class="panel"><div class="panel-head"><h3>Supabase Connection</h3></div><div class="panel-body">
        <p><strong>Status:</strong> ${state.live?'<span class="badge live-status">Live Supabase</span>':'<span class="badge fallback-status">Fallback mode</span>'}</p>
        <p class="note">Project connection is configured in <code>supabase.js</code>. Fleet, suppliers, customers, locations, rental agreements and rental segments now load from Supabase when access is available.</p>
        <button class="btn btn-secondary" id="refreshSupabase">Refresh Live Data</button>
      </div></div>
      <div class="panel"><div class="panel-head"><h3>Responsive Layout</h3></div><div class="panel-body">
        <p class="note">The app is locked to the device viewport. Pinch-to-zoom is disabled, form focus no longer triggers mobile zoom, and tables switch to stacked cards on mobile so the page does not expand sideways.</p>
      </div></div>
    </div>`;
}

function openModal(title, body, onSave){
  $("#modalTitle").textContent=title;
  $("#modalBody").innerHTML=body;
  const dlg=$("#modal");
  dlg.showModal();
  $("#modalForm").onsubmit=async(e)=>{
    e.preventDefault();
    const save=$("#modalSave");
    save.disabled=true;
    save.textContent="Saving…";
    try{
      const ok = onSave ? await onSave() : true;
      if(ok===false) return;
      dlg.close();
    } finally {
      save.disabled=false;
      save.textContent="Save";
    }
  };
}

async function saveVehicle(){
  const make=$("#vMake").value.trim(), model=$("#vModel").value.trim(), plate=$("#vPlate").value.trim();
  if(!model || !plate){ alert("Model and plate are required."); return false; }

  if(!state.live){
    alert("Supabase is not live. Refresh the connection before adding production data.");
    return false;
  }

  const category = state.categories.find(c=>String(c.id)===String($("#vCategory").value));
  const source = $("#vSource").value;
  const supplierId = source==="External" ? ($("#vSupplier").value || null) : null;
  const payload = {
    make,
    model,
    plate,
    colour: $("#vColor").value.trim() || null,
    category_id: category?.id || null,
    standard_daily_rate: Number($("#vRate").value||0),
    source_type: source,
    supplier_id: supplierId,
    transmission: "Automatic",
    seats: 5,
    operational_status: "Available"
  };

  const {error}=await window.db.from("vehicles").insert(payload);
  if(error){ alert(error.message); return false; }
  await loadSupabaseData();
  return true;
}

async function saveCustomer(){
  const name=$("#cName").value.trim();
  if(!name){ alert("Customer name is required."); return false; }
  if(!state.live){ alert("Supabase is not live."); return false; }
  const {error}=await window.db.from("customers").insert({full_name:name,mobile:$("#cPhone").value.trim()||null});
  if(error){ alert(error.message); return false; }
  await loadSupabaseData();
  return true;
}

function segmentConflict(vehicleId,start,end){
  return state.segments.some(s=>String(s.vehicle_id)===String(vehicleId) && s.end_at && overlaps(start,end,s.start_at,s.end_at));
}

async function saveRental(){
  if(!state.live){ alert("Supabase is not live."); return false; }

  const customerId=$("#rCustomer").value;
  const vehicleId=$("#rVehicle").value;
  const start=$("#rStart").value, end=$("#rEnd").value;
  if(new Date(end)<=new Date(start)){ $("#rConflict").innerHTML=`<div class="alert">Return must be after pickup.</div>`; return false; }
  if(segmentConflict(vehicleId,start,end)){
    $("#rConflict").innerHTML=`<div class="alert">This vehicle conflicts with an existing rental segment. Choose another vehicle or change the dates.</div>`;
    return false;
  }

  const pickupId = $("#rPickup").value || null;
  const dropoffId = $("#rDropoff").value || null;

  const {data:agreement,error:aErr}=await window.db.from("rental_agreements").insert({
    customer_id: customerId,
    original_pickup_at: new Date(start).toISOString(),
    expected_final_return_at: new Date(end).toISOString(),
    pickup_location_id: pickupId,
    expected_dropoff_location_id: dropoffId,
    guarantee_type: $("#rGuarantee").value,
    status: "Reserved"
  }).select().single();

  if(aErr){ alert(aErr.message); return false; }

  const v=vehicleById(vehicleId);
  const {error:sErr}=await window.db.from("rental_segments").insert({
    rental_agreement_id: agreement.id,
    vehicle_id: vehicleId,
    start_at: new Date(start).toISOString(),
    end_at: new Date(end).toISOString(),
    agreed_daily_rate: Number($("#rRate").value||0),
    standard_daily_rate_snapshot: Number(v?.rate||0),
    reason: "Original Rental",
    pricing_mode: "Use Agreed Rate"
  });

  if(sErr){
    await window.db.from("rental_agreements").delete().eq("id",agreement.id);
    alert(sErr.message);
    return false;
  }
  await loadSupabaseData();
  return true;
}

function newRentalModal(){
  openModal("New Rental",`
    <div class="grid two-col">
      <div class="field"><label>Customer</label><select id="rCustomer">${state.customers.map(c=>`<option value="${esc(c.id)}">${esc(c.name||c.full_name)}</option>`).join("")}</select></div>
      <div class="field"><label>Vehicle</label><select id="rVehicle">${state.vehicles.filter(v=>!["Out of Order","Maintenance"].includes(v.status)).map(v=>`<option value="${esc(v.id)}">${esc(v.make)} ${esc(v.model)} · ${esc(v.plate)}</option>`).join("")}</select></div>
      <div class="field"><label>Pickup</label><input id="rStart" type="datetime-local"></div>
      <div class="field"><label>Return</label><input id="rEnd" type="datetime-local"></div>
      <div class="field"><label>Pickup Location</label><select id="rPickup"><option value="">Any / Not set</option>${locationOptions()}</select></div>
      <div class="field"><label>Drop-off Location</label><select id="rDropoff"><option value="">Any / Not set</option>${locationOptions()}</select></div>
      <div class="field"><label>Agreed Daily Rate</label><input id="rRate" type="number" min="0" value="0"></div>
      <div class="field"><label>Guarantee</label><select id="rGuarantee"><option>Specific Vehicle</option><option>Vehicle or Similar</option></select></div>
    </div>
    <div id="rConflict" style="margin-top:12px"></div>`, saveRental);

  const d1=new Date(); d1.setDate(d1.getDate()+1); d1.setHours(10,0,0,0);
  const d2=new Date(d1); d2.setDate(d2.getDate()+7);
  const localInput=d=>{const z=n=>String(n).padStart(2,"0");return `${d.getFullYear()}-${z(d.getMonth()+1)}-${z(d.getDate())}T${z(d.getHours())}:${z(d.getMinutes())}`;};
  $("#rStart").value=localInput(d1); $("#rEnd").value=localInput(d2);
  $("#rVehicle").onchange=()=>{const v=vehicleById($("#rVehicle").value); $("#rRate").value=Number(v?.rate||0);};
  $("#rVehicle").dispatchEvent(new Event("change"));
}

function bindPageEvents(){
  $$("[data-goto]").forEach(b=>b.onclick=()=>go(b.dataset.goto));
  $("#searchAvailability")?.addEventListener("click", availabilitySearch);
  $("#refreshSupabase")?.addEventListener("click", loadSupabaseData);

  $("#newVehicleBtn")?.addEventListener("click",()=>openModal("Add Vehicle",`
    <div class="grid two-col">
      <div class="field"><label>Make</label><input id="vMake"></div>
      <div class="field"><label>Model</label><input id="vModel"></div>
      <div class="field"><label>Plate</label><input id="vPlate"></div>
      <div class="field"><label>Colour</label><input id="vColor"></div>
      <div class="field"><label>Category</label><select id="vCategory"><option value="">Other / Not set</option>${state.categories.map(c=>`<option value="${esc(c.id)}">${esc(c.name)}</option>`).join("")}</select></div>
      <div class="field"><label>Daily Rate</label><input id="vRate" type="number" min="0"></div>
      <div class="field"><label>Source</label><select id="vSource"><option>Own Fleet</option><option>External</option></select></div>
      <div class="field"><label>Supplier</label><select id="vSupplier"><option value="">None</option>${state.suppliers.map(s=>`<option value="${esc(s.id)}">${esc(s.name)}</option>`).join("")}</select></div>
    </div>`, saveVehicle));

  $("#newCustomerBtn")?.addEventListener("click",()=>openModal("Add Customer",`
    <div class="field"><label>Full Name</label><input id="cName"></div>
    <div class="field" style="margin-top:10px"><label>Mobile</label><input id="cPhone"></div>`, saveCustomer));

  $("#newRentalBtn")?.addEventListener("click",newRentalModal);
}

function go(page){
  state.page=page;
  render();
  if(window.innerWidth<760) $("#sidebar").classList.remove("open");
}

$$(".nav-btn").forEach(b=>b.addEventListener("click",()=>go(b.dataset.page)));
$("#menuBtn").addEventListener("click",()=>$("#sidebar").classList.toggle("open"));
$("#quickAvailability").addEventListener("click",()=>go("availability"));
$("#quickRental").addEventListener("click",()=>{go("rentals"); setTimeout(newRentalModal,50);});

let appStarted = false;

window.startB5App = async function(){
  if(!appStarted){
    appStarted = true;
    render();
  }
  await loadSupabaseData();
};

window.resetB5App = function(){
  state.live = false;
  state.error = "";
  state.vehicles = [];
  state.rentals = [];
  state.customers = [];
  state.suppliers = [];
  state.locations = fallback.locations;
  state.categories = [];
  state.segments = [];
  appStarted = false;
};
