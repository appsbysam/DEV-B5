/* B5 v0.9.31 — unified customer/rental modal presentation */
(()=>{
  const STYLE_ID='b5-v0931-modal-style';
  if(!document.getElementById(STYLE_ID)){
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      #modal.b5-unified-modal .modal-card{border-radius:16px;overflow:hidden}
      #modal.b5-unified-modal .modal-head{padding:18px 20px;border-bottom:1px solid #e4e9f0}
      #modal.b5-unified-modal #modalBody{padding:18px 20px}
      #modal.b5-unified-modal .modal-actions{padding:14px 20px;border-top:1px solid #e4e9f0;gap:8px}
      #modal.b5-unified-modal .contract-action-panel,
      #modal.b5-unified-modal .customer-account-head,
      #modal.b5-unified-modal .kpi-mini,
      #modal.b5-unified-modal .detail-tabs-section{margin-bottom:14px}
      #modal.b5-unified-modal .contract-action-panel{border-radius:12px;padding:12px}
      #modal.b5-unified-modal .detail-tabs-section{padding-top:14px;border-top:1px solid #e4e9f0}
      #modal.b5-unified-modal .detail-tabs-section h3{margin:0 0 10px}
      #modal.b5-unified-modal .customer-account-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;flex-wrap:wrap}
      #modal.b5-unified-modal .customer-account-head>div:first-child{min-width:180px;flex:1}
      #modal.b5-unified-modal .b5-account-mini,
      #modal.b5-unified-modal .b5-account-compact{display:inline-flex;align-items:center;width:max-content;max-width:100%;padding:8px 11px;border:1px solid #dbe3ec;border-radius:10px;background:#f8fafc;box-sizing:border-box}
      #modal.b5-unified-modal .b5-account-mini label,
      #modal.b5-unified-modal .b5-account-compact label{display:inline-flex;align-items:center;gap:8px;margin:0;font-size:13px;font-weight:600;line-height:1.2;cursor:pointer}
      #modal.b5-unified-modal .b5-account-mini input,
      #modal.b5-unified-modal .b5-account-compact input{margin:0;flex:0 0 auto}
      #modal.b5-unified-modal .b5-account-compact{margin:0;align-self:end}
      #modal.b5-unified-modal .b5-account-compact label{white-space:nowrap}
      #modal.b5-unified-modal .b5-account-controls.b5-account-controls-compact{display:flex;align-items:center;gap:8px;flex-wrap:wrap;padding:0;margin:0;border:0;background:transparent}
      #modal.b5-unified-modal .monthly-account-badge.b5-hidden-monthly-badge{display:none}
      #modal.b5-unified-modal .grid.two-col>.b5-account-compact{min-height:44px}
      #modal.b5-unified-modal .field>label{margin-bottom:6px}
      #modal.b5-unified-modal .field input,
      #modal.b5-unified-modal .field select,
      #modal.b5-unified-modal .field textarea{border-radius:9px}
      @media(max-width:700px){
        #modal.b5-unified-modal .modal-head{padding:14px 16px}
        #modal.b5-unified-modal #modalBody{padding:14px 16px}
        #modal.b5-unified-modal .modal-actions{padding:12px 16px}
        #modal.b5-unified-modal .b5-account-compact{width:100%}
        #modal.b5-unified-modal .b5-account-compact label{white-space:normal}
      }
    `;
    document.head.appendChild(style);
  }

  function conciseLabel(label,text){
    if(!label)return;
    const input=label.querySelector('input');
    if(!input)return;
    Array.from(label.childNodes).forEach(node=>{if(node.nodeType===Node.TEXT_NODE)node.remove();});
    label.append(document.createTextNode(' '+text));
  }

  function compactAddCustomer(body){
    const input=body.querySelector('#cMonthlyAccount');
    if(!input)return;
    const label=input.closest('label');
    const option=input.closest('.b5-inline-option')||label;
    if(!option)return;
    option.classList.add('b5-account-compact');
    conciseLabel(label,'Monthly account');
    const grid=body.querySelector('.grid.two-col');
    if(grid&&!grid.contains(option))grid.appendChild(option);
  }

  function compactCustomerAccount(body){
    const input=body.querySelector('#customerMonthlyToggle');
    if(!input)return;
    const label=input.closest('label');
    conciseLabel(label,'Monthly account');
    const head=body.querySelector('.customer-account-head');
    const controls=input.closest('.b5-account-controls');
    if(head&&label&&!head.contains(label)){
      const mini=document.createElement('div');
      mini.className='b5-account-mini';
      mini.appendChild(label);
      head.appendChild(mini);
    }
    const badge=body.querySelector('.monthly-account-badge');
    if(badge)badge.classList.add('b5-hidden-monthly-badge');
    if(controls){
      controls.classList.add('b5-account-controls-compact');
      if(!controls.textContent.trim()&&!controls.querySelector('button,input'))controls.remove();
    }
  }

  function decorateModal(){
    const modal=document.getElementById('modal');
    const body=document.getElementById('modalBody');
    const title=(document.getElementById('modalTitle')?.textContent||'').trim();
    if(!modal||!body||!modal.open)return;

    const isAddCustomer=title==='Add Customer';
    const isRental=/^Rental\s*#/i.test(title)||!!body.querySelector('.contract-action-panel');
    const isCustomer=!!body.querySelector('.customer-account-head')||!!body.querySelector('#customerMonthlyToggle')||!!body.querySelector('#monthlyReminderPreferences');
    if(!(isAddCustomer||isRental||isCustomer))return;

    modal.classList.add('b5-unified-modal');
    modal.classList.toggle('b5-add-customer-modal',isAddCustomer);
    modal.classList.toggle('b5-rental-detail-modal',isRental);
    modal.classList.toggle('b5-customer-profile-modal',isCustomer);

    if(isAddCustomer)compactAddCustomer(body);
    if(isCustomer)compactCustomerAccount(body);
  }

  const observer=new MutationObserver(()=>requestAnimationFrame(decorateModal));
  const modal=document.getElementById('modal');
  if(modal)observer.observe(modal,{subtree:true,childList:true,attributes:true,attributeFilter:['open']});
  document.addEventListener('click',()=>setTimeout(decorateModal,0),true);
  window.b5DecorateUnifiedModal=decorateModal;
})();
