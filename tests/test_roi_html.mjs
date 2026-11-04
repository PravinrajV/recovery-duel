import test from 'node:test'; import assert from 'node:assert'; import { execFileSync } from 'node:child_process'; import fs from 'node:fs';
test('roi_html reconciles and labels synthetic/simulated', () => {
  const out = JSON.parse(execFileSync('node', ['scripts/roi_html.mjs', 'docs/runs/T15_results.json', '/tmp/rd_roi_test.html']).toString());
  assert.strictEqual(out.reconciles, true);
  assert.strictEqual(out.recovered, out.refunds + out.insurer_net);
  const h = fs.readFileSync('/tmp/rd_roi_test.html', 'utf8');
  assert.match(h, /SYNTHETIC/); assert.match(h, /SIMULATED/); assert.doesNotMatch(h, /NaN|undefined/);
});
