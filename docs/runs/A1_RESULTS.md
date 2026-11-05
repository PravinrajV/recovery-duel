# A1 document step results (tenant debug runs, SYNTHETIC data, SIMULATED carrier)

| Scenario | Claims | Expected | Result | Rounds | Amount | Tier | Approval | Document | Job | Pass |
|---|---|---|---|---|---|---|---|---|---|---|
| S01 | CLM-00017 | SETTLED | SETTLED | 5 | $11,050 | SPECIALIST | APPROVED | VALIDATED by RULES | d60a6d3d | PASS |
| S02 | CLM-00002 | SETTLED | SETTLED | 4 | $9,000 | SPECIALIST | APPROVED | VALIDATED by RULES | 707df1dd | PASS |
| S04 | CLM-00004 | SETTLED | SETTLED | 3 | $13,386 | SPECIALIST | APPROVED | VALIDATED by RULES | 758aa2f2 | PASS |
| S05 | CLM-00005 | SETTLED | SETTLED | 4 | $28,800 | MANAGER | REJECTED | DOC_REJECTED by HUMAN failed: total_math, total_vs_claim | 0cecf81d | PASS |
| S06 | CLM-00006 | NO_CASE | NO_CASE |  |  |  |  | NOT_REACHED | eeecc193 | PASS |
| S10 | CLM-00010 CLM-00011 | SETTLED | SETTLED | 3 | $5,933 | SPECIALIST | APPROVED | DOC_REJECTED by HUMAN failed: vin_match | 4aabcf49 | PASS |
| S14 | CLM-00015 | IMPASSE | IMPASSE | 5 |  |  | NOT_REQUIRED | HUMAN_VALIDATED by HUMAN (injection flagged) | 974be130 | PASS (partial: injection via inbound email is T16; here the SIMULATED carrier persona is below floor) |

**7/7 pass.** Rank status per claim is asserted against the offline rules engine (`scripts/expected.mjs`). A1 also asserts the document status and that demand and floor equal the rules engine values.
