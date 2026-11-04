// T14: ROI summary over a ledger.json (download it with `uip or bucket-files download`).
// Usage: node scripts/roi_report.mjs <ledger.json> [claims.json]
import fs from 'node:fs';
import { createRequire } from 'node:module';
const R = createRequire(import.meta.url)('../rules/rules.js');
const led = JSON.parse(fs.readFileSync(process.argv[2]));
const claims = JSON.parse(fs.readFileSync(process.argv[3] || 'data/store/claims.json')).claims;
const ids = new Set((led.entries || []).map(e => e.claim_id));
const base = claims.filter(c => ids.has(c.claim_id)).reduce((t, c) => t + Number(c.paid_amount), 0);
const s = R.ledgerSummary(led.entries || [], base);
console.log(JSON.stringify(s, null, 1));
if (!s.reconciles) process.exit(1);
