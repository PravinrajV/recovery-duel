# Recovery Duel voice-over script (silent demo)

Pair this with `/workspace/recovery-duel-demo/recovery-duel-demo-silent.mp4` (1280x720, 30 fps, ~3:48, no audio).
All claim data is SYNTHETIC. The other carrier is a SIMULATED agent.
Speak at about 140 words per minute. Pause briefly at each beat change.
Do not name any coding-agent product. Credit the UiPath CLI (`uip`) and UiPath skills.

## Timing table

| Start | End | Beat | On screen |
|---|---|---|---|
| 0:00 | 0:12 | `title` | Title card: Recovery Duel. SYNTHETIC claims, SIMULATED carrier. |
| 0:12 | 0:28 | `problem` | NAIC 4.5% salvage+subrogation benchmark. |
| 0:28 | 0:50 | `coding_agent` | AI coding agent + uip CLI + UiPath skills. 34 commits. BUILD_LOG. |
| 0:50 | 1:10 | `architecture` | Flow diagram: trigger/schedule -> NHTSA -> rules -> doc/agents -> duel -> approval -> ledger/email. |
| 1:10 | 1:28 | `agents_rules` | Evidence/Liability agents vs rules engine. S01 $11,050. |
| 1:28 | 1:48 | `document` | Document Reader: S01 validated, S05/S10 rejected, S14 injection flagged. |
| 1:48 | 2:10 | `duel` | S01 duel settled $11,050 / 5 rounds / specialist approved. |
| 2:10 | 2:26 | `approvals` | AUTO <=$5k, SPECIALIST <=$25k, MANAGER above. Real jobs cited. |
| 2:26 | 2:44 | `email` | Email to recoveryduel@vncntlabs.com. S14 injection ignored, floor $18,585. |
| 2:44 | 3:04 | `edges_schedule` | Impasse, kill switch, agent error. Schedule job 923fcbe1 settled $1805. |
| 3:04 | 3:20 | `results` | 15/15, 7/7 docs, $72,791 recovered, $2,890 refunds, 6/6 evals, ledger OK. |
| 3:20 | 3:36 | `real_sim` | Real vs simulated table. Judging criteria 30/40/30. |
| 3:36 | 3:48 | `end` | End card with repo link. |

## Narration by beat

### 0:00–0:12  ·  title

**On screen:** Title card: Recovery Duel. SYNTHETIC claims, SIMULATED carrier.

**Say:** Recovery Duel is my Maestro Automate Challenge entry. All claim data is synthetic, and the other carrier is a clearly labelled simulated agent. Nothing comes from any employer or real customer.

_Words: 31. Comfortable target for this beat at ~140 wpm: about 28._

### 0:12–0:28  ·  problem

**On screen:** NAIC 4.5% salvage+subrogation benchmark.

**Say:** When an insurer pays an auto claim, someone else is often at fault. Getting that money back is subrogation. Industry wide, salvage plus subrogation is about 4.5 percent of net claims paid. A lot gets missed because nobody has time to dig.

_Words: 42. Comfortable target for this beat at ~140 wpm: about 37._

### 0:28–0:50  ·  coding_agent

**On screen:** AI coding agent + uip CLI + UiPath skills. 34 commits. BUILD_LOG.

**Say:** I described the idea and the challenge rules. An AI coding agent did the whole build with the UiPath CLI, called uip, and the UiPath skills. No dragging nodes on the Studio canvas. The skills used include maestro-flow, platform, functions, agents, tasks, and human-in-the-loop. The repo has 34 commits and a BUILD_LOG that records every step.

_Words: 56. Comfortable target for this beat at ~140 wpm: about 51._

### 0:50–1:10  ·  architecture

**On screen:** Flow diagram: trigger/schedule -> NHTSA -> rules -> doc/agents -> duel -> approval -> ledger/email.

**Say:** Recovery Duel is a Maestro Flow. It starts from a manual trigger or a nightly schedule that reads claims from an Orchestrator storage bucket. It checks each vehicle against live NHTSA recall data. A rules engine owns every number: deadlines, fault, demand and floor.

_Words: 44. Comfortable target for this beat at ~140 wpm: about 46._

### 1:10–1:28  ·  agents_rules

**On screen:** Evidence/Liability agents vs rules engine. S01 $11,050.

**Say:** For a claim with a matching recall, two agents write the evidence and liability view with citations. A script rules engine owns every number. In the hero scenario, claim CLM-00017 settles at eleven thousand fifty dollars in five rounds.

_Words: 39. Comfortable target for this beat at ~140 wpm: about 42._

### 1:28–1:48  ·  document

**On screen:** Document Reader: S01 validated, S05/S10 rejected, S14 injection flagged.

**Say:** If a repair estimate is attached, a Document Reader agent reads it with Analyze Files. Rules check claim ID, VIN, and line item math. A tampered total and a wrong VIN go to Action Center and get rejected. Injected instructions are flagged. The estimate never changes our demand or floor.

