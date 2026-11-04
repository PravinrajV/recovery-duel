# PROGRESS
| Task | Status | Commit | Notes / next |
|---|---|---|---|
| T1 T3 T4 T5 | done | 2104220 | |
| T6 skeleton, T9 rules engine (16/16) | done | 1066b28 | |
| T2 tenant check | done | 66b5843 | docs/TENANT_CHECK.md |
| T7/T8 data store | REPLANNED | | Storage bucket `recovery-duel-data` with claims.json, scenarios.json, ledger.json via `uip or` buckets; offline = repo JSON |
| Connections (Gmail test inbox, Slack) | Gmail SUPERSEDED by T16 IONOS inbox; Slack still needs owner sign-in | | `uip is connections create` needs interactive OAuth |
| S02 seed fix | done | | reservation 9000, settles round 5 |
| T10 Evidence Analyst + Liability Assessor | done | | debug job ef089aaa Completed |
| Intake data | DECIDED (owner, 2026-11-04) | | Data Fabric not available on Community license. Use Orchestrator storage bucket + JSON files (local JSON offline). T7/T8 re-planned as storage-bucket JSON |
| T11 Negotiator + SIMULATED carrier | done | | debug 978c169d SETTLED $11,050 r5; carrier offer clamped to reservation |
| T12 carrier prompt + NO_CASE guard + style pass | done | | S02 SETTLED $9,000 r5 (572c6b96), S03 IMPASSE (90a491bb), EMPTY skips agents (39166365), 0 clamps |
| T13 HITL approval tiers + 24h escalation script | done | | AUTO 4af5efd0, SPECIALIST approve bc1af303, MANAGER reject 53a23b11 |
| T7/T8 bucket JSON data layer | done | | bucket recovery-duel-data (key 25e701cb-...) in Shared folder; claims/config/ledger uploaded, roundtrip identical. Flow read/append wiring pending |
| T7c flow <-> bucket | done | | Coded Function `rdstore` (Default folder) load/append via robot token; bucket recovery-duel-data in Default; debug f7644150 bucket SETTLED + ledger append, fdb50ae4 kill switch, a3edb329 fallback to input |
| T14 ledger + deductible refund + ROI | done | | NAIC JIR 2023 4.5% / 6.2% VERIFIED from PDF; test_ledger 4/4; debug df75a510 refund $180, net $1,696, roi_report reconciles |
| T15 15-scenario tenant harness | done | | 15/15 PASS, scripts/harness.py, docs/runs/T15_RESULTS.md; S13/S14 email paths partial until T16 |
| T17 kill switches + error paths | done | | negotiation kill switch (input + config) PAUSED_KILL_SWITCH debug bfe72eff; agent onError -> NEEDS_REVIEW_AGENT_ERROR (validated, not forced on tenant); regression S01/S02/S11/S15 4/4 |
| T18 ROI report (HTML fallback) | done | | docs/roi_report.html: recovered $72,791 = refunds $2,890 + net $69,901, reconciles; Slack card deferred to after sign-in |
| T19 hardening | done | | 3 clean runs: bucket 1015ac55 (ledger 3 -> 4), S01 740f0214, S02 06e8fa26; agent onError verified on tenant 007fde7b (NEEDS_REVIEW_AGENT_ERROR); no flakes |
| T20 demo script | done (draft) | | docs/DEMO_SCRIPT.md; recording by owner; email shots wait on T16 |
| T21 README | done | | email row updated for T16 |
| T16 email channel | done | (see git log) | Test inbox recoveryduel@vncntlabs.com (IONOS). IS Mail connector (uipath-mail-mail) has no send and needs a browser form, so Coded Function `rdmail` 1.0.1 (process 6ef74487, Default) does SMTP send + IMAP read; login in Credential asset `rd-mail`. Recipient hard-coded. Debug S01 7737144c, S13 9b55f1c6 DOC_REQUEST, S14 d02fd717 INJECTION_IGNORED ($500 below floor, not applied). docs/runs/T16_RESULTS.md |
| T22 coding-agent section | done (owner review) | | in README |
| NEXT | T16 done. Next T23 verify repo signed out, T24 submission draft. Earlier NEXT notes below are superseded | T19 hardening (3 clean full runs incl. bucket source); T16 email channel BLOCKED on owner Gmail sign-in (test inbox connection). Unblocked alternative: T17 kill switches + error paths polish |
| (old) | T12: tune carrier persona prompt, NO_CASE guard branch, tenant runs for S02 stubborn + S03 lowball (impasse), then HITL approval tiers (T13) and storage-bucket JSON (T7/T8) | | |
