import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {retrieve} from '../search.js';
const raw=readFileSync(new URL('../resources.js',import.meta.url),'utf8');
const docs=JSON.parse(raw.slice(raw.indexOf('=')+1).trim().replace(/;$/,''));
test('single-level driving excerpt keeps work timeline in its own section',()=>{
 const results=retrieve('According to the single-level spinal fixation leaflet what conditions must I meet before returning to driving?',docs);
 const driving=results.find(x=>x.page==='8'&&x.content.includes('Traveling / driving'));
 assert.ok(driving);assert.match(driving.content,/emergency stop/);assert.match(driving.content,/6 weeks/);
 assert.doesNotMatch(driving.content,/Return to work|3 months/);
});

test('retrieval includes relevant passages from multiple approved documents',()=>{
 const result=retrieve('radiotherapy side effects',[{id:'a',title:'Leaflet A',content:'Radiotherapy side effects include information in leaflet A. '.repeat(120)},{id:'b',title:'Leaflet B',content:'Radiotherapy side effects are described in leaflet B.'}]);
 assert.ok(result.some(x=>x.id==='a'));assert.ok(result.some(x=>x.id==='b'));assert.ok(result.filter(x=>x.id==='a').length<=2);
});

import {reviewedDrivingAnswer} from '../search.js';
test('unapproved patient driving draft never gives an operation date',()=>{
 const result=reviewedDrivingAnswer('How long after spinal surgery can I drive?',[]);
 assert.equal(result.supported,false);assert.doesNotMatch(result.answer,/six weeks|6 weeks/);assert.match(result.answer,/do not need to know/);
});
test('approved driving answers are displayed unchanged with safety netting',()=>{
 const general=docs.find(x=>x.content.startsWith('[Reviewed driving answer: unknown-operation]'));
 const single=docs.find(x=>x.content.startsWith('[Reviewed driving answer: single-level]'));
 const result=reviewedDrivingAnswer('How long after spinal surgery can I drive?',[general,single]);
 assert.equal(result.supported,false);assert.match(result.answer,/do not drive/);assert.doesNotMatch(result.answer,/six weeks|6 weeks|first three months/);
 const specific=reviewedDrivingAnswer('When can I drive after single-level spinal fixation?',[general,single]);
 assert.equal(specific.supported,true);assert.match(specific.answer,/six weeks, depending on your symptoms/);assert.doesNotMatch(specific.answer,/These conditions apply/);
 assert.equal(reviewedDrivingAnswer('Can I drive while taking morphine?',[general,single]),null);
 assert.equal(reviewedDrivingAnswer('How long can I travel as a passenger?',[general,single]),null);
});

test('uncertain procedure never routes to the single-level waiting period',()=>{
 const result=reviewedDrivingAnswer("I don't know if it is single-level or multi-level surgery, when can I drive?",docs);
 assert.equal(result.supported,false);assert.doesNotMatch(result.answer,/six weeks/);
});
