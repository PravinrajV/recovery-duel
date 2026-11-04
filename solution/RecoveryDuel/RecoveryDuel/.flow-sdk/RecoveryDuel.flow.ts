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
  .input({ claims: types.array, asOf: types.string, killSwitch: types.boolean })
  .output({ ranked: types.array, summary: types.object, evidence: types.object, liability: types.object })
  .var("assessed", types.array, [])
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
  .return({ ranked: js`$vars.rank.output.ranked`, summary: js`$vars.rank.output.summary`, evidence: js`$vars.evidenceAnalyst.output`, liability: js`$vars.liabilityAssessor.output` })
  .build();
