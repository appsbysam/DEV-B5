
const $ = (s, root=document) => root.querySelector(s);
const $$ = (s, root=document) => [...root.querySelectorAll(s)];

const demo = {
  locations: [
    {id:1,name:"Hasbaya Office",pickup_fee:0,dropoff_fee:0,turnaround_mins:30},
    {id:2,name:"Beirut Airport",pickup_fee:75,dropoff_fee:75,turnaround_mins:180},
    {id:3,name:"Beirut",pickup_fee:65,dropoff_fee:65,turnaround_mins:180},
    {id:4,name:"Saida",pickup_fee:40,dropoff_fee:40,turnaround_mins:90},
    {id:5,name:"Nabatieh",pickup_fee:25,dropoff_fee:25,turnaround_mins:60},
  ],
  suppliers: [
    {id:1,name:"Boss",phone:"+961 70 000 001"},
    {id:2,name:"Mekano",phone:"+961 70 000 002"},
    {id:3,name:"Majid",phone:"+961 70 000 003"},
    {id:4,name:"Jonny",phone:"+961 70 000 004"},
  ],
  customers: [
    {id:1,name:"Demo Customer 1",phone:"+961 70 111 111"},
    {id:2,name:"Demo Customer 2",phone:"+961 70 222 222"},
    {id:3,name:"Demo Customer 3",phone:"+961 70 333 333"},
    {id:4,name:"Demo Customer 4",phone:"+961 70 444 444"},
  ],
  vehicles: [
    {id:1,plate:"M 668987",make:"Kia",model:"Cerato",year:2022,color:"Silver",category:"Sedan",seats:5,transmission:"Automatic",rate:45,source:"Own Fleet",supplier:null,status:"Available"},
    {id:2,plate:"M 668983",make:"Hyundai",model:"Tucson",year:2023,color:"White",category:"SUV",seats:5,transmission:"Automatic",rate:65,source:"Own Fleet",supplier:null,status:"Out on Rental"},
    {id:3,plate:"M 668904",make:"Hyundai",model:"Elantra",year:2022,color:"White",category:"Sedan",seats:5,transmission:"Automatic",rate:50,source:"Own Fleet",supplier:null,status:"Reserved"},
    {id:4,plate:"M 410352",make:"Hyundai",model:"Accent",year:2021,color:"Silver",category:"Economy",seats:5,transmission:"Automatic",rate:38,source:"Own Fleet",supplier:null,status:"Available"},
    {id:5,plate:"M 659448",make:"Hyundai",model:"Grand i10",year:2022,color:"Black",category:"Compact",seats:5,transmission:"Automatic",rate:35,source:"Own Fleet",supplier:null,status:"Out on Rental"},
    {id:6,plate:"M 669265",make:"Kia",model:"Sportage",year:2023,color:"Black",category:"SUV",seats:5,transmission:"Automatic",rate:65,source:"Own Fleet",supplier:null,status:"Available"},
    {id:7,plate:"M 663084",make:"Hyundai",model:"Santa Fe",year:2023,color:"Black",category:"Large SUV",seats:7,transmission:"Automatic",rate:85,source:"Own Fleet",supplier:null,status:"Out on Rental"},
    {id:8,plate:"673799",make:"Renault",model:"Koleos",year:2022,color:"White",category:"SUV",seats:5,transmission:"Automatic",rate:60,source:"Own Fleet",supplier:null,status:"Out of Order"},
    {id:9,plate:"1704",make:"Land Rover",model:"Defender",year:2024,color:"Black",category:"Luxury",seats:5,transmission:"Automatic",rate:160,source:"Own Fleet",supplier:null,status:"Reserved"},
    {id:10,plate:"7299",make:"Cadillac",model:"Escalade",year:2023,color:"Black",category:"Luxury",seats:7,transmission:"Automatic",rate:190,source:"External",supplier:"Boss",status:"Available"},
    {id:11,plate:"670235",make:"Mitsubishi",model:"Eclipse Cross",year:2022,color:"White",category:"SUV",seats:5,transmission:"Automatic",rate:70,source:"External",supplier:"Mekano",status:"Available"},
    {id:12,plate:"672807",make:"Nissan",model:"Grand HB",year:2022,color:"Silver",category:"Hatchback",seats:5,transmission:"Automatic",rate:45,source:"External",supplier:"Majid",status:"Out on Rental"},
    {id:13,plate:"674084",make:"Kia",model:"Rio",year:2021,color:"White",category:"Economy",seats:5,transmission:"Automatic",rate:40,source:"External",supplier:"Boss",status:"Reserved"},
    {id:14,plate:"674030",make:"Renault",model:"Koleos",year:2023,color:"Grey",category:"SUV",seats:5,transmission:"Automatic",rate:65,source:"External",supplier:"Boss",status:"Available"},
    {id:15,plate:"412077",make:"Ford",model:"Edge",year:2022,color:"Black",category:"SUV",seats:5,transmission:"Automatic",rate:70,source:"External",supplier:"Jonny",status:"Available"},
  ],
  rentals: [
    {id:1001,customer:"Demo Customer 1",vehicle_id:2,start:"2026-08-10T10:00",end:"2026-08-16T16:00",pickup:"Hasbaya Office",dropoff:"Beirut Airport",rate:65,status:"Active",guarantee:"Specific Vehicle"},
    {id:1002,customer:"Demo Customer 2",vehicle_id:5,start:"2026-08-08T11:00",end:"2026-08-18T11:00",pickup:"Beirut Airport",dropoff:"Hasbaya Office",rate:35,status:"Active",guarantee:"Vehicle or Similar"},
    {id:1003,customer:"Demo Customer 3",vehicle_id:7,start:"2026-08-02T09:00",end:"2026-08-15T09:00",pickup:"Hasbaya Office",dropoff:"Hasbaya Office",rate:85,status:"Active",guarantee:"Specific Vehicle"},
    {id:1004,customer:"Demo Customer 4",vehicle_id:3,start:"2026-08-17T13:00",end:"2026-08-24T13:00",pickup:"Beirut",dropoff:"Beirut",rate:50,status:"Reserved",guarantee:"Vehicle or Similar"},
    {id:1005,customer:"Demo Customer 2",vehicle_id:9,start:"2026-08-20T10:00",end:"2026-08-31T10:00",pickup:"Beirut Airport",dropoff:"Beirut Airport",rate:160,status:"Reserved",guarantee:"Specific Vehicle"},
    {id:1006,customer:"Demo Customer 1",vehicle_id:12,start:"2026-08-09T08:00",end:"2026-08-15T18:00",pickup:"Hasbaya Office",dropoff:"Hasbaya Office",rate:45,status:"Active",guarantee:"Vehicle or Similar"},
  ]
};

