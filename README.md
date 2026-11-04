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
| NAIC recovery benchmark | UNVERIFIED until the source PDF is checked |

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
