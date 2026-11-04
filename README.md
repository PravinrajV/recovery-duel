# Recovery Duel

A Maestro Flow (Maestro Automate) entry for the UiPath "Agents at Work: Maestro Automate Challenge".
It scans closed auto claims against real NHTSA recall data, builds a subrogation case, and lets an
insurer's negotiator agent settle with the other carrier inside hard limits enforced by script, with
human approval by dollar tier.

Status: early build. Offline pieces only (data generator, flow scaffold). Nothing deployed yet.

## Real vs simulated
| Part | Real or simulated |
|---|---|
| NHTSA recalls, vPIC VIN decode, NHTSA complaints | REAL public APIs (cached fixtures in `data/fixtures/nhtsa/`) |
| Maestro Flow, agents, approvals, rules engine | REAL UiPath components (once deployed) |
| Claims, policyholders, VINs, police reports, weather records | SIMULATED (synthetic, `scripts/gen_data.py`) |
| Other carrier's negotiating agent | SIMULATED, clearly labelled |
| Arbitration filing packet | SIMULATED |
| State law table (SOL, negligence) | ILLUSTRATIVE, UNVERIFIED, not legal advice |
| NAIC recovery benchmark | CONFIRMED: 4.5% of net claims paid, salvage plus subrogation, whole book (Bisco & Fier, NAIC JIR 2023). Shown as an indicator, not like-for-like |

No real customer data and no employer data are used.

## Layout
- `solution/RecoveryDuel/` UiPath solution and Flow project (`uip solution init`, `uip maestro flow init --automate`)
- `scripts/gen_data.py` deterministic synthetic data generator
- `data/` generated data + NHTSA fixtures
- `tests/` unit tests and `run.sh` (offline checks)
- `agents/` agent definitions (later)
- `docs/` sources map, rules question draft, tenant check (later)
- `BUILD_LOG.md` how this was built with a coding agent

## Run the offline checks
```
python3 scripts/gen_data.py      # regenerate data (seed 20261104)
tests/run.sh                     # unit tests + uip maestro flow validate
```
Needs Python 3.10+ and the UiPath CLI (`npm install -g @uipath/cli`).

## Rules assumption (2026-11-04)
Per the owner's decision, the rules question was NOT posted to the challenge thread. We assume a clearly labelled simulated counterparty, synthetic data and Preview features are allowed in entries.

## Scenario test results (T15)

Run with `python3 scripts/harness.py` (tenant debug runs via `uip maestro flow debug`; approval tasks completed with `uip tasks complete`). Full traces in `docs/runs/T15_*_debug.json`.

| Scenario | Claims | Expected | Result | Rounds | Amount | Tier | Approval | Job | Pass |
|---|---|---|---|---|---|---|---|---|---|
| S01 | CLM-00017 | SETTLED | SETTLED | 5 | $11,050 | SPECIALIST | APPROVED | 94cc5c4e | PASS |
| S02 | CLM-00002 | SETTLED | SETTLED | 5 | $9,000 | SPECIALIST | APPROVED | 9f4f5242 | PASS |
| S03 | CLM-00003 | IMPASSE | IMPASSE | 5 |  |  | NOT_REQUIRED | 0980bbb1 | PASS |
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
