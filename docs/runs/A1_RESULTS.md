# A1 document step results (tenant debug runs, SYNTHETIC data, SIMULATED carrier)

| Scenario | Claims | Expected | Result | Rounds | Amount | Tier | Approval | Document | Job | Pass |
|---|---|---|---|---|---|---|---|---|---|---|
| S01 | CLM-00017 | SETTLED | SETTLED | 5 | $11,050 | SPECIALIST | APPROVED | DOC_ERROR | c581c7d2 | FAIL: document DOC_ERROR != VALIDATED |
| S04 | CLM-00004 | SETTLED | SETTLED | 2 | $13,950 | SPECIALIST | APPROVED | VALIDATED by RULES | 242e4f5c | PASS |

**1/2 pass.** Rank status per claim is asserted against the offline rules engine (`scripts/expected.mjs`). A1 also asserts the document status and that demand and floor equal the rules engine values.
