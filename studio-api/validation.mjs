export const clean=(value,max=500)=>String(value??'').replace(/[\u0000-\u001f\u007f]/g,' ').trim().slice(0,max);
const assert=(test,message)=>{if(!test)throw new Error(message)};
export function validateSettings(value){
  assert(value&&typeof value==='object','Settings are required.');
  const prices=value.prices;assert(prices&&typeof prices==='object','Prices are required.');
  const amount=v=>Number.isFinite(v)&&v>=0&&v<=2000;
  const out={};for(const k of ['full','fill','pressons']){assert(Array.isArray(prices[k])&&prices[k].length===5&&prices[k].every(amount),'Use five valid prices for each set type.');out[k]=prices[k]}
  for(const k of ['art','gems','ombre','stickers','threeD','chrome','catEye','gel','frenchGel','removal']){assert(amount(prices[k]),'Every price must be between $0 and $2,000.');out[k]=prices[k]}
  const cashAppUrl=clean(value.cashAppUrl,100);assert(!cashAppUrl||/^https:\/\/cash\.app\/\$[a-z0-9_]{1,40}$/i.test(cashAppUrl),'Use a Cash App profile URL beginning https://cash.app/$.');
  assert(value.timezone==='America/New_York','Appointment times use America/New_York.');
  assert(Array.isArray(value.collections)&&value.collections.length>0&&value.collections.length<=100,'Use 1–100 collections.');
  const ids=new Set();const collections=value.collections.map(c=>{const id=clean(c.id,80);assert(/^[a-z0-9-]+$/.test(id)&&!ids.has(id),'Collection IDs must be unique.');ids.add(id);assert(clean(c.title,100),'Each collection needs a name.');assert(['forest','blossom','midnight','ocean','starlight'].includes(c.world),'Choose a collection atmosphere.');assert(Array.isArray(c.photos)&&c.photos.length>0&&c.photos.length<=12,'Use 1–12 photos per collection.');const photos=c.photos.map(p=>{assert(typeof p.src==='string'&&(/^(?:\/?assets\/img\/nails\/[a-zA-Z0-9_-]+\.(?:jpg|jpeg|png|webp))$/.test(p.src)||/^\/api\/studio\/media\/[a-f0-9-]+\.(?:jpg|png|webp)$/.test(p.src)),'Use an uploaded photo or an existing nail photograph.');assert([0,90,-90,180].includes(Number(p.rotation||0)),'Photo rotation is invalid.');return{src:p.src,alt:clean(p.alt,300)||clean(c.title,100),rotation:Number(p.rotation||0)}});return{id,title:clean(c.title,100),description:clean(c.description,700),service:clean(c.service,100),world:c.world,photos}});
  return {prices:out,collections,cashAppUrl,timezone:'America/New_York',deposit:10};
}
export function validateSlot(value,now=Date.now()){
  const start=Date.parse(value.starts_at),end=Date.parse(value.ends_at);
  assert(Number.isFinite(start)&&Number.isFinite(end)&&start>now&&start<now+366*86400000,'Choose an opening within the next year.');assert(end>start&&end-start<=8*3600000,'Opening duration must be between 1 minute and 8 hours.');return{starts_at:new Date(start).toISOString(),ends_at:new Date(end).toISOString()};
}
export function imageSignature(bytes,type){return type==='image/jpeg'?bytes[0]===255&&bytes[1]===216&&bytes[2]===255:type==='image/png'?[137,80,78,71,13,10,26,10].every((b,i)=>bytes[i]===b):type==='image/webp'?String.fromCharCode(...bytes.slice(0,4))==='RIFF'&&String.fromCharCode(...bytes.slice(8,12))==='WEBP':false}
