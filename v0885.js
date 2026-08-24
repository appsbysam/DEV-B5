/* B5 v0.8.95 — existing-rental promos + date-aware booking vehicle list */
(function(){
  function promoByCode95(code){const key=String(code||'').trim().toUpperCase();return (state.promoCodes||[]).find(p=>String(p.code||'').toUpperCase()===key)||null;}
  function promoLabel95(p){if(!p)return'';if(p.benefit_type==='Percent Discount')return `${Number(p.discount_percent||0)}% off`;if(p.benefit_type==='Free Day')return `${Number(p.free_days||1)} free day${Number(p.free_days||1)===1?'':'s'}`;return 'Promotion';}
  function validatePromo95(p,customerId){if(!p)return 'Promo code not found.';if(String(p.status||'Available').toLowerCase()!=='available')return 'This promo code is no longer available.';const t=new Date();if(p.starts_at&&t<new Date(p.starts_at))return 'This promo code is not active yet.';if(p.expires_at&&t>new Date(p.expires_at))return 'This promo code has expired.';if(p.customer_id&&String(p.customer_id)!==String(customerId||''))return 'This promo code is assigned to a different customer.';return '';}
  function rentalBase95(uuid){return (state.charges||[]).filter(c=>String(c.rental_agreement_id)===String(uuid)&&Number(c.amount)>0).reduce((s,c)=>s+Number(c.amount||0),0);}
  function rentalRate95(r){const seg=(r?.segments||[])[0];return Number(seg?.agreed_daily_rate||vehicleById(seg?.vehicle_id||r?.vehicle_id)?.rate||0);}
  function promoAmount95(p,r){const base=rentalBase95(r.uuid);if(p.benefit_type==='Percent Discount')return Math.max(0,base*Number(p.discount_percent||0)/100);if(p.benefit_type==='Free Day')return Math.min(base,Math.max(0,Number(p.free_days||1))*rentalRate95(r));return 0;}

  window.applyPromoToExistingRental95=function(uuid){
    const r=agreementByUuid(uuid);if(!r)return;
    const f=rentalFinancials(uuid);
    openModal(`Apply Promo / Discount · Rental #${r.id}`,`<div class="note">This creates a separate financial adjustment. Original rental charges remain in the history.<br><br>Current charges: <strong>${money(f.chargeTotal)}</strong> · Balance: <strong>${money(f.balance)}</strong></div><div class="field" style="margin-top:14px"><label>Promo Code</label><input id="existingPromo95" autocomplete="off" placeholder="e.g. B5-XXXXX" style="text-transform:uppercase"></div><div id="existingPromoPreview95"></div>`,async()=>{
      const p=promoByCode95($('#existingPromo95')?.value),err=validatePromo95(p,r.customer_id);if(err){alert(err);return false;}const amount=promoAmount95(p,r);if(amount<=0){alert('This promotion does not produce a discount for this rental.');return false;}
      const description=`Promo ${p.code} · ${promoLabel95(p)}`;
      const {error}=await window.db.from('rental_charges').insert({rental_agreement_id:r.uuid,charge_type:'Discount',description,amount:-amount});if(error){alert(error.message);return false;}
      const notes=[p.notes,`Used on existing rental #${r.id} · ${promoLabel95(p)} · discount ${money(amount)}`].filter(Boolean).join(' | ');
      const {error:pErr}=await window.db.from('promo_codes').update({status:'Used',notes}).eq('id',p.id);if(pErr)console.warn('Promo status update failed',pErr);
      await logAudit('promo_code_applied','rental_agreement',r.uuid,{promo_code_id:p.id,code:p.code,rental_number:r.id,discount_amount:amount,application:'existing_rental'});
      await loadSupabaseData();return true;
    },'Apply Discount');
    const preview=()=>{const p=promoByCode95($('#existingPromo95')?.value),box=$('#existingPromoPreview95');if(!box)return;if(!p){box.innerHTML='';return;}const err=validatePromo95(p,r.customer_id);if(err){box.innerHTML=`<div class="conflict-box">${esc(err)}</div>`;return;}const amount=promoAmount95(p,r);box.innerHTML=`<div class="ok-box"><strong>${esc(p.code)}</strong> · ${esc(promoLabel95(p))}<br>Adjustment: <strong>-${money(amount)}</strong><br>Estimated new balance: <strong>${money(Math.max(0,f.balance-amount))}</strong></div>`;};
    $('#existingPromo95')?.addEventListener('input',preview);
  };

  function addPromoAction95(){document.querySelectorAll('[data-direct-payment]').forEach(payment=>{const actions=payment.parentElement;if(!actions||actions.querySelector('[data-existing-promo]'))return;const uuid=payment.dataset.directPayment,btn=document.createElement('button');btn.type='button';btn.className='btn btn-secondary';btn.dataset.existingPromo=uuid;btn.textContent='Apply Promo / Discount';actions.insertBefore(btn,payment);btn.onclick=e=>{e.preventDefault();document.getElementById('modal')?.close();setTimeout(()=>window.applyPromoToExistingRental95(uuid),20);};});}
  const modalObserver95=new MutationObserver(addPromoAction95);window.addEventListener('load',()=>{modalObserver95.observe(document.body,{childList:true,subtree:true});addPromoAction95();});

  const oldBooking95=bookingModal;
  bookingModal=function(prefill={}){
    oldBooking95(prefill);
    const select=$('#rVehicle'),start=$('#rStart'),end=$('#rEnd');if(!select||!start||!end)return;
    const requested=String(prefill.vehicleId||select.value||'');
    function refreshVehicles95(){const s=start.value,e=end.value,current=select.value||requested;if(!s||!e||new Date(e)<=new Date(s))return;const candidates=(state.vehicles||[]).filter(v=>!["Out of Order","Maintenance"].includes(v.db_status)&&vehicleIsAvailable(v.id,s,e));const keep=current&&candidates.some(v=>String(v.id)===String(current));select.innerHTML=`<option value="">Select available vehicle</option>${candidates.sort((a,b)=>`${a.make||''} ${a.model||''} ${a.plate||''}`.localeCompare(`${b.make||''} ${b.model||''} ${b.plate||''}`,undefined,{numeric:true,sensitivity:'base'})).map(v=>`<option value="${esc(v.id)}" ${keep&&String(v.id)===String(current)?'selected':''}>${esc(v.make)} ${esc(v.model)} · ${esc(v.plate||'No plate')}</option>`).join('')}`;if(!keep){select.value='';const rate=$('#rRate');if(rate)rate.value='';}const field=select.closest('.field');let hint=field?.querySelector('.available-vehicle-hint95');if(field&&!hint){hint=document.createElement('small');hint.className='vehicle-meta available-vehicle-hint95';field.appendChild(hint);}if(hint)hint.textContent=`${candidates.length} vehicle${candidates.length===1?'':'s'} available for selected dates`;select.dispatchEvent(new Event('input',{bubbles:true}));}
    start.addEventListener('change',refreshVehicles95);end.addEventListener('change',refreshVehicles95);start.addEventListener('input',refreshVehicles95);end.addEventListener('input',refreshVehicles95);setTimeout(refreshVehicles95,0);
  };
})();
