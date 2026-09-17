import {verifyOwner,sameOrigin} from './auth.mjs';
import {clean,validateSettings,validateSlot,imageSignature} from './validation.mjs';
import {onRequestPost as deliverInquiry} from '../functions/api/inquiry.js';
import defaults from '../data/studio-defaults.json' with { type: 'json' };

const headers={'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff','referrer-policy':'same-origin'};
const reply=(data,status=200)=>new Response(JSON.stringify(data),{status,headers});
const failure=(message,status=400)=>reply({ok:false,message},status);
const statuses=['new','contacted','awaiting_deposit','confirmed','completed','cancelled'];
async function bodyLimit(request,max){const length=Number(request.headers.get('content-length')||0);if(length>max)throw Error('Request too large.');if(!request.body)return new Uint8Array();const reader=request.body.getReader(),parts=[];let size=0;while(true){const {value,done}=await reader.read();if(done)break;size+=value.length;if(size>max){await reader.cancel();throw Error('Request too large.')}parts.push(value)}const result=new Uint8Array(size);let offset=0;for(const part of parts){result.set(part,offset);offset+=part.length}return result}
async function jsonBody(request){if(!request.headers.get('content-type')?.includes('application/json'))throw Error('Expected JSON.');return JSON.parse(new TextDecoder().decode(await bodyLimit(request,1024*1024)))}
async function settings(env){const row=await env.DB.prepare('SELECT value,version FROM settings WHERE id = ?').bind('catalog').first();return row?{settings:JSON.parse(row.value),version:row.version}:{settings:{...defaults,cashAppUrl:''},version:0}}
const audit=(env,owner,action,id)=>env.DB.prepare('INSERT INTO audit (happened_at,actor,action,record_id) VALUES (?,?,?,?)').bind(new Date().toISOString(),owner.email,action,id).run();
const parseInquiry=row=>({...row,design:row.design?JSON.parse(row.design):null,photos:JSON.parse(row.photos||'[]')});

