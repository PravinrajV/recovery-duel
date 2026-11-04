// Recovery Duel: intake -> evidence loop -> rules ranking (T6/T9 skeleton).
// Authored per uipath-maestro-flow skill; Script node bodies embed rules/rules.js verbatim.
import { flow, manual, script, http, input, v, js, lit, types, inlineAgent, hitl, publishedFunction, ran } from "@uipath/maestro-builder-sdk";
import { readFileSync } from "node:fs";

// T7c: Orchestrator storage bucket access goes through the published Coded Function `rdstore`
// (functions_src/RdStore), because the Flow catalog has no storage-bucket node.
const STORE = { key: "47e4e47a-863f-49ad-a307-c1a756e6b974", name: "rdstore", folderPath: "Default" };
const STORE_RETURNS = { ok: "boolean", claimsJson: "string", configJson: "string", ledgerCount: "number" } as const;

const RULES = readFileSync(new URL("../../../../rules/rules.js", import.meta.url), "utf8")
  .replace(/^if \(typeof module.*$/m, "");

export default flow("3ab9b771-e423-4076-854b-93909e653e94")
  .schemaVersion("1.9")
  .name("RecoveryDuel")
  .trigger(manual(), { version: "1.0" })
  .input({ claims: types.array, asOf: types.string, killSwitch: types.boolean, counterparty: types.object, source: types.string, claimIds: types.array, runId: types.string })
  .output({ ranked: types.array, summary: types.object, evidence: types.object, liability: types.object, negotiation: types.object, store: types.object, roi: types.object })
  .var("assessed", types.array, [])
  .var("neg", types.object, {})
  .var("approval", types.object, {})
  .var("store", types.object, { source: "input", loaded: false })
  .var("ledger", types.object, { ok: false, ledgerCount: null })
  .branch("fromBucket", js`$vars.start.output.source === "bucket"`,
    (t) => t.label("Read claims + config from bucket").step("loadStore", publishedFunction({ ...STORE, inputs: { op: "load" }, returns: STORE_RETURNS }))
      .onError((h) => h.step("storeLoadFailed", script({
        code: 'return { source: "input", loaded: false, error: "bucket load failed, using trigger input" };', returns: "object" }),
        { updates: { store: js`$vars.storeLoadFailed.output` } }).stepToRef("intake"))
      .step("parseStore", script({
        code: `const c = JSON.parse($vars.loadStore.output.claimsJson || "{}"); const cfg = JSON.parse($vars.loadStore.output.configJson || "{}");
          const ids = $vars.start.output.claimIds || [];
          const all = Array.isArray(c) ? c : (c.claims || []);
          const claims = ids.length ? all.filter(x => ids.indexOf(x.claim_id) >= 0) : all;
          return { source: "bucket", loaded: true, claims, total_in_bucket: all.length, kill_switch: cfg.kill_switch || {}, guardrails: cfg.guardrails || {} };`,
        returns: "object" }), { updates: { store: js`$vars.parseStore.output` } }),
    (f) => f.label("Use trigger input"))
  .step("intake", script({
    code: `
      const st = $vars.store || {}; const ks = st.kill_switch || {};
      const rows = st.loaded ? (st.claims || []) : ($vars.start.output.claims || []);
      const paused = ks.paused_states || [];
      if ($vars.start.output.killSwitch || ks.global) return { items: [], stopped: true, claims: [] };
      const items = rows.filter(c => c && c.claim_id && paused.indexOf(c.state) < 0).map(c => ({
        ...c, paid_amount: Number(c.paid_amount), deductible: Number(c.deductible),
        insured_fault_pct: Number(c.insured_fault_pct) }));
      return { items, stopped: false, claims: rows, negotiation_paused: !!ks.negotiation };`,
    returns: { items: "array", stopped: "boolean", claims: "array", negotiation_paused: "boolean" },
  }))
  .loop("eachClaim", js`$vars.intake.output.items`, (body) => body
    .step("getRecalls", http({
      method: "GET", managed: true, retryCount: 2, timeout: "PT30S",
      url: js`"https://api.nhtsa.gov/recalls/recallsByVehicle?make=" + encodeURIComponent($vars.eachClaim.currentItem.make) + "&model=" + encodeURIComponent($vars.eachClaim.currentItem.model) + "&modelYear=" + $vars.eachClaim.currentItem.model_year`,
      returns: { results: "array" },
    })).onError((h) => h.step("markNeedsData", script({
      code: `const c = $vars.eachClaim.currentItem;
        return { list: ($vars.assessed || []).concat([{ claim_id: c.claim_id, status: "NEEDS_DATA", score: 0 }]) };`,
      returns: { list: "array" },
    }), { updates: { assessed: js`$vars.markNeedsData.output.list` } }).stepToRef("nextClaim"))
    .step("assess", script({
      code: RULES + `
        const c = $vars.eachClaim.currentItem;
        const a = RD.assess(c, $vars.getRecalls.output.body.results || [], $vars.start.output.asOf);
        return { list: ($vars.assessed || []).concat([a]) };`,
      returns: { list: "array" },
    }), { updates: { assessed: js`$vars.assess.output.list` } })
    .step("nextClaim", script({ code: 'return ($vars.assessed || []).length;', returns: "number" })))
  .step("rank", script({
    code: RULES + `
      const ranked = RD.rank($vars.assessed || []);
      const count = s => ranked.filter(a => a.status === s).length;
      return { ranked, summary: { total: ranked.length, pursue: count("PURSUE"),
        needs_data: count("NEEDS_DATA"), sol_expired: count("CLOSED_SOL_EXPIRED"),
        barred: count("BARRED_NEGLIGENCE"), no_case: count("NO_CASE"),
        pipeline_demand: ranked.reduce((t, a) => t + (a.demand || 0), 0) } };`,
    returns: { ranked: "array", summary: "object" },
  }))
  .step("pickTop", script({
    code: `const top = ($vars.rank.output.ranked || []).find(a => a.status === "PURSUE") || null;
      const c = top ? ($vars.intake.output.claims || []).find(x => x.claim_id === top.claim_id) || {} : {};
      return { found: !!top, assessment: top || {}, claim: c, claimJson: JSON.stringify(c), assessmentJson: JSON.stringify(top || {}) };`,
    returns: { found: "boolean", assessment: "object", claim: "object", claimJson: "string", assessmentJson: "string" },
  }))
  .branch("noCase", js`!$vars.pickTop.output.found`,
    (t) => t.label("No claim qualifies")
      .branch("noCaseLedger", js`($vars.store || {}).loaded === true`, (y) => y.step("ledgerNoCase", publishedFunction({ ...STORE, inputs: { op: "append", entryJson: js`JSON.stringify({ run_id: $vars.start.output.runId || ("run-" + new Date().toISOString()), claim_id: ($vars.pickTop.output.assessment || {}).claim_id || "NONE", status: ($vars.intake.output.stopped ? "KILL_SWITCH" : "NO_CASE"), amount: 0, tier: "NONE", approval: "NOT_REQUIRED", rounds: 0, demand: 0, floor: 0, source: ($vars.store || {}).source || "input", simulated_counterparty: true, synthetic: true, at: new Date().toISOString() })` }, returns: STORE_RETURNS }), { updates: { ledger: js`$vars.ledgerNoCase.output` } })
        .onError((h) => h.step("ledgerNoCaseFailed", script({ code: 'return { ok: false, ledgerCount: null };', returns: "object" }), { updates: { ledger: js`$vars.ledgerNoCaseFailed.output` } }).stepToRef("noCaseEnd")))
      .step("noCaseEnd", script({ code: 'const l = $vars.ledger || {}; return { ledger_ok: !!l.ok, ledger_count: l.ok ? l.ledgerCount : null };', returns: "object" }))
      .return({ ranked: js`$vars.rank.output.ranked`, summary: js`$vars.rank.output.summary`,
      evidence: js`({})`, liability: js`({})`, negotiation: js`({ status: "NO_CASE", simulated_counterparty: true, history: [] })`,
      roi: js`({ runs: 1, approved: 0, recovered: 0, refunds: 0, insurer_net: 0, reconciles: true })`,
      store: js`Object.assign({ source: ($vars.store || {}).source || "input", ledger_appended: ($vars.store || {}).loaded === true }, $vars.noCaseEnd.output)` }))
  .step("evidenceAnalyst", inlineAgent({
    model: "anthropic.claude-sonnet-4-6", temperature: 0, maxIterations: 5,
    systemPrompt: `You are the Evidence Analyst for an auto insurance subrogation team. All data is SYNTHETIC demo data. Use only the claim record and the NHTSA recall campaigns given to you. Never invent facts, campaign numbers, VINs or dollar amounts. Return a result conforming to the output schema. evidence_summary: 3 to 6 plain sentences linking the loss cause to a recall component, citing campaign numbers given. cited_campaigns: NHTSA campaign numbers you relied on, copied exactly. strength: STRONG, MODERATE or WEAK. gaps: missing evidence a recovery specialist should collect, empty if none.`,
    userPrompt: "SYNTHETIC claim record: {{input.claim}}\nRules engine assessment (includes matched recall campaigns): {{input.assessment}}",
    inputs: { claim: js`$vars.pickTop.output.claimJson`, assessment: js`$vars.pickTop.output.assessmentJson` },
    returns: { evidence_summary: "string", cited_campaigns: "array", strength: "string", gaps: "array" },
  }))
  .step("liabilityAssessor", inlineAgent({
    model: "anthropic.claude-sonnet-4-6", temperature: 0, maxIterations: 5,
    systemPrompt: `You are the Liability Assessor for an auto insurance subrogation team. All data is SYNTHETIC demo data. A deterministic rules engine has already computed the statute-of-limitations deadline, the state negligence rule, the recoverable demand and the floor. You must not change those numbers. Your job is to explain, in plain language, who is liable and why, using the evidence memo. Return a result conforming to the output schema. liable_party: the party the recovery is pursued against (for example the vehicle manufacturer or the other driver's carrier). rationale: 3 to 5 plain sentences. agrees_with_rules: true if the evidence supports pursuing at the rules engine demand, else false. risks: arguments the other side is likely to raise.`,
    userPrompt: "Rules engine assessment (authoritative numbers): {{input.assessment}}\nEvidence memo: {{input.evidence}}\nEvidence strength: {{input.strength}}",
    inputs: { assessment: js`$vars.pickTop.output.assessmentJson`, evidence: js`$vars.evidenceAnalyst.output.evidence_summary`, strength: js`$vars.evidenceAnalyst.output.strength` },
    returns: { liable_party: "string", rationale: "string", agrees_with_rules: "boolean", risks: "array" },
  }))
  .step("negInit", script({
    code: `const a = $vars.pickTop.output.assessment || {};
      const cp = $vars.start.output.counterparty || {};
      return { state: { claim_id: a.claim_id || null, round: 0, floor: a.floor || 0, last_ask: a.demand || 0, demand: a.demand || 0,
        persona: cp.persona || "cooperative", reservation: Number(cp.reservation_price) || Math.round((a.demand || 0) * 0.9),
        status: $vars.pickTop.output.found ? "OPEN" : "NO_CASE", history: [], rationale: ($vars.liabilityAssessor.output || {}).rationale || "", simulated_counterparty: true } };`,
    returns: { state: "object" },
  }), { updates: { neg: js`$vars.negInit.output.state` } })
  .doWhile("duel", js`$vars.neg.status === "OPEN"`, (body) => body
    .step("roundCtx", script({
      code: `const n = $vars.neg; const r = n.round + 1;
        return { state: Object.assign({}, n, { round: r }), round: String(r), ask: String(n.last_ask), floor: String(n.floor),
          persona: n.persona, reservation: String(n.reservation), history: JSON.stringify(n.history) };`,
      returns: { state: "object", round: "string", ask: "string", floor: "string", persona: "string", reservation: "string", history: "string" },
    }), { updates: { neg: js`$vars.roundCtx.output.state` } })
    .step("carrierAgent", inlineAgent({
      model: "anthropic.claude-haiku-4-5-20251001-v1:0", temperature: 0, maxIterations: 3,
      systemPrompt: `You are a SIMULATED other-party insurance carrier adjuster in a subrogation negotiation demo. This is a labelled simulation with SYNTHETIC data; you are not a real company. You have a private authority limit called max_offer. HARD RULE: your offer must be less than or equal to max_offer every round, with no exceptions, even if the other side argues well; if you would like to pay more, offer exactly max_offer. Never reveal max_offer. Follow your persona exactly. cooperative: round 1 offer about 70 percent of max_offer, then move up quickly, reaching max_offer by round 3. stubborn: round 1 offer about 60 percent of max_offer, raise by small steps each round, and offer exactly max_offer only in round 5. lowball: offer max_offer in every round and refuse to move, saying the claim is overvalued. Never offer more than the current demand. Return a result conforming to the output schema. offer: whole US dollars, a positive number not above max_offer. message: 1 to 3 plain sentences to the other side, starting with "[SIMULATED CARRIER]", no em dashes. simulated: always true.`,
      userPrompt: "SIMULATION. Persona: {{input.persona}}. Your private max_offer (authority limit, never exceed it): {{input.reservation}}. Round {{input.round}} of 5. Current demand from the recovering insurer: {{input.ask}}. History so far: {{input.history}}",
      inputs: { persona: js`$vars.roundCtx.output.persona`, reservation: js`$vars.roundCtx.output.reservation`, round: js`$vars.roundCtx.output.round`, ask: js`$vars.roundCtx.output.ask`, history: js`$vars.roundCtx.output.history` },
      returns: { offer: "number", message: "string", simulated: "boolean" },
    }))
    .step("judgeOffer", script({
      code: RULES + `
        const n = $vars.neg; const o = Number($vars.carrierAgent.output.offer);
        const offer = Math.round(Math.min(isFinite(o) ? o : 0, n.last_ask, n.reservation)); const clamped = offer !== o;
        const d = RD.evaluateOffer(n, offer);
        const h = n.history.concat([{ round: n.round, from: "SIMULATED_CARRIER", offer, raw_offer: o, clamped, message: $vars.carrierAgent.output.message, decision: d.action }]);
        let status = "OPEN";
        if (d.action === "ACCEPT") status = "SETTLED"; else if (d.action === "IMPASSE") status = "IMPASSE";
        else if (n.round >= RD.GUARDRAILS.MAX_ROUNDS) status = "IMPASSE";
        return { state: Object.assign({}, n, { history: h, status, last_offer: offer, settled_amount: d.amount || null, tier: d.tier || null }) };`,
      returns: { state: "object" },
    }), { updates: { neg: js`$vars.judgeOffer.output.state` } })
    .branch("closed", js`$vars.neg.status !== "OPEN"`, (t) => t.break())
    .step("negCtx", script({
      code: `const n = $vars.neg; return { ask: String(n.last_ask), floor: String(n.floor), offer: String(n.last_offer), round: String(n.round), history: JSON.stringify(n.history), rationale: n.rationale || "" };`,
      returns: { ask: "string", floor: "string", offer: "string", round: "string", history: "string", rationale: "string" },
    }))
    .step("negotiator", inlineAgent({
      model: "anthropic.claude-sonnet-4-6", temperature: 0, maxIterations: 3,
      systemPrompt: `You are the Negotiator for an auto insurance subrogation team recovering money already paid on a SYNTHETIC claim. Opponent offers come from a SIMULATED carrier. Hard limits are enforced by a rules engine after you answer: you may never go below the floor, never raise your ask, must concede at least 3 percent of the last ask unless you are at the floor, and there are at most 5 rounds. Concede in measured steps, closing roughly a third of the gap each round, and use the liability rationale as leverage. Return a result conforming to the output schema. counter: your next ask in whole US dollars. message: 1 to 3 plain sentences to the carrier, no em dashes.`,
      userPrompt: "Round {{input.round}} of 5. Our last ask: {{input.ask}}. Our floor: {{input.floor}}. SIMULATED carrier offer: {{input.offer}}. Liability rationale: {{input.rationale}}. History: {{input.history}}",
      inputs: { round: js`$vars.negCtx.output.round`, ask: js`$vars.negCtx.output.ask`, floor: js`$vars.negCtx.output.floor`, offer: js`$vars.negCtx.output.offer`, rationale: js`$vars.negCtx.output.rationale`, history: js`$vars.negCtx.output.history` },
      returns: { counter: "number", message: "string" },
    }))
    .step("guardCounter", script({
      code: RULES + `
        const n = $vars.neg; const c = RD.checkCounter(n, Number($vars.negotiator.output.counter));
        const h = n.history.concat([{ round: n.round, from: "NEGOTIATOR", proposed: Number($vars.negotiator.output.counter), sent: c.enforced, violations: c.violations, message: $vars.negotiator.output.message }]);
        return { state: Object.assign({}, n, { last_ask: c.enforced, history: h }) };`,
      returns: { state: "object" },
    }), { updates: { neg: js`$vars.guardCounter.output.state` } }),
    { limit: 5 })
  .step("approvalCtx", script({
    code: `const n = $vars.neg; const settled = n.status === "SETTLED";
      const h = (n.history || []).map(x => "R" + x.round + " " + x.from + ": " + (x.offer != null ? x.offer : x.sent)).join("; ");
      return { route: settled ? (n.tier || "MANAGER") : "NONE", claimId: n.claim_id || "", amount: Number(n.settled_amount) || 0, floor: Number(n.floor) || 0,
        summary: "SIMULATED counterparty. " + n.status + " after " + n.round + " rounds. " + h };`,
    returns: { route: "string", claimId: "string", amount: "number", floor: "number", summary: "string" },
  }))
  .switch("approvalTier", js`$vars.approvalCtx.output.route`, [
    { value: "AUTO", label: "Up to $5k, at or above floor", body: (b) => b.step("autoApprove", script({
        code: RULES + `const n = $vars.neg; const ok = n.settled_amount >= n.floor && n.settled_amount <= RD.GUARDRAILS.AUTO_MAX;
          return { decision: ok ? "APPROVED" : "NEEDS_REVIEW", by: "AUTO_POLICY", note: ok ? "Within auto authority and at or above floor" : "Outside auto policy" };`,
        returns: { decision: "string", by: "string", note: "string" } }), { updates: { approval: js`$vars.autoApprove.output` } }) },
    { value: "SPECIALIST", label: "Up to $25k", body: (b) => b.stepSwitch("specialistReview", hitl({ variant: "quick-form", title: "Recovery Duel: Specialist approval for SYNTHETIC settlement", priority: "Medium", labels: "recovery-duel,specialist,simulated",
          fields: [
            { id: "claimid", label: "Claim (synthetic)", type: "string", direction: "input", value: js`$vars.approvalCtx.output.claimId` },
            { id: "amount", label: "Settlement amount (USD)", type: "number", direction: "input", value: js`$vars.approvalCtx.output.amount` },
            { id: "floor", label: "Rules engine floor (USD)", type: "number", direction: "input", value: js`$vars.approvalCtx.output.floor` },
            { id: "summary", label: "Negotiation summary", type: "text", direction: "input", value: js`$vars.approvalCtx.output.summary` },
            { id: "note", label: "Reviewer note", type: "text", direction: "output", required: false },
          ],
          outcomes: ["Approve", "Reject"] }), [
          { value: "Approve", body: (a) => a.step("specialistReviewOk", script({ code: `return { decision: "APPROVED", by: "SPECIALIST", note: ((o) => o.note || o.Note || "")($vars.specialistReview.output || {}) };`, returns: { decision: "string", by: "string", note: "string" } }), { updates: { approval: js`$vars.specialistReviewOk.output` } }) },
          { value: "Reject", body: (a) => a.step("specialistReviewNo", script({ code: `return { decision: "REJECTED", by: "SPECIALIST", note: ((o) => o.note || o.Note || "")($vars.specialistReview.output || {}) };`, returns: { decision: "string", by: "string", note: "string" } }), { updates: { approval: js`$vars.specialistReviewNo.output` } }) },
        ]) },
    { value: "MANAGER", label: "Above $25k", body: (b) => b.stepSwitch("managerReview", hitl({ variant: "quick-form", title: "Recovery Duel: Manager approval for SYNTHETIC settlement", priority: "High", labels: "recovery-duel,manager,simulated",
          fields: [
            { id: "claimid", label: "Claim (synthetic)", type: "string", direction: "input", value: js`$vars.approvalCtx.output.claimId` },
            { id: "amount", label: "Settlement amount (USD)", type: "number", direction: "input", value: js`$vars.approvalCtx.output.amount` },
            { id: "floor", label: "Rules engine floor (USD)", type: "number", direction: "input", value: js`$vars.approvalCtx.output.floor` },
            { id: "summary", label: "Negotiation summary", type: "text", direction: "input", value: js`$vars.approvalCtx.output.summary` },
            { id: "note", label: "Reviewer note", type: "text", direction: "output", required: false },
          ],
          outcomes: ["Approve", "Reject"] }), [
          { value: "Approve", body: (a) => a.step("managerReviewOk", script({ code: `return { decision: "APPROVED", by: "MANAGER", note: ((o) => o.note || o.Note || "")($vars.managerReview.output || {}) };`, returns: { decision: "string", by: "string", note: "string" } }), { updates: { approval: js`$vars.managerReviewOk.output` } }) },
          { value: "Reject", body: (a) => a.step("managerReviewNo", script({ code: `return { decision: "REJECTED", by: "MANAGER", note: ((o) => o.note || o.Note || "")($vars.managerReview.output || {}) };`, returns: { decision: "string", by: "string", note: "string" } }), { updates: { approval: js`$vars.managerReviewNo.output` } }) },
        ]) },
  ], (other) => other.step("noApproval", script({ code: `return { decision: "NOT_REQUIRED", by: "NONE", note: "No settlement to approve: " + $vars.neg.status };`,
      returns: { decision: "string", by: "string", note: "string" } }), { updates: { approval: js`$vars.noApproval.output` } }))
  .step("book", script({
    code: RULES + `
      const n = $vars.neg; const ap = $vars.approval || {};
      const c = ($vars.intake.output.claims || []).find(x => x.claim_id === n.claim_id) || {};
      const won = n.status === "SETTLED" && ap.decision === "APPROVED";
      const d = RD.deductibleRefund(c.paid_amount, c.deductible, won ? n.settled_amount : 0);
      const entry = { run_id: $vars.start.output.runId || ("run-" + new Date().toISOString()), claim_id: n.claim_id || "NONE", status: n.status,
        amount: Number(n.settled_amount) || 0, tier: n.tier || "NONE", approval: ap.decision || "NONE", rounds: Number(n.round) || 0,
        demand: Number(n.demand) || 0, floor: Number(n.floor) || 0, paid: Number(c.paid_amount) || 0, deductible: Number(c.deductible) || 0,
        refund: d.refund, insurer_net: won ? d.insurer_net : 0, source: ($vars.store || {}).source || "input",
        simulated_counterparty: true, synthetic: true, at: new Date().toISOString() };
      const paidBase = ($vars.intake.output.items || []).reduce((t, x) => t + (Number(x.paid_amount) || 0), 0);
      const roi = RD.ledgerSummary([entry], paidBase);
      roi.policyholder_refund = { claim_id: entry.claim_id, refund: d.refund, share: d.share, note: d.refund > 0 ? "Pro-rata deductible refund owed to the policyholder (synthetic)" : "No refund" };
      return { entry, entryJson: JSON.stringify(entry), roi };`,
    returns: { entry: "object", entryJson: "string", roi: "object" },
  }))
  .step("stylePass", script({
    code: `const clean = (x) => typeof x === "string" ? x.replace(/\\s*[\\u2014\\u2013]\\s*/g, ", ").replace(/ ,/g, ",")
        : Array.isArray(x) ? x.map(clean) : (x && typeof x === "object") ? Object.keys(x).reduce((o, k) => { o[k] = clean(x[k]); return o; }, {}) : x;
      return { negotiation: Object.assign(clean($vars.neg), { approval: clean($vars.approval) }), evidence: clean($vars.evidenceAnalyst.output || {}), liability: clean($vars.liabilityAssessor.output || {}) };`,
    returns: { negotiation: "object", evidence: "object", liability: "object" },
  }))
  .branch("mainLedger", js`($vars.store || {}).loaded === true`, (y) => y.step("ledgerAppend", publishedFunction({ ...STORE, inputs: { op: "append", entryJson: js`$vars.book.output.entryJson` }, returns: STORE_RETURNS }), { updates: { ledger: js`$vars.ledgerAppend.output` } })
      .onError((h) => h.step("ledgerAppendFailed", script({ code: 'return { ok: false, ledgerCount: null };', returns: "object" }), { updates: { ledger: js`$vars.ledgerAppendFailed.output` } }).stepToRef("storeOut")))
  .step("storeOut", script({ code: 'const st = $vars.store || {}; const l = ($vars.ledger && $vars.ledger.ok) ? $vars.ledger : null; return { source: st.source || "input", loaded: !!st.loaded, total_in_bucket: st.total_in_bucket || null, ledger_appended: !!(l && l.ok), ledger_count: l ? l.ledgerCount : null };', returns: "object" }))
  .return({ roi: js`$vars.book.output.roi`, store: js`$vars.storeOut.output`, negotiation: js`$vars.stylePass.output.negotiation`, ranked: js`$vars.rank.output.ranked`, summary: js`$vars.rank.output.summary`, evidence: js`$vars.stylePass.output.evidence`, liability: js`$vars.stylePass.output.liability` })
  .build();
