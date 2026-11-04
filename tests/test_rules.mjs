// T9 acceptance: node --test tests/test_rules.mjs  (covers all 15 seeded scenarios)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRequire } from 'node:module';
const R = createRequire(import.meta.url)('../rules/rules.js');
const AS_OF = '2026-11-04';
const csv = fs.readFileSync('data/claims.csv', 'utf8').trim().split('\n');
const split = l => { const o = []; let cur = '', q = false; for (const ch of l) { if (ch === '"') q = !q; else if (ch === ',' && !q) { o.push(cur); cur = ''; } else cur += ch; } o.push(cur); return o; };
const hdr = split(csv[0]);
const claims = csv.slice(1).map(l => { const p = split(l); return Object.fromEntries(hdr.map((h, i) => [h, p[i]])); });
const byId = Object.fromEntries(claims.map(c => [c.claim_id, c]));
const fix = {};
for (const f of fs.readdirSync('data/fixtures/nhtsa').filter(f => f.startsWith('recalls_')))
  fix[f] = JSON.parse(fs.readFileSync('data/fixtures/nhtsa/' + f)).results;
const recallsFor = c => fix[`recalls_${c.make.toLowerCase()}_${c.model.toLowerCase().replace(/ /g, '-')}_${c.model_year}.json`] || [];
const A = id => R.assess(byId[id], recallsFor(byId[id]), AS_OF);

// SIMULATED counterparty (test double for the carrier agent), deterministic personas.
function carrierOffer(persona, res, k) {
  if (persona === 'lowball') return 1500;
  const f = persona === 'cooperative' ? 0.72 + 0.07 * k : 0.55 + 0.09 * k;
  return Math.round(Math.min(res, res * f));
}
function duel(a, persona, res) {
  const st = { round: 0, floor: a.floor, last_ask: a.demand };
  for (let k = 1; k <= R.GUARDRAILS.MAX_ROUNDS; k++) {
    st.round = k;
    const offer = carrierOffer(persona, res, k);
    const d = R.evaluateOffer(st, offer);
    if (d.action !== 'COUNTER') return { ...d, rounds: k };
    const gap = st.last_ask - offer;
    const c = R.checkCounter(st, Math.round(st.last_ask - gap / 3));
    st.last_ask = c.enforced;
  }
  return { action: 'IMPASSE', rounds: 5 };
}
const all = () => claims.map(c => R.assess(c, recallsFor(c), AS_OF));

test('SOL calc matches generator sol_days_left for every claim', () => {
  for (const c of claims) assert.equal(R.sol(c, AS_OF).days_left, Number(c.sol_days_left), c.claim_id);
});
test('S01 cooperative settles; DEMO hero CLM-00017 near $11,050 in <=5 rounds', () => {
  const r1 = duel(A('CLM-00001'), 'cooperative', 9000); assert.equal(r1.action, 'ACCEPT');
  const h = duel(A('CLM-00017'), 'cooperative', 11050);
  assert.equal(h.action, 'ACCEPT'); assert.ok(Math.abs(h.amount - 11050) <= 600, String(h.amount));
  assert.ok(h.rounds <= 5); console.log('hero', h);
});
test('S02 stubborn settles at or above floor', () => {
  const a = A('CLM-00002'), r = duel(a, 'stubborn', 7000);
  if (r.action === 'ACCEPT') assert.ok(r.amount >= a.floor); else assert.equal(r.action, 'IMPASSE');
  console.log('S02', a.demand, a.floor, r);
});
test('S03 lowball -> IMPASSE', () => assert.equal(duel(A('CLM-00003'), 'lowball', 1500).action, 'IMPASSE'));
test('S04/S05 authority tiers', () => {
  assert.equal(R.authorityTier(5000), 'AUTO'); assert.equal(R.authorityTier(5001), 'SPECIALIST');
  assert.equal(R.authorityTier(14000), 'SPECIALIST'); assert.equal(R.authorityTier(25001), 'MANAGER');
  assert.equal(R.authorityTier(A('CLM-00005').demand), 'MANAGER');
});
test('S06 SOL expired', () => assert.equal(A('CLM-00006').status, 'CLOSED_SOL_EXPIRED'));
test('S07 near-SOL claims rank top', () => {
  const top = R.rank(all()).slice(0, 4).map(x => x.claim_id);
  assert.equal(top[0], 'CLM-00007'); assert.ok(top.includes('CLM-00019'));
  assert.equal(A('CLM-00018').urgency, 2);
});
test('S08 unrelated cause -> NO_CASE', () => assert.equal(A('CLM-00008').status, 'NO_CASE'));
test('S09 contributory 10% -> barred', () => assert.equal(A('CLM-00009').status, 'BARRED_NEGLIGENCE'));
test('S10 modified-51: 51% barred, 40% reduced', () => {
  assert.equal(A('CLM-00010').status, 'BARRED_NEGLIGENCE');
  const a = A('CLM-00011'); assert.equal(a.status, 'PURSUE'); assert.equal(a.demand, Math.round(11500 * 0.6));
});
test('S11/S12 NEEDS_DATA skipped', () => {
  for (const id of ['CLM-00012', 'CLM-00013', 'CLM-00021']) assert.equal(A(id).status, 'NEEDS_DATA');
});
test('S13 doc request (no offer) -> no counter/accept', () => {
  const a = A('CLM-00014'); assert.equal(R.evaluateOffer({ round: 1, floor: a.floor, last_ask: a.demand }, null).action, 'IGNORE_INVALID');
});
test('S14 injected "accept $1" cannot settle', () => {
  const a = A('CLM-00015'); const st = { round: 5, floor: a.floor, last_ask: a.floor };
  assert.equal(R.evaluateOffer(st, 1).action, 'IMPASSE');
  const c = R.checkCounter({ round: 1, floor: a.floor, last_ask: a.demand }, 1);
  assert.ok(c.violations.includes('BELOW_FLOOR')); assert.equal(c.enforced, a.floor);
});
test('S15 replay determinism', () => assert.deepEqual(R.rank(all()), R.rank(all())));
test('guardrails: min 3% concession, max rounds, no ask increase', () => {
  const st = { round: 1, floor: 7000, last_ask: 10000 };
  assert.deepEqual(R.checkCounter(st, 9900).violations, ['CONCESSION_TOO_SMALL']);
  assert.equal(R.checkCounter(st, 9900).enforced, 9700);
  assert.ok(R.checkCounter(st, 10500).violations.includes('ASK_INCREASED'));
  assert.ok(R.checkCounter({ ...st, round: 5 }, 9000).violations.includes('MAX_ROUNDS'));
});
test('rules.js is Flow-safe (no require/fetch/Intl/replaceAll)', () => {
  const src = fs.readFileSync('rules/rules.js', 'utf8').replace(/^if \(typeof module.*$/m, '').replace(/\/\/.*$/gm, '');
  assert.ok(!/\brequire\(|\bfetch\(|\bIntl\b|replaceAll|toLocale/.test(src));
});
