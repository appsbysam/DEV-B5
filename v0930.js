/* B5 v0.9.30 — Customers search deduplication */
(()=>{
  function cleanupCustomerSearch(){
    if(state.page!=='customers')return;
    const content=document.getElementById('content');
    if(!content)return;

    const searches=Array.from(content.querySelectorAll('input[type="search"]')).filter(input=>{
      const text=[input.id,input.placeholder,input.closest('.field')?.querySelector('label')?.textContent].filter(Boolean).join(' ').toLowerCase();
      return /customer|name|phone|email|licen[cs]e|passport/.test(text);
    });

    if(searches.length<=1)return;
    const keep=searches[searches.length-1];

    searches.slice(0,-1).forEach(input=>{
      if(input===keep)return;
      const wrapper=input.closest('#customerDatabaseSearch,.b5-customer-search,.panel');
      if(wrapper&&wrapper.contains(input))wrapper.remove();
      else input.closest('.field')?.remove();
    });
  }

  const previousRender=render;
  render=function(){
    const result=previousRender.apply(this,arguments);
    requestAnimationFrame(()=>setTimeout(cleanupCustomerSearch,0));
    return result;
  };

  window.b5CleanupCustomerSearch=cleanupCustomerSearch;
  window.addEventListener('load',()=>setTimeout(cleanupCustomerSearch,0));
})();
