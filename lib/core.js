import {createHmac,timingSafeEqual} from 'node:crypto';
export function secureEqual(a,b){const x=Buffer.from(a||''),y=Buffer.from(b||'');return x.length===y.length&&x.length>0&&timingSafeEqual(x,y)}
export {tokens,retrieve} from '../search.js';
export function verifyWebhook(raw,h,secret,now=Date.now()){const ts=Number(h['svix-timestamp']);if(!Number.isFinite(ts)||Math.abs(now/1000-ts)>300)return false;const key=Buffer.from(secret.replace(/^whsec_/,''),'base64');const signature=createHmac('sha256',key).update(`${h['svix-id']}.${h['svix-timestamp']}.${raw}`).digest('base64');return (h['svix-signature']||'').split(' ').some(s=>secureEqual(s.replace(/^v1,/,''),signature))}
function normaliseQuote(text){return text.replace(/\s+/g,' ').trim()}
export function safeModelAnswer(v,chunks){
 return v?.supported===true&&Array.isArray(v.passages)&&v.passages.length>0&&v.passages.length<=6&&v.passages.every(p=>Number.isInteger(p.source)&&p.source>=1&&p.source<=chunks.length&&typeof p.quote==='string'&&p.quote.length>=20&&p.quote.length<=1800&&normaliseQuote(chunks[p.source-1].content).includes(normaliseQuote(p.quote)));
}
export function quotedAnswer(v){return 'The approved resources say:\n\n'+v.passages.map(p=>normaliseQuote(p.quote)).join('\n\n')+'\n\nIf you are unsure how this applies to you, ask your spinal team. You can request a nurse review.'}
