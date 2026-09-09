/* B5 v0.9.24d — typed safeguard for permanent vehicle deletion */
(()=>{
  async function guardedVehicleDelete(button){
    const id=button?.dataset?.lifeDelete;
    const v=id?vehicleById(id):null;
    if(!v)return;
    const linked=(state.segments||[]).some(s=>String(s.vehicle_id)===String(v.id));
    if(linked){
      alert('This vehicle has rental history and cannot be permanently deleted. Deactivate/Retire it instead.');
      return;
    }
    const label=`${v.make||''} ${v.model||''}${v.year?` (${v.year})`:''} · ${v.plate||'No plate'}`;
    if(!confirm(`Permanently delete ${label}?\n\nOnly use this for a vehicle created by mistake.`))return;
    const typed=prompt(`FINAL CONFIRMATION\n\nThis permanently deletes ${label}.\n\nType DELETE to continue:`,'');
    if(typed===null)return;
    if(typed.trim().toUpperCase()!=='DELETE'){
      alert('Vehicle was NOT deleted. You must type DELETE exactly to confirm permanent deletion.');
      return;
    }
    const {error}=await db.from('vehicles').delete().eq('id',v.id);
    if(error){alert(error.message);return;}
    await logAudit('vehicle_deleted','vehicle',v.id,{reason:'mistaken_entry',plate:v.plate,confirmation:'typed_DELETE'});
    document.getElementById('modal')?.close();
    await loadSupabaseData();
  }
  document.addEventListener('click',event=>{
    const button=event.target.closest?.('[data-life-delete]');
    if(!button)return;
    event.preventDefault();
    event.stopImmediatePropagation();
    guardedVehicleDelete(button);
  },true);
})();