export async function handle(request,env,ctx={waitUntil:()=>{}}){
  const url=new URL(request.url),path=url.pathname.replace(/^\/api\/studio/,'')||'/',method=request.method;
  if(method==='OPTIONS')return failure('Cross-origin requests are not supported.',403);
  if(!['GET','POST','PUT','DELETE'].includes(method))return failure('Method not allowed.',405);
  if(!env.SITE_ORIGIN||url.origin!==env.SITE_ORIGIN)return failure('This service is available only through the website.',403);
  if(method!=='GET'&&!sameOrigin(request,env))return failure('Request origin could not be verified.',403);
  let owner=null;
  if(path.startsWith('/admin/')){
    if(!env.ACCESS_TEAM_DOMAIN||!env.ACCESS_AUD||!env.ADMIN_EMAILS)return failure('Owner sign-in is not configured yet.',503);
    owner=await verifyOwner(request,env);if(!owner)return failure('Sign in with an authorized owner account.',401);
    if(method!=='GET'&&request.headers.get('X-Numen-Admin')!=='1')return failure('Request could not be verified.',403);
  }
  if(path==='/admin/login'&&method==='GET')return Response.redirect(env.SITE_ORIGIN+'/owner.html',303);
  if(!env.DB)return failure('The private studio service is not configured yet.',503);
  try{
    if(path==='/public'&&method==='GET'){
      const {settings:config}=await settings(env);
      const rows=await env.DB.prepare("SELECT id,starts_at,ends_at FROM slots WHERE state = 'open' AND starts_at > ? ORDER BY starts_at LIMIT 40").bind(new Date().toISOString()).all();
      return reply({...config,slots:rows.results});
    }
    const media=path.match(/^\/media\/([a-f0-9-]+\.(?:jpg|png|webp))$/);
    if(media&&method==='GET'){
      if(!env.MEDIA)return failure('Photo unavailable.',404);const obj=await env.MEDIA.get('public/'+media[1]);if(!obj)return failure('Photo not found.',404);
      return new Response(obj.body,{headers:{'content-type':obj.httpMetadata?.contentType||'application/octet-stream','cache-control':'public,max-age=31536000,immutable','x-content-type-options':'nosniff'}});
    }
    if(path==='/inquiries'&&method==='POST'){
      if(!env.MEDIA||!env.INQUIRY_RATE_LIMIT)return failure('Inquiry delivery is being configured. Please use the existing contact form.',503);
      const raw=await bodyLimit(request,16*1024*1024),copy=new Request(request.url,{method:'POST',headers:request.headers,body:raw}),form=await copy.clone().formData();
      if(clean(form.get('website'),100))return reply({ok:true,message:'Your vision was sent.'});
      if(form.get('policyAgreement')!=='accepted')return failure('Please agree to the appointment policies.');
      const response=await deliverInquiry({request:copy,env});if(!response.ok)return response;
      // Only screened, successfully delivered inquiries become private records.
      let draft={};try{const text=String(form.get('studioDraft')||'');if(text.length<=250000)draft=JSON.parse(text)}catch{}
      const id=crypto.randomUUID(),now=new Date().toISOString(),photos=[];
      for(const file of form.getAll('photos').filter(f=>f instanceof File&&f.size>0)){
        const ext={'image/jpeg':'jpg','image/png':'png','image/webp':'webp'}[file.type],key=`inquiries/${id}/${crypto.randomUUID()}.${ext}`;
        await env.MEDIA.put(key,file.stream(),{httpMetadata:{contentType:file.type}});photos.push({key,name:clean(file.name,100),type:file.type});
      }
      const name=clean(form.get('name'),80),email=clean(form.get('email'),160).toLowerCase();
      await env.DB.prepare('INSERT INTO inquiries (id,created_at,updated_at,name,email,service,message,design,photos,requested_slot_id,preferred_date,preferred_time,silent,reminder_consent,revision) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)').bind(id,now,now,name,email,clean(form.get('service'),100),clean(form.get('message'),700),draft.design?JSON.stringify(draft.design).slice(0,250000):null,JSON.stringify(photos),clean(draft.slotId,80)||null,clean(draft.date,20),clean(draft.time,50),draft.silent?1:0,form.get('reminderConsent')==='yes'?1:0,crypto.randomUUID()).run();
      return reply({ok:true,id,message:'Your vision has been sent. Your appointment is a request until the artist confirms it.'});
    }
    if(path==='/admin/state'&&method==='GET'){
      const config=await settings(env);const inquiries=await env.DB.prepare('SELECT * FROM inquiries ORDER BY created_at DESC LIMIT 500').all();const slots=await env.DB.prepare('SELECT * FROM slots WHERE starts_at > ? ORDER BY starts_at LIMIT 500').bind(new Date(Date.now()-30*86400000).toISOString()).all();return reply({...config,owner:owner.email,inquiries:inquiries.results.map(parseInquiry),slots:slots.results,remindersEnabled:env.REMINDERS_ENABLED==='true'});
    }
    if(path==='/admin/clients'&&method==='GET'){
      const email=clean(url.searchParams.get('email'),160).toLowerCase();if(!email)return failure('Choose a client email.');const history=await env.DB.prepare('SELECT * FROM inquiries WHERE email = ? ORDER BY created_at DESC LIMIT 1000').bind(email).all();return reply({inquiries:history.results.map(parseInquiry)});
    }
    if(path==='/admin/catalog'&&method==='PUT'){
      const body=await jsonBody(request),config=validateSettings(body.settings);if(!Number.isInteger(body.version)||body.version<0)return failure('Reload the owner desk before saving.');
      let result;if(body.version===0){result=await env.DB.prepare("INSERT INTO settings(id,value,version) VALUES('catalog',?,1) ON CONFLICT(id) DO NOTHING").bind(JSON.stringify(config)).run()}else result=await env.DB.prepare("UPDATE settings SET value = ?, version = version + 1 WHERE id = 'catalog' AND version = ?").bind(JSON.stringify(config),body.version).run();
      if(result.meta.changes!==1)return failure('Another edit was saved. Reload before updating the catalog.',409);await audit(env,owner,'catalog.update','catalog');return reply({ok:true,version:body.version+1});
    }
    if(path==='/admin/photos'&&method==='POST'){
      if(!env.MEDIA)return failure('Photo storage is not configured.',503);
      const type=request.headers.get('content-type')?.split(';')[0];if(!['image/jpeg','image/png','image/webp'].includes(type))return failure('Choose JPG, PNG or WebP.');const bytes=await bodyLimit(request,4*1024*1024);if(!imageSignature(bytes,type))return failure('This image could not be verified.');const ext={'image/jpeg':'jpg','image/png':'png','image/webp':'webp'}[type],name=crypto.randomUUID()+'.'+ext;await env.MEDIA.put('public/'+name,bytes,{httpMetadata:{contentType:type}});await audit(env,owner,'photo.upload',name);return reply({ok:true,src:'/api/studio/media/'+name});
    }
    const privatePhoto=path.match(/^\/admin\/photo\/([a-f0-9-]+)\/([a-f0-9-]+\.(?:jpg|png|webp))$/);
    if(privatePhoto&&method==='GET'){
      const object=await env.MEDIA?.get('inquiries/'+privatePhoto[1]+'/'+privatePhoto[2]);if(!object)return failure('Photo not found.',404);return new Response(object.body,{headers:{'content-type':object.httpMetadata.contentType,'cache-control':'private,no-store','x-content-type-options':'nosniff'}});
    }
    if(path==='/admin/slots'&&method==='POST'){
      const slot=validateSlot(await jsonBody(request)),id=crypto.randomUUID();
      const result=await env.DB.prepare("INSERT INTO slots (id,starts_at,ends_at) SELECT ?,?,? WHERE NOT EXISTS (SELECT 1 FROM slots WHERE starts_at < ? AND ends_at > ?)").bind(id,slot.starts_at,slot.ends_at,slot.ends_at,slot.starts_at).run();if(result.meta.changes!==1)return failure('That opening overlaps another time. Choose a different time.',409);await audit(env,owner,'slot.create',id);return reply({ok:true,id});
    }
    const slotId=path.match(/^\/admin\/slots\/([a-f0-9-]+)$/);
    if(slotId&&method==='DELETE'){
      const r=await env.DB.prepare("DELETE FROM slots WHERE id = ? AND state = 'open' AND inquiry_id IS NULL").bind(slotId[1]).run();if(!r.meta.changes)return failure('Only an unbooked opening can be removed.',409);await audit(env,owner,'slot.delete',slotId[1]);return reply({ok:true});
    }
    const inquiry=path.match(/^\/admin\/inquiries\/([a-f0-9-]+)$/);
    if(inquiry&&method==='PUT'){
      const b=await jsonBody(request),id=inquiry[1],status=b.status; if(!statuses.includes(status))return failure('Choose a valid inquiry status.');
      const current=await env.DB.prepare('SELECT * FROM inquiries WHERE id = ?').bind(id).first();if(!current)return failure('Inquiry not found.',404);if(b.revision!==current.revision)return failure('This inquiry changed. Reload before saving.',409);
      const slot=clean(b.slotId,80)||null;if(status==='confirmed'&&!slot)return failure('Choose an opening before confirming.');
      if(status==='completed'&&(!['confirmed','completed'].includes(current.status)||slot!==current.slot_id||!slot))return failure('Complete a confirmed appointment without changing its opening.');
      const revision=crypto.randomUUID(),now=new Date().toISOString();
      // D1 batch executes as one transaction. The conditional update arbitrates competing reservations.
      const result=await env.DB.batch([
        env.DB.prepare("UPDATE inquiries SET status=?, notes=?, deposit_received=?, slot_id=?, appointment_start=(SELECT starts_at FROM slots WHERE id=?), updated_at=?, revision=?, reminder_state=CASE WHEN slot_id IS NOT ? OR status <> ? THEN NULL ELSE reminder_state END WHERE id=? AND revision=? AND (? <> 'confirmed' OR EXISTS(SELECT 1 FROM slots WHERE id=? AND starts_at > ? AND (inquiry_id IS NULL OR inquiry_id=?)))").bind(status,clean(b.notes,5000),b.depositReceived?1:0,status==='confirmed'||status==='completed'?slot:null,status==='confirmed'||status==='completed'?slot:null,now,revision,slot,status,id,b.revision,status,slot,now,id),
        env.DB.prepare("UPDATE slots SET inquiry_id=NULL,state='open' WHERE inquiry_id=? AND EXISTS(SELECT 1 FROM inquiries WHERE id=? AND revision=?) AND (id IS NOT ? OR ? NOT IN ('confirmed','completed'))").bind(id,id,revision,slot,status),
        env.DB.prepare("UPDATE slots SET inquiry_id=?,state='booked' WHERE id=? AND EXISTS(SELECT 1 FROM inquiries WHERE id=? AND revision=? AND status IN ('confirmed','completed')) AND (inquiry_id IS NULL OR inquiry_id=?)").bind(id,slot,id,revision,id)
      ]);if(result[0].meta.changes!==1)return failure('This opening was taken or the inquiry changed. Reload and choose another.',409);await audit(env,owner,'inquiry.update',id);return reply({ok:true,revision});
    }
    return failure('Not found.',404);
  }catch(error){
    if(error.message==='Request too large.')return failure(error.message,413);
    if(error instanceof SyntaxError)return failure('The request was not valid JSON.');
    // Validation errors are human-readable; infrastructure and SQL errors never reach a visitor.
    if(/^(Settings|Prices|Use |Every price|Appointment times|Collection IDs|Each collection|Choose |Photo rotation|Opening duration|Expected JSON)/.test(error.message))return failure(error.message);
    console.error('Studio operation failed',{path,method,errorType:error.name});return failure('The studio could not complete that request. Please try again.',503);
  }
}

