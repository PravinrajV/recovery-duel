# Submission checklist (internal, not for posting)
Sources read 2026-11-04 ET: the challenge thread (topic 5782528, all 15 posts via /raw and .json), category 287 (only the thread and the "About" topic so far, no entries yet), and the contest rules PDF attached to the thread (UiPath Contest Regulation V.2026.02.12). Submission form template 18 needs a forum login, so its exact field list hasn't been seen.

## Deadlines
- Opens 2026-10-12. Submit by 2026-11-30. Jury from 2026-12-01. Winners 2026-12-15.
- No separate registration or confirmation email (staff reply, post #4: section 3.3 is being removed).

## How to submit
- Post via https://forum.uipath.com/new-topic?category_id=287&tags=maestro-automate-challenge (only this counts).
- Fill every form field: problem, demo of the workflow running, solution files, how you built it with your coding agent, what you loved or what surprised you.
- Every file and link has to open and download without asking for access.
- Video: narrated, FaceCam screen recording, 7 minutes max, shows the problem and a full demo, no third-party trademarks or copyrighted music without permission. The link goes in the form.
- Must be Maestro Automate (Flow), not BPMN/Orchestrate (staff reply, post #12). The CLI isn't required (post #13 asked; the VS Code extension can run, debug and publish without it, post #7).
- Multiple entries are allowed; one prize per person; the jury takes your best entry.

## Rules that need a decision
- Eligibility (3.2): not open to UiPath and its affiliates, or anyone whose entry creates a real or apparent conflict of interest, at UiPath's discretion. 4.4 bars entries built with financial or preferential support from UiPath. 13.8 says employees of customers or partners must get internal approval. The byline says "UiPath Solutions Engineer". Confirm eligibility with community@uipath.com or the thread before posting.
- Publishing (10.1): "you will not publish or otherwise make available the Submission anywhere outside of the UiPath Connect Marketplace" without UiPath's prior approval. The repo is already public on GitHub, and the form wants downloadable files. Ask whether a public GitHub repo is OK, or attach a zip instead.
- IP (10.3): entering grants UiPath an exclusive, worldwide license over the submission. That's why no open-source LICENSE file was added; an MIT license would conflict. Decide whether to add one.
- Open source (4.3): no GPL or viral licenses allowed. Checked: npm deps in functions_src are MIT, BSD, ISC, Apache-2.0 and MIT-0 (no GPL); reportlab is BSD.
- Confidentiality (11.2): don't share employer confidential info. The repo uses synthetic data and public sources only.

## Judging criteria mapped to evidence
| Criterion | Evidence in the repo | Gap |
|---|---|---|
| Innovation & idea (30%) | Agent-vs-agent negotiation with script clamps and a hidden carrier limit; rules own every dollar (README "What it does", `rules/rules.js`) | none |
| Build quality & completeness (40%): works end to end | T15 15/15 (`docs/runs/T15_RESULTS.md`), T19 3 clean runs, A1 7/7 (`docs/runs/A1_RESULTS.md`), T16 3/3 (`docs/runs/T16_RESULTS.md`), `tests/run.sh` green from a fresh clone | Demo video not recorded yet |
| Build quality: every part pulling its weight | Agents, scripts, HTTP, coded functions, bucket, Action Center, email (README actor list) | Data Fabric entities not used (setup still in progress on the tenant) |
| Real-world relevance (30%) | NAIC 4.5% benchmark (`docs/SOURCES.md`), deductible refund split, ROI report (`docs/roi_report.html`), approval tiers, kill switches | The state law table is illustrative only |
| "Built with your coding agent" | `BUILD_LOG.md`, README section with 5 rounds | none (README and draft credit an unnamed coding agent using the UiPath CLI and UiPath skills; PDD/SDD use planner conventions) |
| "More than one kind of actor" | 5 agents, 2 rule scripts, NHTSA API, email, bucket, documents, 3 human forms | Documents are read by an agent, not Document Understanding/IXP (not enabled, owner decision). No Data Fabric entities |
| "Tested before it ships": debug and run evaluations | Debug runs and a scenario harness that checks against the rules engine | Eval set built (6 cases, 3 evaluators, `docs/EVALUATIONS.md`), but the UiPath eval service can't start inline agents on this Community tenant (403). Agent scores come from local scoring of debug runs instead |
| "Built for the real world": retry or escalate | NHTSA retry then NEEDS_DATA, agent onError to review (job 007fde7b), bucket fallback (a3edb329), kill switch (bfe72eff), 24h escalation script | The escalation script isn't scheduled on the tenant: it uses the `uip` CLI, so it would run from host cron (documented, not installed) |
| "The right way in" | Manual trigger with input, or a nightly time trigger over the bucket | Nightly schedule built and verified on the tenant (job 923fcbe1 from a time trigger), then disabled. Needs a post-compile patch for an SDK entry point bug |