const state = {
  page: "dashboard",
  vehicles: JSON.parse(localStorage.getItem("ascr_vehicles") || "null") || demo.vehicles,
  rentals: JSON.parse(localStorage.getItem("ascr_rentals") || "null") || demo.rentals,
  customers: JSON.parse(localStorage.getItem("ascr_customers") || "null") || demo.customers,
  suppliers: JSON.parse(localStorage.getItem("ascr_suppliers") || "null") || demo.suppliers,
  locations: JSON.parse(localStorage.getItem("ascr_locations") || "null") || demo.locations,
};

function persist(){
  localStorage.setItem("ascr_vehicles", JSON.stringify(state.vehicles));
  localStorage.setItem("ascr_rentals", JSON.stringify(state.rentals));
  localStorage.setItem("ascr_customers", JSON.stringify(state.customers));
  localStorage.setItem("ascr_suppliers", JSON.stringify(state.suppliers));
  localStorage.setItem("ascr_locations", JSON.stringify(state.locations));
}

function vehicleById(id){ return state.vehicles.find(v => Number(v.id) === Number(id)); }
function statusClass(s){
  s = (s||"").toLowerCase();
  if(s.includes("available")) return "badge-available";
  if(s.includes("out of order") || s.includes("maintenance")) return "badge-oos";
  if(s.includes("reserved")) return "badge-reserved";
  if(s.includes("out")) return "badge-out";
  return "";
}
function money(n){ return `$${Number(n||0).toFixed(0)}`; }
function fmtDate(iso){
  if(!iso) return "";
  return new Date(iso).toLocaleString("en-AU",{day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit"});
}
function overlaps(aStart,aEnd,bStart,bEnd){
  return new Date(aStart) < new Date(bEnd) && new Date(aEnd) > new Date(bStart);
}
function rentalDays(start,end){
  const ms = new Date(end)-new Date(start);
  return Math.max(1, Math.ceil(ms/(1000*60*60*24)));
}

const pageMeta = {
  dashboard:["Dashboard","Fleet and rental operations at a glance"],
  today:["Today","Returns, pickups, available cars and attention items"],
  availability:["Availability","Search the fleet across a complete date and time range"],
  rentals:["Rentals","Manage reservations, active rentals, extensions and returns"],
  calendar:["Calendar","Visual fleet booking timeline"],
  fleet:["Fleet","Own and external vehicles"],
  customers:["Customers","Customer directory and rental history foundation"],
  suppliers:["Suppliers","Partner companies and external vehicle sources"],
  locations:["Locations & Fees","Pickup, drop-off and transfer pricing"],
  settings:["Settings","System configuration and import preparation"]
};

function render(){
  const [title,sub] = pageMeta[state.page];
  $("#pageTitle").textContent = title;
  $("#pageSubtitle").textContent = sub;
  $$(".nav-btn").forEach(b=>b.classList.toggle("active",b.dataset.page===state.page));

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
  $("#content").innerHTML = map[state.page]();
  bindPageEvents();
}

function renderDashboard(){
  const available = state.vehicles.filter(v=>v.status==="Available").length;
  const out = state.vehicles.filter(v=>v.status==="Out on Rental").length;
  const reserved = state.vehicles.filter(v=>v.status==="Reserved").length;
  const external = state.vehicles.filter(v=>v.source==="External").length;
  const oos = state.vehicles.filter(v=>["Out of Order","Maintenance"].includes(v.status)).length;
  const today = new Date("2026-08-14T12:00:00");
  const returnsToday = state.rentals.filter(r => new Date(r.end).toDateString() === today.toDateString());
  const pickupsToday = state.rentals.filter(r => new Date(r.start).toDateString() === today.toDateString());

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
          <div class="note">Conflict detection is active in Availability Search. Rental extensions will use the same overlap logic in the next development stage.</div>
        </div>
      </div>
    </div>

    <div class="panel" style="margin-top:14px">
      <div class="panel-head"><h2>Upcoming Rentals</h2><button class="btn btn-small btn-secondary" data-goto="rentals">View All</button></div>
      <div class="table-wrap">${rentalTable([...state.rentals].sort((a,b)=>new Date(a.start)-new Date(b.start)).slice(0,8))}</div>
    </div>`;
}

function stat(label,value,sub){
  return `<div class="stat"><div class="label">${label}</div><div class="value">${value}</div><div class="sub">${sub}</div></div>`;
}

function rentalTable(rows){
  if(!rows.length) return `<div class="empty">Nothing scheduled.</div>`;
  return `<table>
    <thead><tr><th>Rental</th><th>Vehicle</th><th>Customer</th><th>Pickup</th><th>Return</th><th>Status</th></tr></thead>
    <tbody>${rows.map(r=>{
      const v=vehicleById(r.vehicle_id);
      return `<tr>
        <td>#${r.id}</td><td>${v?`${v.make} ${v.model} · ${v.plate}`:"Unassigned"}</td><td>${r.customer}</td>
        <td>${fmtDate(r.start)} · ${r.pickup}</td><td>${fmtDate(r.end)} · ${r.dropoff}</td>
        <td><span class="badge ${r.status==="Active"?"badge-out":"badge-reserved"}">${r.status}</span></td>
      </tr>`;
    }).join("")}</tbody>
  </table>`;
}

function renderToday(){
  const today = new Date("2026-08-14T12:00:00");
  const ret = state.rentals.filter(r => new Date(r.end).toDateString()===today.toDateString());
  const pick = state.rentals.filter(r => new Date(r.start).toDateString()===today.toDateString());
  const avail = state.vehicles.filter(v=>v.status==="Available");
  const external = state.vehicles.filter(v=>v.source==="External" && v.status!=="Available");

  return `
    <div class="section-title"><div><h2>Friday 14 August 2026</h2><p>Daily operations view</p></div></div>
    <div class="grid two-col">
      <div class="panel"><div class="panel-head"><h3>Returns Today</h3><span class="badge badge-out">${ret.length}</span></div><div class="table-wrap">${rentalTable(ret)}</div></div>
      <div class="panel"><div class="panel-head"><h3>Pickups Today</h3><span class="badge badge-reserved">${pick.length}</span></div><div class="table-wrap">${rentalTable(pick)}</div></div>
    </div>
    <div class="grid two-col" style="margin-top:14px">
      <div class="panel"><div class="panel-head"><h3>Vehicles Available in Office</h3><span class="badge badge-available">${avail.length}</span></div><div class="panel-body">
        <div class="kpi-row">${avail.map(v=>`<span class="badge badge-available">${v.model} · ${v.plate}</span>`).join("")}</div>
      </div></div>
      <div class="panel"><div class="panel-head"><h3>External Vehicles Requiring Action</h3></div><div class="panel-body">
        ${external.length ? external.map(v=>`<div class="note" style="margin-bottom:8px"><strong>${v.make} ${v.model}</strong> · ${v.plate}<br>Supplier: ${v.supplier} · ${v.status}</div>`).join("") : `<div class="empty">No external action items.</div>`}
      </div></div>
    </div>`;
}

function renderAvailability(){
  return `
    <div class="filters">
      <div class="field"><label>Pickup Date</label><input id="aStartDate" type="date" value="2026-08-18"></div>
      <div class="field"><label>Pickup Time</label><input id="aStartTime" type="time" value="10:00"></div>
      <div class="field"><label>Pickup Location</label><select id="aPickup">${locationOptions("Hasbaya Office")}</select></div>
      <div class="field"><label>Return Date</label><input id="aEndDate" type="date" value="2026-08-25"></div>
      <div class="field"><label>Return Time</label><input id="aEndTime" type="time" value="17:00"></div>
      <div class="field"><label>Drop-off Location</label><select id="aDropoff">${locationOptions("Hasbaya Office")}</select></div>
      <div class="field"><label>Category</label><select id="aCategory"><option value="">Any</option>${[...new Set(state.vehicles.map(v=>v.category))].map(x=>`<option>${x}</option>`).join("")}</select></div>
      <div class="field"><label>Seats</label><select id="aSeats"><option value="">Any</option><option>5</option><option>7</option></select></div>
      <div class="field"><label>Transmission</label><select id="aTrans"><option value="">Any</option><option>Automatic</option><option>Manual</option></select></div>
      <div class="field" style="display:flex;align-items:end"><button id="searchAvailability" class="btn btn-primary" style="width:100%">Search Availability</button></div>
    </div>
    <div id="availabilityResults">
      <div class="panel"><div class="panel-body"><div class="note">Choose the customer's dates, times and locations, then search. The system checks the complete requested time range against existing rentals.</div></div></div>
    </div>`;
}

function availabilitySearch(){
  const start = `${$("#aStartDate").value}T${$("#aStartTime").value}`;
  const end = `${$("#aEndDate").value}T${$("#aEndTime").value}`;
  const cat = $("#aCategory").value;
  const seats = $("#aSeats").value;
  const trans = $("#aTrans").value;
  const pickup = state.locations.find(x=>x.name===$("#aPickup").value);
  const dropoff = state.locations.find(x=>x.name===$("#aDropoff").value);

  if(new Date(end)<=new Date(start)){
    $("#availabilityResults").innerHTML=`<div class="alert">Return must be after pickup.</div>`; return;
  }

  let candidates = state.vehicles.filter(v => !["Out of Order","Maintenance","Inactive"].includes(v.status));
  if(cat) candidates = candidates.filter(v=>v.category===cat);
  if(seats) candidates = candidates.filter(v=>String(v.seats)===seats);
  if(trans) candidates = candidates.filter(v=>v.transmission===trans);

  const results = candidates.map(v=>{
    const conflict = state.rentals.some(r=>Number(r.vehicle_id)===Number(v.id) && r.status!=="Cancelled" && overlaps(start,end,r.start,r.end));
    const days = rentalDays(start,end);
    const locationFees = Number(pickup?.pickup_fee||0)+Number(dropoff?.dropoff_fee||0);
    return {...v, conflict, days, estimate: days*Number(v.rate||0)+locationFees, locationFees};
  });

  const exact = results.filter(v=>!v.conflict && v.source==="Own Fleet");
  const external = results.filter(v=>!v.conflict && v.source==="External");
  const unavailable = results.filter(v=>v.conflict);

  $("#availabilityResults").innerHTML = `
    ${availabilityGroup("Available — Own Fleet",exact)}
    ${availabilityGroup("External / Partner Vehicles",external)}
    ${availabilityGroup("Unavailable for These Dates",unavailable,true)}
  `;
}

function availabilityGroup(title,rows,blocked=false){
  return `<div class="panel" style="margin-bottom:14px">
    <div class="panel-head"><h3>${title}</h3><span class="badge ${blocked?"badge-oos":"badge-available"}">${rows.length}</span></div>
    <div class="panel-body">
      ${rows.length?`<div class="vehicle-grid">${rows.map(v=>`
        <div class="vehicle-card">
          <div class="kpi-row">
            <span class="badge ${v.source==="External"?"badge-external":"badge-available"}">${v.source}</span>
            ${v.supplier?`<span class="badge badge-external">${v.supplier}</span>`:""}
          </div>
          <h3 style="margin-top:10px">${v.make} ${v.model}</h3>
          <div class="vehicle-meta">${v.plate} · ${v.category} · ${v.seats} seats · ${v.transmission}</div>
          <div class="vehicle-rate">${money(v.rate)}/day</div>
          <div class="vehicle-meta">${blocked?"Conflicts with an existing booking":`Estimated rental: ${money(v.estimate)} incl. ${money(v.locationFees)} location fees`}</div>
          ${blocked?"":`<div class="card-actions"><button class="btn btn-primary btn-small">Create Quote</button><button class="btn btn-secondary btn-small">Reserve</button></div>`}
        </div>`).join("")}</div>`:`<div class="empty">No matching vehicles.</div>`}
    </div>
  </div>`;
}

function locationOptions(selected){
  return state.locations.map(l=>`<option ${l.name===selected?"selected":""}>${l.name}</option>`).join("");
}

function renderRentals(){
  return `
    <div class="section-title"><div><h2>Rental Agreements</h2><p>Reservations and active rentals</p></div><button class="btn btn-primary" id="newRentalBtn">New Rental</button></div>
    <div class="panel"><div class="table-wrap">
      <table><thead><tr><th>Agreement</th><th>Customer</th><th>Vehicle</th><th>Period</th><th>Locations</th><th>Rate</th><th>Est. Rental</th><th>Status</th></tr></thead>
      <tbody>${state.rentals.map(r=>{const v=vehicleById(r.vehicle_id);return `<tr>
        <td>#${r.id}</td><td>${r.customer}</td><td>${v?`${v.make} ${v.model} · ${v.plate}`:"Unassigned"}</td>
        <td>${fmtDate(r.start)} → ${fmtDate(r.end)}</td><td>${r.pickup} → ${r.dropoff}</td>
        <td>${money(r.rate)}/day</td><td>${money(rentalDays(r.start,r.end)*r.rate)}</td>
        <td><span class="badge ${r.status==="Active"?"badge-out":"badge-reserved"}">${r.status}</span></td>
      </tr>`}).join("")}</tbody></table>
    </div></div>`;
}

function renderCalendar(){
  const start = new Date("2026-08-14T00:00");
  const days = Array.from({length:14},(_,i)=>{const d=new Date(start);d.setDate(d.getDate()+i);return d;});
  return `
    <div class="panel">
      <div class="panel-head"><h3>Fleet Timeline — 14 Days</h3><div class="kpi-row"><span class="badge badge-out">Booked</span><span class="badge badge-available">Available gaps</span></div></div>
      <div class="panel-body timeline">
        <div class="timeline-grid">
          <div class="timeline-row header"><div class="timeline-vehicle">Vehicle</div>${days.map(d=>`<div class="timeline-cell">${d.toLocaleDateString("en-AU",{day:"2-digit",month:"short"})}</div>`).join("")}</div>
          ${state.vehicles.slice(0,12).map(v=>`
            <div class="timeline-row">
              <div class="timeline-vehicle">${v.model}<br><span style="font-weight:400;color:#718096">${v.plate}</span></div>
              ${days.map(d=>{
                const startDay=new Date(d); const endDay=new Date(d); endDay.setDate(endDay.getDate()+1);
                const r=state.rentals.find(r=>Number(r.vehicle_id)===Number(v.id) && overlaps(startDay,endDay,r.start,r.end));
                return `<div class="timeline-cell">${r?`<div class="timeline-bar">#${r.id}</div>`:""}</div>`;
              }).join("")}
            </div>`).join("")}
        </div>
      </div>
    </div>`;
}

function renderFleet(){
  return `
    <div class="section-title"><div><h2>Fleet Board</h2><p>Own and partner vehicles</p></div><button class="btn btn-primary" id="newVehicleBtn">Add Vehicle</button></div>
    <div class="vehicle-grid">
      ${state.vehicles.map(v=>`
        <div class="vehicle-card">
          <div class="kpi-row">
            <span class="badge ${statusClass(v.status)}">${v.status}</span>
            <span class="badge ${v.source==="External"?"badge-external":"badge-available"}">${v.source}</span>
          </div>
          <h3 style="margin-top:10px">${v.make} ${v.model}</h3>
          <div class="vehicle-meta">${v.plate} · ${v.color} · ${v.category}<br>${v.seats} seats · ${v.transmission}</div>
          <div class="vehicle-rate">${money(v.rate)}/day</div>
          ${v.supplier?`<div class="vehicle-meta">Supplier: <strong>${v.supplier}</strong></div>`:""}
          <div class="card-actions"><button class="btn btn-secondary btn-small" data-vehicle="${v.id}">Details</button></div>
        </div>`).join("")}
    </div>`;
}

function renderCustomers(){
  return `
    <div class="section-title"><div><h2>Customers</h2><p>Reusable customer records</p></div><button class="btn btn-primary" id="newCustomerBtn">Add Customer</button></div>
    <div class="panel"><div class="table-wrap"><table>
      <thead><tr><th>Name</th><th>Phone</th><th>Active/Upcoming Rentals</th></tr></thead>
      <tbody>${state.customers.map(c=>`<tr><td>${c.name}</td><td>${c.phone||""}</td><td>${state.rentals.filter(r=>r.customer===c.name && ["Active","Reserved"].includes(r.status)).length}</td></tr>`).join("")}</tbody>
    </table></div></div>`;
}

function renderSuppliers(){
  return `
    <div class="section-title"><div><h2>Suppliers / Partner Companies</h2><p>External vehicle sources</p></div></div>
    <div class="vehicle-grid">${state.suppliers.map(s=>`
      <div class="vehicle-card"><h3>${s.name}</h3><div class="vehicle-meta">${s.phone||""}</div>
      <div class="vehicle-rate">${state.vehicles.filter(v=>v.supplier===s.name).length}</div><div class="vehicle-meta">vehicles currently in fleet list</div></div>`).join("")}
    </div>`;
}

function renderLocations(){
  return `
    <div class="section-title"><div><h2>Locations & Fees</h2><p>Default pickup and drop-off pricing</p></div></div>
    <div class="panel"><div class="table-wrap"><table>
      <thead><tr><th>Location</th><th>Pickup / Delivery Fee</th><th>Drop-off / Collection Fee</th><th>Transfer Buffer</th></tr></thead>
      <tbody>${state.locations.map(l=>`<tr><td>${l.name}</td><td>${money(l.pickup_fee)}</td><td>${money(l.dropoff_fee)}</td><td>${l.turnaround_mins} mins</td></tr>`).join("")}</tbody>
    </table></div></div>
    <div class="note" style="margin-top:14px">Fees are demonstration values only and can be replaced with the business's real Hasbaya / Beirut / airport pricing.</div>`;
}

function renderSettings(){
  return `
    <div class="grid two-col">
      <div class="panel"><div class="panel-head"><h3>Supabase Connection</h3></div><div class="panel-body">
        <p class="note">This starter build runs immediately using demo data stored in the browser. When Supabase is configured, the next stage will switch the data layer to live database reads/writes.</p>
        <p><strong>Status:</strong> ${window.db?'<span class="badge badge-available">Connected</span>':'<span class="badge badge-reserved">Demo / Local Mode</span>'}</p>
      </div></div>
      <div class="panel"><div class="panel-head"><h3>Import Data</h3></div><div class="panel-body">
        <h3 style="margin-top:0">Excel / Existing Data Import</h3>
        <p class="note">Coming in the migration phase. The database schema is already structured so vehicles, customers, bookings and external suppliers can be imported cleanly.</p>
      </div></div>
    </div>`;
}

function openModal(title, body, onSave){
  $("#modalTitle").textContent=title;
  $("#modalBody").innerHTML=body;
  const dlg=$("#modal");
  dlg.showModal();
  $("#modalForm").onsubmit=(e)=>{
    e.preventDefault();
    if(onSave && onSave()===false) return;
    dlg.close();
  };
}

function bindPageEvents(){
  $$("[data-goto]").forEach(b=>b.onclick=()=>go(b.dataset.goto));
  $("#searchAvailability")?.addEventListener("click", availabilitySearch);

  $("#newVehicleBtn")?.addEventListener("click",()=>openModal("Add Vehicle",`
    <div class="grid two-col">
      <div class="field"><label>Make</label><input id="vMake"></div>
      <div class="field"><label>Model</label><input id="vModel"></div>
      <div class="field"><label>Plate</label><input id="vPlate"></div>
      <div class="field"><label>Colour</label><input id="vColor"></div>
      <div class="field"><label>Category</label><input id="vCategory"></div>
      <div class="field"><label>Daily Rate</label><input id="vRate" type="number" min="0"></div>
      <div class="field"><label>Source</label><select id="vSource"><option>Own Fleet</option><option>External</option></select></div>
      <div class="field"><label>Supplier</label><input id="vSupplier" placeholder="If external"></div>
    </div>`, ()=>{
      if(!$("#vMake").value || !$("#vModel").value || !$("#vPlate").value) return false;
      state.vehicles.push({
        id:Date.now(),make:$("#vMake").value,model:$("#vModel").value,plate:$("#vPlate").value,color:$("#vColor").value,
        category:$("#vCategory").value||"Other",seats:5,transmission:"Automatic",rate:Number($("#vRate").value||0),
        source:$("#vSource").value,supplier:$("#vSupplier").value||null,status:"Available"
      }); persist(); render();
    }));

  $("#newCustomerBtn")?.addEventListener("click",()=>openModal("Add Customer",`
    <div class="field"><label>Full Name</label><input id="cName"></div>
    <div class="field" style="margin-top:10px"><label>Mobile</label><input id="cPhone"></div>`,()=>{
      if(!$("#cName").value) return false;
      state.customers.push({id:Date.now(),name:$("#cName").value,phone:$("#cPhone").value}); persist(); render();
    }));

  $("#newRentalBtn")?.addEventListener("click", newRentalModal);
}

function newRentalModal(){
  openModal("New Rental",`
    <div class="grid two-col">
      <div class="field"><label>Customer</label><select id="rCustomer">${state.customers.map(c=>`<option>${c.name}</option>`).join("")}</select></div>
      <div class="field"><label>Vehicle</label><select id="rVehicle">${state.vehicles.filter(v=>!["Out of Order","Maintenance"].includes(v.status)).map(v=>`<option value="${v.id}">${v.make} ${v.model} · ${v.plate}</option>`).join("")}</select></div>
      <div class="field"><label>Pickup</label><input id="rStart" type="datetime-local" value="2026-08-18T10:00"></div>
      <div class="field"><label>Return</label><input id="rEnd" type="datetime-local" value="2026-08-25T17:00"></div>
      <div class="field"><label>Pickup Location</label><select id="rPickup">${locationOptions("Hasbaya Office")}</select></div>
      <div class="field"><label>Drop-off Location</label><select id="rDropoff">${locationOptions("Hasbaya Office")}</select></div>
      <div class="field"><label>Agreed Daily Rate</label><input id="rRate" type="number" value="45"></div>
      <div class="field"><label>Guarantee</label><select id="rGuarantee"><option>Specific Vehicle</option><option>Vehicle or Similar</option></select></div>
    </div>
    <div id="rConflict" style="margin-top:12px"></div>`,()=>{
      const vid=Number($("#rVehicle").value), start=$("#rStart").value, end=$("#rEnd").value;
      const conflict = state.rentals.some(r=>Number(r.vehicle_id)===vid && r.status!=="Cancelled" && overlaps(start,end,r.start,r.end));
      if(conflict){
        $("#rConflict").innerHTML=`<div class="alert">This vehicle conflicts with an existing booking. Choose another vehicle or change the dates.</div>`;
        return false;
      }
      state.rentals.push({
        id:Math.max(...state.rentals.map(r=>r.id))+1,customer:$("#rCustomer").value,vehicle_id:vid,start,end,
        pickup:$("#rPickup").value,dropoff:$("#rDropoff").value,rate:Number($("#rRate").value||0),
        status:"Reserved",guarantee:$("#rGuarantee").value
      });
      persist(); render();
    });
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

render();
