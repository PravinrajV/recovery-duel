# Recovery Duel demo script (target 3:45)

All claim data is SYNTHETIC. The other carrier is a SIMULATED agent and every one of its messages is tagged `[SIMULATED CARRIER]`. Times are targets.

## Before recording
- `tests/run.sh` is green and `uip login` is current.
- Studio Web shows the RecoveryDuel flow canvas. Action Center is open in a second tab.
- Estimates ready: `python3 scripts/gen_docs.py` (SYNTHETIC PDFs in `data/docs`). Attach with `--attachment estimateFile=data/docs/estimate_CLM-00017.pdf`; S05 uses `estimate_CLM-00005.pdf` (tampered total).
- Inputs ready: `tests/inputs/T15_S01.json` (the main story, $11,050 settlement, specialist tier), `tests/inputs/T19_BUCKET.json` (reads claims from the storage bucket), `tests/inputs/T15_S03.json` (impasse), `tests/inputs/T17_KILLNEG.json` (kill switch).
- `docs/roi_report.html` open in a browser tab.
- Backup: if a live run is slow, show the saved trace in `docs/runs/` for the same scenario.

## Shots
| Time | On screen | What to say |
|---|---|---|
| 0:00 | Title card, then the NAIC paper | "Insurers pay a claim, and often another driver or a defective part caused it. Getting that money back is subrogation. Industry wide, salvage plus subrogation is about 4.5% of net claims paid (NAIC Journal of Insurance Regulation, 2023). A lot gets missed because nobody has time to dig." |
| 0:20 | Flow canvas, start debug run with S01 | "Recovery Duel is a Maestro Flow. It takes closed auto claims, from the trigger or from an Orchestrator storage bucket, and checks each vehicle against live NHTSA recall data." |
| 0:50 | Canvas: NHTSA loop, Evidence Analyst and Liability Assessor outputs | "For this claim it finds a recall that matches the cause of loss. Two agents write the evidence and the liability view with citations. A script rules engine owns every number: filing deadlines by state, fault rules, the demand and the floor." |
| 1:15 | Canvas: Document Reader output, then the S05 "validate SYNTHETIC repair estimate" form in Action Center | "If a repair estimate is attached, a Document Reader agent reads it with Analyze Files. That is an AI agent, checked by rules, not a trained Document Understanding model. Here the total was tampered, the math check fails, and a person rejects it. The estimate never changes our demand or floor." |
| 1:30 | Negotiation loop on the canvas | "Now the duel. Our Negotiator agent faces a simulated carrier agent. The Negotiator never sees the carrier's private limit, and the script clamps every offer, so no agent can go below our floor or above their limit." |
| 2:10 | Action Center: specialist approval form | "It settles at $11,050 in 5 rounds. That amount is in the specialist tier, so a person approves it. Small amounts auto approve, large ones go to a manager." |
| 2:35 | Run S03 trace (impasse) and T17 kill switch trace | "Not every case settles. A lowball carrier ends in impasse. A kill switch in the bucket config stops negotiation cleanly, and an agent error routes the claim to human review instead of failing the run." |
| 3:00 | `docs/roi_report.html`, scenario table in README | "Every outcome lands in a ledger in the bucket, with the policyholder's deductible refund split out. 15 of 15 test scenarios pass on the tenant." |
| 3:20 | README "Real vs simulated" table, BUILD_LOG | "I built it with a coding agent using the UiPath CLI and UiPath skills. Real: NHTSA data, UiPath agents, approvals, bucket, rules. Simulated: claims and the other carrier." |
| 3:45 | End | Repo link. |

## Not in this cut yet
- Demand letter email is live (T16): at 2:20 show the letter and the SIMULATED reply in the recoveryduel@vncntlabs.com inbox, and the S14 trace where the injection reply is flagged INJECTION_IGNORED and the price is unchanged. The deductible refund email is not built.
- Recording and narration are done by the owner on his machine.
