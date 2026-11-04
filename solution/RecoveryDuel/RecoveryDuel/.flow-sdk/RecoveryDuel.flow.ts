// Recovery Duel: intake -> evidence loop -> rules ranking (T6/T9 skeleton).
// Authored per uipath-maestro-flow skill; Script node bodies embed rules/rules.js verbatim.
import { flow, manual, script, http, input, v, js, types } from "@uipath/maestro-builder-sdk";
import { readFileSync } from "node:fs";

const RULES = readFileSync(new URL("../../../../rules/rules.js", import.meta.url), "utf8")
  .replace(/^if \(typeof module.*$/m, "");

export default flow("3ab9b771-e423-4076-854b-93909e653e94")
  .schemaVersion("1.9")
  .name("RecoveryDuel")
  .trigger(manual(), { version: "1.0" })
  .input({ claims: types.array, asOf: types.string, killSwitch: types.boolean })
  .output({ ranked: types.array, summary: types.object })
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
  .return({ ranked: js`$vars.rank.output.ranked`, summary: js`$vars.rank.output.summary` })
  .build();
