// Recovery Duel: intake -> evidence loop -> rules ranking (T6/T9 skeleton).
// Authored per uipath-maestro-flow skill; Script node bodies embed rules/rules.js verbatim.
import { flow, manual, script, http, input, v, js, types, inlineAgent } from "@uipath/maestro-builder-sdk";
import { readFileSync } from "node:fs";

const RULES = readFileSync(new URL("../../../../rules/rules.js", import.meta.url), "utf8")
  .replace(/^if \(typeof module.*$/m, "");

export default flow("3ab9b771-e423-4076-854b-93909e653e94")
  .schemaVersion("1.9")
  .name("RecoveryDuel")
  .trigger(manual(), { version: "1.0" })
  .input({ claims: types.array, asOf: types.string, killSwitch: types.boolean, counterparty: types.object })
  .output({ ranked: types.array, summary: types.object, evidence: types.object, liability: types.object, negotiation: types.object })
  .var("assessed", types.array, [])
  .var("neg", types.object, {})
  .step("intake", script({
    code: `
      const rows = $vars.start.output.claims || [];
      if ($vars.start.output.killSwitch) return { items: [], stopped: true };
      const items = rows.filter(c => c && c.claim_id).map(c => ({
        ...c, paid_amount: Number(c.paid_amount), deductible: Number(c.deductible),
        insured_fault_pct: Number(c.insured_fault_pct) }));
      return { items, stopped: false };`,
    returns: { items: "array", stopped: "boolean" },
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
      const c = top ? ($vars.start.output.claims || []).find(x => x.claim_id === top.claim_id) || {} : {};
      return { found: !!top, assessment: top || {}, claim: c, claimJson: JSON.stringify(c), assessmentJson: JSON.stringify(top || {}) };`,
    returns: { found: "boolean", assessment: "object", claim: "object", claimJson: "string", assessmentJson: "string" },
  }))
  .branch("noCase", js`!$vars.pickTop.output.found`,
    (t) => t.label("No claim qualifies").return({ ranked: js`$vars.rank.output.ranked`, summary: js`$vars.rank.output.summary`,
      evidence: js`({})`, liability: js`({})`, negotiation: js`({ status: "NO_CASE", simulated_counterparty: true, history: [] })` }))
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
  .step("stylePass", script({
    code: `const clean = (x) => typeof x === "string" ? x.replace(/\\s*[\\u2014\\u2013]\\s*/g, ", ").replace(/ ,/g, ",")
        : Array.isArray(x) ? x.map(clean) : (x && typeof x === "object") ? Object.keys(x).reduce((o, k) => { o[k] = clean(x[k]); return o; }, {}) : x;
      return { negotiation: clean($vars.neg), evidence: clean($vars.evidenceAnalyst.output || {}), liability: clean($vars.liabilityAssessor.output || {}) };`,
    returns: { negotiation: "object", evidence: "object", liability: "object" },
  }))
  .return({ negotiation: js`$vars.stylePass.output.negotiation`, ranked: js`$vars.rank.output.ranked`, summary: js`$vars.rank.output.summary`, evidence: js`$vars.stylePass.output.evidence`, liability: js`$vars.stylePass.output.liability` })
  .build();
