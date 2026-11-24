import test from 'node:test';
import assert from 'node:assert/strict';
import {run} from './engine.mjs';
import {sample} from './sample.mjs';
test('domain behavior and boundary cases',()=>{assert.equal(run(sample).rows[1].vulnerabilities,'unknown');assert.ok(run(sample).rows[0].signals.includes('365'));assert.equal(run({packages:[]}).metrics.packages,0);});
test('deterministic result and input preservation',()=>{const copy=JSON.stringify(sample);assert.deepEqual(run(sample),run(sample));assert.equal(JSON.stringify(sample),copy);});
test('reject malformed root and oversized input',()=>{assert.throws(()=>run(null));assert.throws(()=>run([]));assert.throws(()=>run({...sample,oversized:'x'.repeat(200001)}));});

test('evidence window includes its exact boundary',()=>{
 const p={name:'x',ageDays:1,license:'MIT',vulnerabilities:0};
 const r=run({asOf:'2026-11-24',maxEvidenceAgeDays:1,packages:[{...p,observedOn:'2026-11-23'}]});
 assert.equal(r.rows[0].evidenceAgeDays,1);assert.equal(r.rows[0].evidenceStatus,'within-window');
 assert.equal(r.metrics.withSignals,0);
});
test('stale zero-vulnerability observations retain their value and warning',()=>{
 const r=run({asOf:'2026-11-24',maxEvidenceAgeDays:0,packages:[{name:'x',vulnerabilities:0,observedOn:'2026-11-23'}]});
 assert.equal(r.rows[0].vulnerabilities,0);assert.equal(r.metrics.staleEvidence,1);
 assert.ok(r.rows[0].signals.includes('evidence window'));
});
test('undated data is never silently labeled current',()=>{
 const r=run({packages:[{name:'x',ageDays:1,license:'MIT',vulnerabilities:0}]});
 assert.equal(r.rows[0].evidenceStatus,'undated');assert.equal(r.rows[0].evidenceAgeDays,null);
 assert.equal(r.metrics.undatedEvidence,1);
});
test('calendar validation and leap-day arithmetic are explicit',()=>{
 assert.equal(run({asOf:'2024-03-01',packages:[{name:'x',observedOn:'2024-02-28'}]}).rows[0].evidenceAgeDays,2);
 for(const asOf of ['2026-02-29','2026-13-01','2026-11-24T00:00:00Z'])assert.throws(()=>run({asOf,packages:[]}));
 assert.throws(()=>run({asOf:'2026-11-24',packages:[{name:'x',observedOn:'2026-11-25'}]}));
});
test('dated observations and configured windows require an explicit reference date',()=>{
 assert.throws(()=>run({packages:[{name:'x',observedOn:'2026-11-24'}]}));
 assert.throws(()=>run({maxEvidenceAgeDays:1,packages:[]}));
 assert.throws(()=>run({asOf:'2026-11-24',maxEvidenceAgeDays:0.5,packages:[]}));
});
test('reject misleading field types and ambiguous duplicate package identities',()=>{
 assert.throws(()=>run({packages:[{name:'x',license:{}}]}));
 assert.throws(()=>run({packages:[{name:'x',vulnerabilities:0.5}]}));
 assert.throws(()=>run({packages:[{name:'x'},{name:'x'}]}));
});
