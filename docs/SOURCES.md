# Sources: design node -> documentation

Checked 2026-11-04, about 2:15 AM ET, from the build box. "Opened" means I fetched the page and read its text.
"Reachable" means HTTP 200 only, with the text not reviewed. Skill refs are the official UiPath skills
(npm `@uipath/skills`, installed by `uip skills install`) at `~/.cursor/skills/`.
Anything not confirmed is marked UNVERIFIED. Community Edition availability is UNVERIFIED for everything until T2 (tenant check).

## Product pages
| URL | Status | What it confirms |
|---|---|---|
| https://docs.uipath.com/studio-web/automation-cloud/latest/user-guide/about-maestro-flow | Opened | Maestro Flow is **Preview**. Node list: Autonomous Agent, Connector, Mock, Decision, Loop, Merge, Switch, Delay, Subflow, End, Terminate, Quick Form, Action App, HTTP Request, Script (JavaScript), Transform, Filter, Map, Group By, queue items |
| https://docs.uipath.com/maestro-automate/automation-cloud/latest/user-guide/retry-and-cancel | Reachable (read in an earlier session: retry from failed step) | Retry/cancel |
| https://docs.uipath.com/agents/automation-cloud/latest/user-guide/evaluations | Reachable | Agent evaluations |
| https://docs.uipath.com/agents/automation-cloud/latest/user-guide/guardrails | Reachable | Agent guardrails |
| https://docs.uipath.com/agents/automation-cloud/latest/user-guide/contexts | Reachable | Context Grounding |
| https://docs.uipath.com/data-service/automation-cloud/latest/user-guide/introduction | Reachable | Data Service / Data Fabric |
| https://docs.uipath.com/action-center/automation-cloud/latest/user-guide/about-actions | Reachable | Action Center |
| https://www.npmjs.com/package/@uipath/cli | Blocked (403 bot check) | CLI. Verified hands-on instead: `uip --version` = 1.205.0 |
| https://vpic.nhtsa.dot.gov/api/ | Opened (200) | vPIC VIN decode |
| https://api.nhtsa.gov/recalls/recallsByVehicle | Opened (200, 6 vehicles cached in data/fixtures/nhtsa) | Real recall campaigns |
| https://content.naic.org/sites/default/files/cipr-jir-2023-2.pdf | NOT opened | NAIC 4.5% benchmark: UNVERIFIED |

## Design node map
| Design node | Flow construct | Source | Status |
|---|---|---|---|
| Schedule trigger nightly | `scheduled({ every: 'R/P1D' })` | skill ref scheduled-trigger.md | Documented |
| Webhook trigger (replay mode) | `onEvent({ connector: 'uipath-http-webhook', event: 'http-webhook' })` | event-trigger.md | Documented; needs IS connection (tenant) |
| New-email trigger | `onEvent` Outlook 365 `email-received` | event-trigger.md | Outlook documented. Gmail event trigger UNVERIFIED |
| Kill switches / Config table | Data Fabric read + Switch | data-fabric.md, switch.md | Documented; Community UNVERIFIED |
| Claims loader + dedupe | Script (JavaScript) | script.md, about-maestro-flow | Documented |
| Loop each claim / case | Loop | loops.md, about-maestro-flow | Documented |
| Evidence fan-out | `.parallel()` + Merge | parallel-merge.md, about-maestro-flow | Documented (Merge "joins parallel branches") |
| HTTP vPIC / recalls / complaints | `http({ managed: true, retryCount })`, non-2xx -> error path | http.md | Documented |
| Error path -> NEEDS_DATA | `.onError()` | error-handling.md | Documented |
| Rules engine, scoring, ROI, arbitration packet, deductible refund | Script (JavaScript; Python copy for unit tests) | script.md | Documented |
| 5 agents + simulated carrier agent | `agent({ key, name, folderPath })` (published agents) or inline agent | agent.md, inline-agent.md, uipath-agents skill | Documented; credits per call UNVERIFIED |
| Liability Assessor state-law KB | Context Grounding | contexts page, uipath-platform/references/context-grounding | Reachable; Community UNVERIFIED |
| Compliance Reviewer guardrails | Agent guardrails | guardrails page, uipath-platform/references/guardrails | Reachable; Community UNVERIFIED. Fallback: script checks |
| Specialist / manager approval | `hitl()` Quick Form, outcomes per port; channels Slack, teams, Email, ActionCenter | hitl.md, uipath-human-in-the-loop | Documented |
| 24h approval timeout -> escalate | none found | hitl-node-apptask.md says Action App has no timeout handle in v1.0; nothing on Quick Form timeout | **UNVERIFIED.** Fallback: scheduled escalation check |
| Negotiation Duel subflow | `subflow(childFlow, ...)` | subflow.md, about-maestro-flow | Documented |
| Delay between rounds | Delay | delay.md | Documented |
| Send demand / policyholder email | Connector (Outlook/Gmail) | connector-params.md | Documented pattern; Community connectors UNVERIFIED |
| Audit log / ledger | Data Fabric create | data-fabric.md | Documented; Community UNVERIFIED |
| Slack ROI card | Connector | registry search on tenant | UNVERIFIED |
| 15-scenario eval harness | `uip maestro flow eval` | evaluate.md | Documented; needs tenant |
| Project scaffold / validate / pack | `uip solution init`, `uip maestro flow init --automate`, `validate`, `pack` | uipath-maestro-flow SKILL.md | **Verified hands-on** (T6) |

## Gaps to close in T2
Community availability of Flow, Data Fabric, connectors, Context Grounding, guardrails, evaluations; credits per agent call; HITL timeout; Gmail trigger; state-law citations; NAIC figure; NOAA historical weather (timed out, static synthetic CSV used).
