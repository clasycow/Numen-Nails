/* Optional live catalog. A failed connection keeps the published HTML usable. */
window.numenCatalogReady = (async () => {
  const base=window.NUMEN_CONFIG?.studioApiBase;if(!base)return;
  try{
    const pending=fetch(base+'/public',{signal:AbortSignal.timeout(4500)}).then(r=>{if(!r.ok)throw Error();return r.json()});
    // Attach a rejection handler immediately while waiting for document parsing.
    const result=pending.then(data=>({data}),()=>({data:null}));
    if(document.readyState==='loading')await new Promise(resolve=>document.addEventListener('DOMContentLoaded',resolve,{once:true}));
    const {data}=await result;if(!data)return;
    const gallery=document.querySelector('#nailGallery');
    if(gallery&&Array.isArray(data.collections)&&data.collections.length){
      const fragment=document.createDocumentFragment();
      data.collections.forEach((set,index)=>{
        const article=document.createElement('article');article.className='nail-card projects-reveal';Object.assign(article.dataset,{setId:set.id,title:set.title,description:set.description,service:set.service,world:set.world,category:'art'+(set.service.toLowerCase().includes('press')?' presson':'')});
        const inner=document.createElement('div');inner.className='nail-card-inner';const media=document.createElement('button');media.type='button';media.className='nail-card__media has-photo has-image nail-set-cover';media.dataset.openSet='';media.setAttribute('aria-haspopup','dialog');
        const photo=p=>{const im=document.createElement('img');im.className='nail-card__photo nail-set-photo';im.src=p.src;im.alt=p.alt;im.loading='lazy';im.decoding='async';if(p.rotation)im.dataset.rotation=p.rotation;return im};
        const number=document.createElement('span');number.className='nail-card__number';number.textContent=String(index+1).padStart(2,'0');const count=document.createElement('span');count.className='nail-set-count';count.textContent=set.photos.length+' photos';media.append(photo(set.photos[0]),number,count);
        const content=document.createElement('div');content.className='nail-card__content';const titleWrap=document.createElement('div'),service=document.createElement('span'),title=document.createElement('h3');service.className='nail-card__service';service.textContent=set.service;title.textContent=set.title;titleWrap.append(service,title);const open=document.createElement('button');open.type='button';open.className='nail-card__open';open.dataset.openSet='';open.setAttribute('aria-haspopup','dialog');open.textContent='View set ↗';content.append(titleWrap,open);inner.append(media,content);const template=document.createElement('template');template.className='nail-set-photos';set.photos.forEach(p=>template.content.append(photo(p)));article.append(inner,template);fragment.append(article);
      });
      gallery.querySelectorAll('.nail-card[data-set-id]').forEach(card=>card.remove());gallery.prepend(fragment);
    }
    const p=data.prices,cards=document.querySelectorAll('.price-spellbook>.price-card');if(p&&cards.length===5){
      const put=(root,values)=>root.querySelectorAll('dd').forEach((el,i)=>{if(Number.isFinite(values[i]))el.textContent='$'+values[i]});put(cards[0],p.full);put(cards[1],p.fill);put(cards[2],[p.gel,p.frenchGel,p.removal]);put(cards[3],[p.art,p.gems,p.ombre,p.stickers,p.threeD,p.chrome]);put(cards[4],[...p.pressons,p.art,p.gems,p.ombre,p.stickers,p.threeD,p.chrome,p.catEye]);
    }
  }catch{/* Progressive fallback: retain the published catalog and contact flow. */}
})();
