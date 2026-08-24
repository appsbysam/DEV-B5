/* B5 v0.8.94 — promo code copy buttons */
(function(){
  async function copyPromoCode(code,btn){
    try{
      if(navigator.clipboard?.writeText){
        await navigator.clipboard.writeText(code);
      }else{
        const ta=document.createElement('textarea');
        ta.value=code;ta.setAttribute('readonly','');ta.style.position='fixed';ta.style.opacity='0';
        document.body.appendChild(ta);ta.select();document.execCommand('copy');ta.remove();
      }
      const old=btn.textContent;btn.textContent='Copied';btn.classList.add('copied');
      setTimeout(()=>{btn.textContent=old;btn.classList.remove('copied');},1200);
    }catch(err){
      console.warn('Promo code copy failed',err);
      alert('Could not copy the promo code.');
    }
  }

  function decoratePromoRows(){
    document.querySelectorAll('.promo-history-row').forEach(row=>{
      if(row.querySelector('[data-copy-promo]'))return;
      const codeEl=row.querySelector('div:first-child strong');
      const code=codeEl?.textContent?.trim();
      if(!code)return;
      const btn=document.createElement('button');
      btn.type='button';
      btn.className='btn btn-secondary btn-small promo-copy-btn';
      btn.dataset.copyPromo=code;
      btn.textContent='Copy';
      btn.setAttribute('aria-label',`Copy promo code ${code}`);
      btn.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();copyPromoCode(code,btn);});
      codeEl.parentElement.appendChild(btn);
    });
  }

  const oldBind=bindPageEvents;
  bindPageEvents=function(){oldBind();if(state.page==='manager'&&state.managerView==='promos')decoratePromoRows();};

  const obs=new MutationObserver(()=>{
    if(state.page==='manager'&&state.managerView==='promos')decoratePromoRows();
  });
  window.addEventListener('load',()=>{obs.observe(document.getElementById('content')||document.body,{childList:true,subtree:true});decoratePromoRows();});

  if(!document.getElementById('promoCopyV094Style')){
    const st=document.createElement('style');st.id='promoCopyV094Style';st.textContent=`
      .promo-history-row>div:first-child{display:grid;grid-template-columns:minmax(0,1fr) auto;column-gap:10px;align-items:center}
      .promo-history-row>div:first-child .promo-mini-label{grid-column:1/-1}
      .promo-copy-btn{justify-self:end;min-width:72px;padding:8px 12px!important}
      .promo-copy-btn.copied{font-weight:800}
      @media(max-width:700px){.promo-history-row>div:first-child{grid-template-columns:minmax(0,1fr) auto}.promo-copy-btn{min-width:68px}}
    `;document.head.appendChild(st);
  }
})();