export async function sendReminders(env){
  if(env.REMINDERS_ENABLED!=='true'||!env.DB||!env.RESEND_API_KEY||!env.INQUIRY_FROM_EMAIL)return {sent:0};
  const now=new Date(),until=new Date(Date.now()+24*3600000),stale=new Date(Date.now()-15*60000).toISOString();
  const due=await env.DB.prepare("SELECT * FROM inquiries WHERE status='confirmed' AND reminder_consent=1 AND appointment_start > ? AND appointment_start <= ? AND (reminder_state IS NULL OR (reminder_state='sending' AND reminder_lock < ?)) LIMIT 30").bind(now.toISOString(),until.toISOString(),stale).all();let sent=0;
  for(const row of due.results){
    const lock=new Date().toISOString();const claimed=await env.DB.prepare("UPDATE inquiries SET reminder_state='sending',reminder_lock=? WHERE id=? AND revision=? AND (reminder_state IS NULL OR (reminder_state='sending' AND reminder_lock < ?))").bind(lock,row.id,row.revision,stale).run();if(!claimed.meta.changes)continue;
    const when=new Date(row.appointment_start).toLocaleString('en-US',{timeZone:'America/New_York',dateStyle:'full',timeStyle:'short'});
    try{const response=await fetch('https://api.resend.com/emails',{method:'POST',headers:{authorization:`Bearer ${env.RESEND_API_KEY}`,'content-type':'application/json','Idempotency-Key':`numen-reminder-${row.id}-${Date.parse(row.appointment_start)}`},body:JSON.stringify({from:env.INQUIRY_FROM_EMAIL,to:[row.email],reply_to:env.INQUIRY_TO_EMAIL,subject:'Your Numen Nails appointment reminder',text:`A little reminder of your confirmed Numen Nails appointment on ${when} (Eastern time).\n\nPlease arrive on time. No guests or accompanying children. Intricate longer sets may take 3–5 hours; please keep the rest of your day open. Remaining balance is cash only.\n\nQuestions or changes? Reply directly to your artist.\n\nYou requested an appointment reminder with your inquiry.`}),signal:AbortSignal.timeout(10000)});if(!response.ok)throw Error();await env.DB.prepare("UPDATE inquiries SET reminder_state='sent',reminder_sent_at=? WHERE id=? AND reminder_lock=?").bind(new Date().toISOString(),row.id,lock).run();sent++;}catch{await env.DB.prepare('UPDATE inquiries SET reminder_state=NULL WHERE id=? AND reminder_lock=?').bind(row.id,lock).run()}
  }return {sent};
}
export default {fetch:handle,async scheduled(event,env,ctx){ctx.waitUntil(sendReminders(env))}};
