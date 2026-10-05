const STOP=new Set(['the','and','for','with','what','how','are','you','about','will','after','have','does','this','that','should','can','could','would','when','may','had']);
function stem(w){if(/^(drive|driving|driver|drivers)$/.test(w))return 'drive';if(/^(surgery|surgeries|surgical|operation|operations)$/.test(w))return 'surgery';if(/^(tumour|tumours|tumor|tumors)$/.test(w))return 'tumour';return w.replace(/s$/,'')}
export function tokens(s){return [...new Set((s.toLowerCase().match(/[a-z]{3,}/g)||[]).filter(w=>!STOP.has(w)).map(stem))]}
export function retrieve(q,docs){const terms=tokens(q);if(!terms.length)return [];const procedure=/\bsingle[ -]level\b/i.test(q)?'single':/\b(multi[ -]?level|multiple[ -]level)\b/i.test(q)?'multi':/\blumbar\b/i.test(q)?'lumbar':null;if(procedure)docs=docs.filter(d=>d.title.toLowerCase().includes(procedure));const specific=terms.filter(w=>!['spinal','spine','surgery','tumour'].includes(w));const ranked=docs.flatMap(d=>{const parts=d.content.split(/\[PDF page (\d+)\]/);const pages=parts.length>1?Array.from({length:(parts.length-1)/2},(_,i)=>({page:parts[2*i+1],text:parts[2*i+2]})):[{page:null,text:d.content}];return pages.flatMap(p=>{const text=p.text.replace(/[ \t]{3,}/g,' ').replace(/\n{3,}/g,'\n\n');const chunks=[];for(const section of text.split(/(?=\[Section\])/)){for(let start=0;start<section.length;start+=1200){const content=section.slice(start,start+1700);const words=new Set(tokens(content));const matched=terms.filter(t=>words.has(t));if(!matched.length||(specific.length&&!specific.some(t=>words.has(t))))continue;const score=matched.reduce((n,t)=>n+(specific.includes(t)?4:1),0);chunks.push({id:d.id,title:d.title+(p.page?' · PDF page '+p.page:''),content,excerpt:content,page:p.page,score})}}return chunks})}).sort((a,b)=>b.score-a.score);return selectSources(ranked)}
export function needsProcedure(q,chunks){const words=tokens(q);return chunks.length>0&&words.includes('drive')&&(words.includes('surgery')||words.includes('spinal')||words.includes('spine'))&&!/\b(single|multi|multiple|lumbar|cervical|thoracic|decompression|laminectomy|discectomy)\b/i.test(q)}
export const procedureQuestion='You do not need to know the technical name of your operation. I cannot give a personal driving date from a leaflet that may not apply to you. Please check your discharge advice or ask your spinal team before restarting driving. If you are unsure, you can request a nurse review.';

function selectSources(ranked){const selected=[],counts=new Map();for(const chunk of ranked){const count=counts.get(chunk.id)||0;if(count>=2)continue;selected.push(chunk);counts.set(chunk.id,count+1);if(selected.length===6)break}return selected}

export function reviewedDrivingAnswer(question,docs){
 if(!tokens(question).includes('drive'))return null;
 // This routing covers routine return-to-driving questions, not symptoms,
 // medicines, legal eligibility or requests for individual clearance.
 if(/\b(journey|travel|travelling|traveling|passenger|breaks|weakness|numb|numbness|bladder|bowel|seizure|epilepsy|medication|medicine|opioid|morphine|insurance|dvla|licence|license|drowsy|bleeding|fever)\b/i.test(question))return null;
 const uncertain=/\b(unsure|not sure|do not know|don[’']t know|whether)\b/i.test(question)||(/\bsingle[ -]level\b/i.test(question)&&/\b(multi[ -]?level|multiple[ -]level)\b/i.test(question));
 const specific=!uncertain&&/\bsingle[ -]level\b/i.test(question);
 const type=specific?'single-level':'unknown-operation';
 for(const doc of docs){
  const match=doc.content.match(/^\[Reviewed driving answer: (single-level|unknown-operation)\]\s*\n([\s\S]*?)(?:\n\[Review notes\]|$)/);
  if(match&&match[1]===type&&match[2].trim())return {supported:specific,answer:match[2].trim(),sources:[{title:doc.title,excerpt:match[2].trim()}]};
 }
 if(!specific)return {supported:false,answer:procedureQuestion};
 return null;
}
