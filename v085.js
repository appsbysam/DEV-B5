/* B5 v0.8.5 — integrated rental contracts */
Object.assign(state,{contracts:[]});

const _loadSupabaseData084=loadSupabaseData;
loadSupabaseData=async function(){
  await _loadSupabaseData084();
  if(!state.live)return;
  try{
    const {data,error}=await window.db.from("contracts").select("*").order("created_at",{ascending:false});
    state.contracts=error?[]:(data||[]);
  }catch{state.contracts=[];}
};

function contractForRental(uuid){return state.contracts.find(c=>String(c.rental_agreement_id)===String(uuid))||null;}
function openContract(uuid){
  if(!uuid)return;
  window.location.href=`contract.html?rental=${encodeURIComponent(uuid)}`;
}
function contractStatusBadgeForRental(uuid){
  const c=contractForRental(uuid);
  if(!c)return '<span class="badge badge-demo">No contract yet</span>';
  const cls=c.status==="Signed / Finalised"||c.status==="Closed"?"badge-available":c.status==="Ready for Signature"?"badge-reserved":"badge-demo";
  return `<span class="badge ${cls}">${esc(c.contract_number)} · ${esc(c.status)}</span>`;
}

const _openRentalDetails084=openRentalDetails;
openRentalDetails=function(uuid){
  _openRentalDetails084(uuid);
  const body=$("#modalBody"); if(!body)return;
  const c=contractForRental(uuid);
  const panel=document.createElement("div");
  panel.className="contract-action-panel";
  panel.innerHTML=`<div><strong>Rental Contract</strong><div class="vehicle-meta">${c?`${esc(c.contract_number)} · ${esc(c.status)}`:"Create the contract from this rental and pre-fill customer, vehicle and pricing details."}</div></div><button type="button" class="btn btn-primary" id="openRentalContract">${c?"Open Contract":"Create Contract"}</button>`;
  body.prepend(panel);
  $("#openRentalContract").onclick=()=>openContract(uuid);
};

const _openCustomerProfile084=openCustomerProfile;
openCustomerProfile=function(id){
  _openCustomerProfile084(id);
  const body=$("#modalBody"); if(!body)return;
  const rentals=state.rentals.filter(r=>String(r.customer_id)===String(id));
  const contracts=state.contracts.filter(c=>rentals.some(r=>String(r.uuid)===String(c.rental_agreement_id)));
  if(!contracts.length)return;
  const section=document.createElement("div");
  section.className="detail-tabs-section";
  section.innerHTML=`<h3>Contracts (${contracts.length})</h3>${contracts.map(c=>`<button type="button" class="contract-history-row" data-customer-contract="${esc(c.rental_agreement_id)}"><strong>${esc(c.contract_number)}</strong><span>${esc(c.status)}</span><span>Open ›</span></button>`).join("")}`;
  body.appendChild(section);
  $$("[data-customer-contract]").forEach(b=>b.onclick=()=>openContract(b.dataset.customerContract));
};

const _openVehicleDetails084=openVehicleDetails;
openVehicleDetails=function(id){
  _openVehicleDetails084(id);
  const body=$("#modalBody"); if(!body)return;
  const contracts=state.contracts.filter(c=>String(c.vehicle_id)===String(id));
  if(!contracts.length)return;
  const section=document.createElement("div");
  section.className="detail-tabs-section";
  section.innerHTML=`<h3>Contracts (${contracts.length})</h3>${contracts.slice(0,30).map(c=>`<button type="button" class="contract-history-row" data-vehicle-contract="${esc(c.rental_agreement_id)}"><strong>${esc(c.contract_number)}</strong><span>${esc(c.status)}</span><span>Open ›</span></button>`).join("")}`;
  body.appendChild(section);
  $$("[data-vehicle-contract]").forEach(b=>b.onclick=()=>openContract(b.dataset.vehicleContract));
};
