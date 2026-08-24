/* B5 v0.9.12 — vehicle detail workflow and modal return behaviour */
(function(){
  if(window.__b5VehicleDetail0912) return;
  window.__b5VehicleDetail0912=true;

  const originalOpenVehicleDetails=window.openVehicleDetails;
  if(typeof originalOpenVehicleDetails!=="function") return;

  function reopenVehicleAfterChild(vehicleId, opener){
    const parent=document.getElementById("modal");
    if(parent?.open) parent.close();
    setTimeout(()=>{
      opener(vehicleId);
      const child=document.getElementById("modal");
      if(!child) return;
      child.addEventListener("close",()=>{
        setTimeout(()=>window.openVehicleDetails(vehicleId),70);
      },{once:true});
    },70);
  }

  function reorderFinancialTiles(){
    const summary=document.querySelector("#modalBody .vehicle-detail-summary");
    if(!summary) return;
    const tiles=[...summary.children];
    const wanted=["Purchase Cost","Expenses","Rental Income","Operating Profit"];
    wanted.forEach(label=>{
      const tile=tiles.find(el=>el.textContent.trim().toLowerCase().startsWith(label.toLowerCase()));
      if(tile) summary.appendChild(tile);
    });
  }

  window.openVehicleDetails=function(vehicleId){
    originalOpenVehicleDetails(vehicleId);
    reorderFinancialTiles();

    const purchase=document.getElementById("editVehiclePurchase");
    const expense=document.getElementById("addVehicleExpense");
    const maintenance=document.getElementById("addVehicleMaintenance");

    if(purchase && typeof window.vehiclePurchaseModal==="function"){
      purchase.onclick=()=>reopenVehicleAfterChild(vehicleId,window.vehiclePurchaseModal);
    }
    if(expense && typeof window.vehicleExpenseModal==="function"){
      expense.onclick=()=>reopenVehicleAfterChild(vehicleId,window.vehicleExpenseModal);
    }
    if(maintenance && typeof window.vehicleMaintenanceModal==="function"){
      maintenance.onclick=()=>reopenVehicleAfterChild(vehicleId,window.vehicleMaintenanceModal);
    }
  };
})();
