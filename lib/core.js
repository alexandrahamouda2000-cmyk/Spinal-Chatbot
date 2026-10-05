import {createHmac,timingSafeEqual} from 'node:crypto';
export function secureEqual(a,b){const x=Buffer.from(a||''),y=Buffer.from(b||'');return x.length===y.length&&x.length>0&&timingSafeEqual(x,y)}
export {tokens,retrieve} from '../search.js';
export function verifyWebhook(raw,h,secret,now=Date.now()){const ts=Number(h['svix-timestamp']);if(!Number.isFinite(ts)||Math.abs(now/1000-ts)>300)return false;const key=Buffer.from(secret.replace(/^whsec_/,''),'base64');const signature=createHmac('sha256',key).update(`${h['svix-id']}.${h['svix-timestamp']}.${raw}`).digest('base64');return (h['svix-signature']||'').split(' ').some(s=>secureEqual(s.replace(/^v1,/,''),signature))}
export function safeModelAnswer(v,chunks){return v?.supported===true&&typeof v.answer==='string'&&v.answer.length>0&&v.answer.length<=4000&&Array.isArray(v.sources)&&v.sources.length>0&&v.sources.every(n=>Number.isInteger(n)&&n>=1&&n<=chunks.length)}
