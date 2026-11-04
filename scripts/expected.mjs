// Offline expected outcomes from the rules engine (same fixtures as tests/test_rules.mjs).
// Usage: node scripts/expected.mjs CLM-00001 CLM-00002 ...  -> JSON {claim_id: {status, demand, floor, tier}}
import fs from 'node:fs';
import { createRequire } from 'node:module';
const R = createRequire(import.meta.url)('../rules/rules.js');
const csv = fs.readFileSync('data/claims.csv', 'utf8').trim().split('\n');
const split = l => { const o = []; let cur = '', q = false; for (const ch of l) { if (ch === '"') q = !q; else if (ch === ',' && !q) { o.push(cur); cur = ''; } else cur += ch; } o.push(cur); return o; };
const hdr = split(csv[0]);
const byId = Object.fromEntries(csv.slice(1).map(l => { const p = split(l); const o = Object.fromEntries(hdr.map((h, i) => [h, p[i]])); return [o.claim_id, o]; }));
const fix = f => { try { return JSON.parse(fs.readFileSync('data/fixtures/nhtsa/' + f)).results; } catch { return []; } };
const out = {};
for (const id of process.argv.slice(2)) {
  const c = byId[id];
  const a = R.assess(c, fix(`recalls_${c.make.toLowerCase()}_${c.model.toLowerCase().replace(/ /g, '-')}_${c.model_year}.json`), '2026-11-04');
  out[id] = { status: a.status, demand: a.demand, floor: a.floor };
}
console.log(JSON.stringify(out));
