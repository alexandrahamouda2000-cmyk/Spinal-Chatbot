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
