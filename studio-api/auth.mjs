const keyCache=new Map();
const bytes=s=>Uint8Array.from(atob(s.replace(/-/g,'+').replace(/_/g,'/')),c=>c.charCodeAt(0));
export async function verifyOwner(request,env,fetcher=fetch,now=Date.now()){
  if(!/^[a-z0-9-]+\.cloudflareaccess\.com$/i.test(env.ACCESS_TEAM_DOMAIN||'')||!env.ACCESS_AUD||!env.ADMIN_EMAILS)return null;
  const token=request.headers.get('Cf-Access-Jwt-Assertion');if(!token||token.length>16000)return null;
  try{
    const parts=token.split('.');if(parts.length!==3)return null;
    const header=JSON.parse(new TextDecoder().decode(bytes(parts[0]))),claims=JSON.parse(new TextDecoder().decode(bytes(parts[1])));
    const issuer='https://'+env.ACCESS_TEAM_DOMAIN,epoch=Math.floor(now/1000);
    if(header.alg!=='RS256'||typeof header.kid!=='string'||claims.iss!==issuer||!Array.isArray(claims.aud)||!claims.aud.includes(env.ACCESS_AUD)||!Number.isFinite(claims.exp)||claims.exp<=epoch||!Number.isFinite(claims.iat)||claims.iat>epoch+30||(claims.nbf!==undefined&&(!Number.isFinite(claims.nbf)||claims.nbf>epoch+30)))return null;
    const email=String(claims.email||'').toLowerCase(),allow=env.ADMIN_EMAILS.split(',').map(s=>s.trim().toLowerCase()).filter(Boolean);
    if(!email||!allow.includes(email))return null;
    let cached=keyCache.get(issuer);
    if(!cached||cached.until<now||!cached.keys.some(k=>k.kid===header.kid)){
      const response=await fetcher(issuer+'/cdn-cgi/access/certs',{signal:AbortSignal.timeout(5000)});if(!response.ok)return null;
      const data=await response.json();if(!Array.isArray(data.keys))return null;
      cached={keys:data.keys,until:now+300000};keyCache.set(issuer,cached);
    }
    const jwk=cached.keys.find(k=>k.kid===header.kid&&k.kty==='RSA');if(!jwk)return null;
    const key=await crypto.subtle.importKey('jwk',jwk,{name:'RSASSA-PKCS1-v1_5',hash:'SHA-256'},false,['verify']);
    if(!await crypto.subtle.verify('RSASSA-PKCS1-v1_5',key,bytes(parts[2]),new TextEncoder().encode(parts[0]+'.'+parts[1])))return null;
    return {email};
  }catch{return null}
}
export function sameOrigin(request,env){return request.headers.get('Origin')===env.SITE_ORIGIN&&new URL(request.url).origin===env.SITE_ORIGIN}
