// T14 acceptance: ledger sums reconcile (refund + insurer_net === recovered), refunds pro-rata and capped.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRequire } from 'node:module';
const R = createRequire(import.meta.url)('../rules/rules.js');

test('deductible refund is pro-rata, capped, integer, and splits exactly', () => {
  assert.deepEqual(R.deductibleRefund(9800, 1000, 10800), { refund: 1000, insurer_net: 9800, share: 0.0926 });
  const r = R.deductibleRefund(9800, 1000, 7560);           // 70% recovery -> 70% of deductible
  assert.equal(r.refund, 700); assert.equal(r.refund + r.insurer_net, 7560);
  assert.equal(R.deductibleRefund(12000, 0, 9000).refund, 0);
  assert.equal(R.deductibleRefund(0, 0, 0).refund, 0);
  for (let s = 1; s < 50000; s += 997) { const x = R.deductibleRefund(12000, 500, s); assert.ok(x.refund <= 500 && x.refund + x.insurer_net === s); }
});

test('ledger summary reconciles over all 200 synthetic claims settled at floor', () => {
  const claims = JSON.parse(fs.readFileSync('data/store/claims.json')).claims;
  const entries = claims.map((c, i) => {
    const amt = Math.round((Number(c.paid_amount) + Number(c.deductible)) * 0.7);
    const status = i % 4 === 3 ? 'IMPASSE' : 'SETTLED', approval = i % 10 === 9 ? 'REJECTED' : 'APPROVED';
    const d = R.deductibleRefund(c.paid_amount, c.deductible, status === 'SETTLED' ? amt : 0);
    return { run_id: 't', claim_id: c.claim_id, status, approval, amount: status === 'SETTLED' ? amt : 0, refund: d.refund, insurer_net: d.insurer_net };
  });
  const paid = claims.reduce((t, c) => t + Number(c.paid_amount), 0);
  const s = R.ledgerSummary(entries, paid);
  assert.equal(s.reconciles, true);
  assert.equal(s.recovered, entries.filter(e => e.status === 'SETTLED' && e.approval === 'APPROVED').reduce((t, e) => t + e.amount, 0));
  assert.equal(s.by_status.SETTLED + s.by_status.IMPASSE, 200);
  assert.ok(s.pending_or_rejected > 0);
  assert.equal(s.benchmark.ratio_full_sample, 0.045);
  assert.equal(s.vs_benchmark, Math.round((s.recovery_ratio - 0.045) * 10000) / 10000);
});

test('empty ledger and NO_CASE/KILL_SWITCH entries add no money', () => {
  const s = R.ledgerSummary([{ status: 'NO_CASE', amount: 0 }, { status: 'KILL_SWITCH', amount: 0 }], 0);
  assert.equal(s.recovered, 0); assert.equal(s.reconciles, true); assert.equal(s.recovery_ratio, null);
});

test('pre-T14 entries without a refund split are counted as unbooked, not as money', () => {
  const s = R.ledgerSummary([{ status: 'SETTLED', approval: 'APPROVED', amount: 1800 },
    { status: 'SETTLED', approval: 'APPROVED', amount: 1876, refund: 180, insurer_net: 1696 }], 4700);
  assert.equal(s.unbooked, 1); assert.equal(s.recovered, 1876); assert.equal(s.reconciles, true);
});
