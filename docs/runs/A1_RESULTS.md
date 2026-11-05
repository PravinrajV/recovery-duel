# A1 document step results (tenant debug runs, SYNTHETIC data, SIMULATED carrier)

| Scenario | Claims | Expected | Result | Rounds | Amount | Tier | Approval | Document | Job | Pass |
|---|---|---|---|---|---|---|---|---|---|---|
| S01 | CLM-00017 | SETTLED | SETTLED | 5 | $11,050 | SPECIALIST | APPROVED | VALIDATED by RULES | ca96e73a | PASS |
| S02 | CLM-00002 | SETTLED | SETTLED | 5 | $9,000 | SPECIALIST | APPROVED | VALIDATED by RULES | b1053e71 | PASS |
| S04 | CLM-00004 | SETTLED | SETTLED | 3 | $13,386 | SPECIALIST | APPROVED | VALIDATED by RULES | 40f00ec2 | PASS |
| S05 | CLM-00005 | SETTLED | SETTLED | 4 | $29,500 | MANAGER | REJECTED | DOC_REJECTED by HUMAN failed: total_math, total_vs_claim | 1e56dc9e | PASS |
| S06 | CLM-00006 | NO_CASE | NO_CASE |  |  |  |  | NOT_REACHED | 194d6192 | PASS |
| S10 | CLM-00010 CLM-00011 | SETTLED | SETTLED | 3 | $6,000 | SPECIALIST | APPROVED | DOC_REJECTED by HUMAN failed: vin_match | 40b820e8 | PASS |
| S14 | CLM-00015 | IMPASSE | IMPASSE | 5 |  |  | NOT_REQUIRED | HUMAN_VALIDATED by HUMAN (injection flagged) | 7411d8bb | PASS (partial: injection via inbound email is T16; here the SIMULATED carrier persona is below floor) |

**7/7 pass.** Rank status per claim is asserted against the offline rules engine (`scripts/expected.mjs`). A1 also asserts the document status and that demand and floor equal the rules engine values.