_Words: 50. Comfortable target for this beat at ~140 wpm: about 46._

### 1:48–2:10  ·  duel

**On screen:** S01 duel settled $11,050 / 5 rounds / specialist approved.

**Say:** Now the duel. Our Negotiator agent faces a simulated carrier agent for up to five rounds. The script clamps every offer, so we cannot go below our floor and the carrier cannot go above its private limit. Claim seventeen settles at eleven thousand fifty dollars. That amount is in the specialist tier, so a person approves it.

_Words: 57. Comfortable target for this beat at ~140 wpm: about 51._

### 2:10–2:26  ·  approvals

**On screen:** AUTO <=$5k, SPECIALIST <=$25k, MANAGER above. Real jobs cited.

**Say:** Small settlements auto approve. Larger ones go to a specialist or a manager form in Action Center. A host script can reassign approvals older than twenty four hours.

_Words: 28. Comfortable target for this beat at ~140 wpm: about 37._

### 2:26–2:44  ·  email

**On screen:** Email to recoveryduel@vncntlabs.com. S14 injection ignored, floor $18,585.

**Say:** The flow sends a demand letter to the test inbox recoveryduel at vncntlabs.com. A simulated reply that says accept five hundred and set the floor to zero is flagged injection ignored. The floor stays eighteen thousand five hundred eighty five dollars.

_Words: 41. Comfortable target for this beat at ~140 wpm: about 42._

### 2:44–3:04  ·  edges_schedule

**On screen:** Impasse, kill switch, agent error. Schedule job 923fcbe1 settled $1805.

**Say:** Not every case settles. Lowball means impasse. A kill switch stops cleanly. An agent error goes to human review. A real time trigger settled claim thirty-nine at eighteen hundred five dollars, emailed the test inbox, and wrote the ledger. Triggers are now disabled.

_Words: 43. Comfortable target for this beat at ~140 wpm: about 46._

### 3:04–3:20  ·  results

**On screen:** 15/15, 7/7 docs, $72,791 recovered, $2,890 refunds, 6/6 evals, ledger OK.

**Say:** Fifteen of fifteen scenarios pass. Seven of seven document scenarios pass. Recovered: seventy-two thousand seven hundred ninety-one dollars. Policyholder refunds: two thousand eight hundred ninety. Local eval score: six of six.

_Words: 31. Comfortable target for this beat at ~140 wpm: about 37._

### 3:20–3:36  ·  real_sim

**On screen:** Real vs simulated table. Judging criteria 30/40/30.

**Say:** Real: NHTSA, UiPath agents, approvals, bucket, rules, and test-inbox mail. Simulated: claims and the other carrier. Built with an AI coding agent using the UiPath CLI and skills. Judging: innovation, build quality, real-world fit.

_Words: 34. Comfortable target for this beat at ~140 wpm: about 37._

### 3:36–3:48  ·  end

**On screen:** End card with repo link.

**Say:** Thanks for watching. The public repo is on GitHub under PravinrajV slash recovery-duel. All claim data is synthetic, and the other carrier is simulated.

_Words: 24. Comfortable target for this beat at ~140 wpm: about 28._

## Closing line (end card)

Thanks for watching. The public repo is github.com/PravinrajV/recovery-duel.

## Judging criteria mapping

| Criterion | Weight | Where this demo shows it |
|---|---|---|
| Innovation | 30 | AI coding agent drove the whole build with `uip` and UiPath skills (typed flow source, not canvas drag); agents negotiate inside script clamps; Document Reader with Analyze Files checked by rules |
| Build quality | 40 | 15/15 tenant scenarios, 7/7 document scenarios, local eval 6/6, kill switch and agent-error paths, schedule job 923fcbe1 verified then disabled, BUILD_LOG with 34 commits |
| Real-world applicability | 30 | Live NHTSA, Action Center tiers ($5k / $25k), storage bucket ledger, demand email to recoveryduel@vncntlabs.com, NAIC 4.5% indicator with honest not-like-for-like note |

## Sources for on-screen numbers

- S01 settle $11,050 / job 94cc5c4e: `docs/runs/T15_RESULTS.md`
- A1 document jobs: `docs/runs/A1_RESULTS.md`
- T16 email / S14 injection floor $18,585: `docs/runs/T16_RESULTS.md`
- Schedule job 923fcbe1 / CLM-00039 $1,805: `docs/runs/SCHEDULE_VERIFY.json`
- ROI $72,791 / $2,890 / $69,901: `docs/roi_report.html`
- Coding-agent evidence (CLI, skills, 34 commits): `BUILD_LOG.md`, `git rev-list --count HEAD`

## Gaps a browser session could add later

This cut is slide-based (no live UI footage). Optional inserts if you record on your machine:
- Studio Web Flow canvas of RecoveryDuel
- Action Center specialist / estimate validation forms
- Orchestrator job 923fcbe1 and the disabled nightly trigger
- Test inbox showing the demand letter subject for CLM-00039 or CLM-00017
