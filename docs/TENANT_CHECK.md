# T2 Tenant check — org pvincent / tenant Prod (2026-11-04 ~02:30 ET)
Skill: uipath-platform + uipath-maestro-flow (registry, debug). Raw outputs in docs/tenant/.

| Capability | Result | Command / evidence |
|---|---|---|
| Login | YES | `uip login status` -> Logged in, pravinraj.vincent@gmail.com |
| Voice agent node | YES (in registry) | `uip maestro flow registry search agent` -> `uipath.agent.voice`; skill ref voice.md (voiceTrigger/createOutgoingCall) |
| Phone numbers | UNVERIFIED (no CLI surface); not needed for Recovery Duel | needs portal check by owner |
| Data Fabric tables | **NO — service not provisioned** | `uip df entities list` -> redirect to `portal_/unregistered?serviceType=datafabric` |
| Data Fabric flow nodes | in registry | `registry search "data fabric"` -> core.datafabric.read/create/update |
| IS connectors Gmail/Slack/HTTP/Outlook/Twilio | YES (174 connectors, GA) | `uip is connectors list` |
| IS connections | NONE yet (need owner interactive sign-in) | `uip is connections list` -> [] |
| Agents / LLMs | YES | `uip agent model list` (Claude Haiku 4.5, Opus 4.6, …) |
| HITL / Action Center | YES | `uip tasks list` -> success, 0 tasks; registry: quick-form, coded-action-app |
| Approval timeouts | NO field found | `uip maestro flow registry get uipath.human-in-the-loop.quick-form` (no timeout/expiry/due) -> scheduled escalation fallback |
| Flow debug | YES | `uip maestro flow debug solution/RecoveryDuel/RecoveryDuel` -> finalStatus Completed (job 208a4d11) |
| Flow publish | UNTESTED (avoid Orchestrator package until T20) | `uip maestro flow publish` exists |
| Evaluations | YES (CLI) | `uip maestro flow eval` (sets/evaluators/runs), `uip agent eval` |
| Context Grounding | node in registry; index not tested | `registry search "context grounding"` |
| Credits / AI units | NOT visible via CLI | no command; owner checks Admin > Licenses |
| Email-received trigger | YES | registry: `uipath.connector.trigger.uipath-google-gmail.email-received` (+Outlook, Mail) |
| Subflow | YES | `core.subflow` |
| Parallel | YES | `core.logic.merge` (parallel-merge.md) |
| Folders | Personal workspace + 1 other | `uip or folders list` |
