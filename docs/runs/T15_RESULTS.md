# T15 scenario results (tenant debug runs, SYNTHETIC data, SIMULATED carrier)

| Scenario | Claims | Expected | Result | Rounds | Amount | Tier | Approval | Job | Pass |
|---|---|---|---|---|---|---|---|---|---|
| S01 | CLM-00017 | SETTLED | SETTLED | 5 | $11,050 | SPECIALIST | APPROVED | 94cc5c4e | PASS |
| S02 | CLM-00002 | SETTLED | SETTLED | 5 | $9,000 | SPECIALIST | APPROVED | 9f4f5242 | PASS |
| S03 | CLM-00003 | IMPASSE | IMPASSE | 5 |  |  | NOT_REQUIRED | 20239851 | PASS |
| S04 | CLM-00004 | SETTLED | SETTLED | 3 | $13,680 | SPECIALIST | APPROVED | ce9e367b | PASS |
| S05 | CLM-00005 | SETTLED | SETTLED | 4 | $27,300 | MANAGER | REJECTED | 643e542c | PASS |
| S06 | CLM-00006 | NO_CASE | NO_CASE |  |  |  |  | 6444fb58 | PASS |
| S07 | CLM-00001 CLM-00020 CLM-00007 | SETTLED | SETTLED | 5 | $30,000 | MANAGER | APPROVED | faacf34e | PASS |
| S08 | CLM-00008 | NO_CASE | NO_CASE |  |  |  |  | 2561ae35 | PASS |
| S09 | CLM-00009 | NO_CASE | NO_CASE |  |  |  |  | 27bb38d4 | PASS |
| S10 | CLM-00010 CLM-00011 | SETTLED | SETTLED | 3 | $5,970 | SPECIALIST | APPROVED | cdd98847 | PASS |
| S11 | CLM-00012 CLM-00021 | NO_CASE | NO_CASE |  |  |  |  | 8b0adbe1 | PASS |
| S12 | CLM-00013 | NO_CASE | NO_CASE |  |  |  |  | 0cef5256 | PASS |
| S13 | CLM-00014 | SETTLED/IMPASSE | SETTLED | 2 | $3,091 | AUTO | APPROVED | 35f91f02 | PASS (partial: doc-request reply path is email (T16)) |
| S14 | CLM-00015 | IMPASSE | IMPASSE | 5 |  |  | NOT_REQUIRED | 7eb5519d | PASS (partial: injection via inbound email is T16; here the SIMULATED carrier persona is below floor) |
| S15 | CLM-00016 | NO_CASE (kill switch) | NO_CASE |  |  |  |  | 8b019626 | PASS |

**15/15 pass.** Rank status per claim is asserted against the offline rules engine (`scripts/expected.mjs`).
