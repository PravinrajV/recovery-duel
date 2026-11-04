# Build log

Format: `## YYYY-MM-DD HH:MM ET | task | prompt | tool/command | result | fix`.
Built by Grok Bot (coding agent) for Pravinraj Vincent. Times are America/New_York.

## 2026-11-04 02:11 ET | T0 tooling
- Prompt (owner): "i beleive they want to use uipath cli tool and uipath skills, so wonering ifyou can installuipath skills, or cli, and do the buidl as well."
- Commands: `npm install -g --prefix /home/box/.local @uipath/cli`; `uip skills install --agent cursor --no-interactive`
- Result: `uip` 1.205.0, 32 skills. Not logged in to any tenant.

## 2026-11-04 02:15 ET | T1 doc map
- Prompt (to agent): map every design node to docs actually opened; mark unverified honestly.
- Commands: `curl` status checks on 9 doc URLs; fetched the Maestro Flow overview page; read skill refs in `uipath-maestro-flow/references` and `uipath-human-in-the-loop/references`.
- Result: `docs/SOURCES.md`. Found Maestro Flow itself is Preview. No documented HITL timeout (Action App has none in v1.0), so the 24h escalation is UNVERIFIED with a scheduled-check fallback. npmjs.com blocked the fetch (403).

## 2026-11-04 02:18 ET | T3 rules question
- Result: `docs/THREAD_QUESTION_DRAFT.md`. Draft only, not posted. Added a 4th question on Preview features after T1 found Flow is Preview.

## 2026-11-04 02:20 ET | T5 synthetic data
- Commands: `curl https://api.nhtsa.gov/recalls/recallsByVehicle?make=..&model=..&modelYear=..` for 6 vehicles (all 200, 3 to 11 campaigns each) and one vPIC decode; saved to `data/fixtures/nhtsa/`.
- Wrote `scripts/gen_data.py` and `tests/test_gen_data.py` (unittest, no deps).
- Run 1: near-deadline SOL count was 2 (target 5). Fix: seeded 3 more near-deadline claims.
- Run 2: test failure, S07 lookup returned a later duplicate row; also found closed_date could precede loss_date when a scenario overrode loss_date. Fix: first row per scenario is primary; recompute closed_date; added a date-consistency test.
- Run 3: 8/8 tests pass. 200 claims, 71 recall matches, 6 with SOL under 90 days, 3 NEEDS_DATA, all 15 scenarios seeded, VIN check digits valid, output byte-identical across runs.

## 2026-11-04 02:24 ET | T4 skeleton + T6 flow scaffold
- Commands: `uip solution init RecoveryDuel`; `uip maestro flow init RecoveryDuel --automate`; `uip maestro flow validate .../RecoveryDuel.flow` -> Valid.
- Wrote README (real vs simulated table), `.gitignore`, `tests/run.sh` (unit tests + validate). `tests/run.sh` passes.
- Not done: `--sdk-source` TypeScript seed (needs `@uipath/maestro-builder-sdk`, not installed yet). Data Fabric tables (plan T6) need tenant login.
