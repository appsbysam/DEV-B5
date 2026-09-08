/* B5 v0.9.16 — secure contract signing */
(function(){
  async function createSigningLink(contract,role='lessee'){
    const customer=state.customers.find(c=>String(c.id)===String(contract.customer_id));
    const {data,error}=await window.db.functions.invoke('b5-contract-signing',{body:{action:'create',contract_id:contract.id,signer_role:role,signer_name:role==='lessee'?(customerDisplayName(customer)||''):state.userProfile?.display_name||'',signer_email:role==='lessee'?(customer?.email||''):state.userProfile?.email||''}});
    if(error||data?.error)throw new Error(data?.error||error?.message||'Unable to create signing link.');
    return `${location.origin}${location.pathname.replace(/[^/]*$/,'')}sign.html?token=${encodeURIComponent(data.token)}`;
  }
  window.b5SendContractForSignature=async function(uuid){
    const ct=contractForRental(uuid);if(!ct)return alert('Create and save the contract first.');
    try{const link=await createSigningLink(ct,'lessee');const c=state.customers.find(x=>String(x.id)===String(ct.customer_id));const msg=`Please review and sign your All Season Car Rental agreement ${ct.contract_number||''}:\n${link}`;
      if(navigator.share){await navigator.share({title:'Rental agreement for signature',text:msg,url:link}).catch(()=>{});}else{await navigator.clipboard.writeText(link);alert('Secure signing link copied to clipboard.');}
      await logAudit?.('contract_signing_link_created','contract',ct.id,{rental_agreement_id:uuid,customer:c?customerDisplayName(c):null});
    }catch(e){alert(e.message||'Unable to create signing link.');}
  };
  const prior=openRentalDetails;
  openRentalDetails=function(uuid){prior(uuid);const body=document.getElementById('modalBody'),ct=contractForRental(uuid);if(!body||!ct)return;const panel=body.querySelector('.contract-action-panel');if(!panel)return;const btn=document.createElement('button');btn.type='button';btn.className='btn btn-secondary';btn.textContent=ct.lessee_signature?'Signed ✓':'Send for Signature';btn.disabled=!!ct.lessee_signature;btn.onclick=()=>window.b5SendContractForSignature(uuid);panel.appendChild(btn);};
})();