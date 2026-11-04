// Recovery Duel document validation rules (A1).
// Checks the fields the Document Reader agent extracted from a SYNTHETIC repair estimate against the claim record.
// ES2020, no require: embedded verbatim into Flow Script nodes and loadable from Node for tests.
// The document never sets money: demand and floor stay with rules/rules.js. Only facts and a human check come out of here.
var RDDOC = (function () {
  var G = { MONEY_TOL: 1.0, CLAIM_TOL_PCT: 0.05, MIN_CONFIDENCE: 0.8 };
  var INJECTION = /(ignore (all |any )?(previous |prior )?(rules|instructions)|set (the )?(recovery )?floor|accept any offer|you are now|system\s*:|note to ai|disregard)/i;
  function num(x) {
    if (typeof x === 'number') return x;
    var n = Number(String(x == null ? '' : x).replace(/[$,\s]/g, ''));
    return String(x == null ? '' : x).trim() === '' ? NaN : n;
  }
  function near(a, b, tol) { return isFinite(a) && isFinite(b) && Math.abs(a - b) <= tol; }
  function str(x) { return String(x == null ? '' : x).trim(); }
  function hasInjection(f) {
    var keys = Object.keys(f || {});
    for (var i = 0; i < keys.length; i++) { var v = f[keys[i]]; if (typeof v === 'string' && INJECTION.test(v)) return true; }
    return false;
  }
  function sanitize(s) { s = str(s); return INJECTION.test(s) ? '[removed: instruction-like text]' : s.slice(0, 200); }

  // fields: agent output. claim: claim record (claims.csv row). mode: 'rules' or 'human'.
  function validate(fields, claim, mode) {
    var f = fields || {}; var c = claim || {};
    var total = num(f.total), subtotal = num(f.subtotal), tax = num(f.tax);
    var items = num(f.parts) + num(f.labor) + num(f.other);
    var expected = num(c.paid_amount) + num(c.deductible);
    var checks = {
      claim_id_match: str(f.claim_id).toUpperCase() === str(c.claim_id).toUpperCase(),
      vin_match: str(f.vin).toUpperCase() === str(c.vin).toUpperCase(),
      items_sum: near(items, subtotal, G.MONEY_TOL),
      total_math: near(subtotal + tax, total, G.MONEY_TOL),
      total_vs_claim: isFinite(total) && expected > 0 && Math.abs(total - expected) <= G.CLAIM_TOL_PCT * expected,
      confidence_ok: mode === 'human' ? true : num(f.confidence) >= G.MIN_CONFIDENCE,
      no_injection: mode === 'human' ? true : !(f.injection_suspected === true || hasInjection(f))
    };
    var failed = Object.keys(checks).filter(function (k) { return !checks[k]; });
    var injection = f.injection_suspected === true || hasInjection(f);
    var status = mode === 'human' ? 'HUMAN_VALIDATED' : (failed.length ? 'NEEDS_HUMAN_VALIDATION' : 'VALIDATED');
    return {
      status: status, validated_by: mode === 'human' ? 'HUMAN' : (failed.length ? 'PENDING_HUMAN' : 'RULES'),
      checks: checks, failed: failed, injection_flagged: injection,
      expected_total: expected,
      facts: {
        estimate_no: sanitize(f.estimate_no), total: isFinite(total) ? total : null,
        loss_cause_on_doc: sanitize(f.loss_cause), shop: sanitize(f.shop)
      },
      money_effect: 'none: demand and floor come from rules/rules.js only'
    };
  }
  function notProvided(reason) {
    return { status: reason || 'DOC_NOT_PROVIDED', validated_by: 'NONE', checks: {}, failed: [], injection_flagged: false,
      expected_total: null, facts: {}, money_effect: 'none: demand and floor come from rules/rules.js only' };
  }
  function rejected(prev, note) {
    var p = prev || {};
    return { status: 'DOC_REJECTED', validated_by: 'HUMAN', checks: p.checks || {}, failed: p.failed || [], injection_flagged: !!p.injection_flagged,
      expected_total: p.expected_total == null ? null : p.expected_total, facts: {}, note: str(note).slice(0, 300),
      money_effect: 'none: demand and floor come from rules/rules.js only' };
  }
  return { validate: validate, notProvided: notProvided, rejected: rejected, hasInjection: hasInjection, GUARDRAILS: G };
})();
if (typeof module !== 'undefined') module.exports = RDDOC;
