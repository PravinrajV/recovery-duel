// Recovery Duel deterministic rules engine (T9).
// ES2020, no require/fetch/Intl/Date-locale: safe for UiPath Flow Script nodes.
// Embedded into Script node bodies by the flow source; also loadable from Node for tests.
// State law values are ILLUSTRATIVE and UNVERIFIED, not legal advice.
var RD = (function () {
  var STATE_RULES = {
    CA: { sol_years: 3, doctrine: 'pure_comparative' },
    NY: { sol_years: 3, doctrine: 'pure_comparative' },
    TX: { sol_years: 2, doctrine: 'modified_51' },
    FL: { sol_years: 4, doctrine: 'modified_51' },
    VA: { sol_years: 5, doctrine: 'contributory' }
  };
  var CAUSE_COMPONENT = {
    brake_failure_rear_end: 'SERVICE BRAKES', engine_stall_fuel_pump: 'FUEL SYSTEM',
    tire_blowout: 'TIRES', headlight_failure_night_collision: 'EXTERIOR LIGHTING',
    airbag_nondeploy: 'AIR BAGS', hail_damage: null, deer_strike: null, parking_lot_backing: null
  };
  var G = { MAX_ROUNDS: 5, MIN_CONCESSION_PCT: 0.03, FLOOR_PCT: 0.70, AUTO_MAX: 5000, SPECIALIST_MAX: 25000 };
  var DAY = 86400000;
  function ymd(s) { var p = String(s).split('-').map(Number); return Date.UTC(p[0], p[1] - 1, p[2]); }
  function addYears(s, n) { var p = String(s).split('-').map(Number); return Date.UTC(p[0] + n, p[1] - 1, p[2]); }

  function sol(claim, asOf) {
    var r = STATE_RULES[claim.state];
    if (!r) return { known: false, days_left: null, expired: null };
    var d = Math.round((addYears(claim.loss_date, r.sol_years) - ymd(asOf)) / DAY);
    return { known: true, days_left: d, expired: d < 0, deadline_ms: addYears(claim.loss_date, r.sol_years) };
  }
  function negligence(claim) {
    var r = STATE_RULES[claim.state] || { doctrine: 'unknown' };
    var f = Number(claim.insured_fault_pct) || 0;
    var barred = false, factor = 1 - f / 100;
    if (r.doctrine === 'contributory') barred = f > 0;
    else if (r.doctrine === 'modified_51') barred = f >= 51;
    else if (r.doctrine !== 'pure_comparative') barred = true;
    if (barred) factor = 0;
    return { doctrine: r.doctrine, insured_fault_pct: f, barred: barred, factor: factor };
  }
  function recallMatch(claim, recalls) {
    var kw = CAUSE_COMPONENT[claim.loss_cause];
    if (!kw) return { match: false, reason: 'loss cause not recall-related' };
    var list = recalls || [];
    for (var i = 0; i < list.length; i++) {
      var c = String(list[i].Component || '').toUpperCase();
      if (c.indexOf(kw) === 0) return { match: true, campaign: list[i].NHTSACampaignNumber, component: c };
    }
    return { match: false, reason: 'no recall component matches ' + kw };
  }
  function assess(claim, recalls, asOf) {
    if (claim.data_status && claim.data_status !== 'OK')
      return { claim_id: claim.claim_id, status: 'NEEDS_DATA', score: 0 };
    var s = sol(claim, asOf), n = negligence(claim), m = recallMatch(claim, recalls);
    var gross = Number(claim.paid_amount) + Number(claim.deductible);
    var base = { claim_id: claim.claim_id, sol: s, negligence: n, recall: m, gross: gross };
    if (!s.known) return Object.assign(base, { status: 'NEEDS_DATA', score: 0 });
    if (s.expired) return Object.assign(base, { status: 'CLOSED_SOL_EXPIRED', score: 0 });
    if (!m.match) return Object.assign(base, { status: 'NO_CASE', score: 0 });
    if (n.barred) return Object.assign(base, { status: 'BARRED_NEGLIGENCE', score: 0 });
    var demand = Math.round(gross * n.factor);
    var pRecovery = 0.9 * n.factor;                       // recall match + liability share
    var urgency = s.days_left < 30 ? 3 : s.days_left < 90 ? 2 : 1;
    return Object.assign(base, { status: 'PURSUE', demand: demand, floor: Math.round(demand * G.FLOOR_PCT),
      p_recovery: Math.round(pRecovery * 100) / 100, urgency: urgency,
      score: Math.round(pRecovery * demand * urgency) });
  }
  function rank(assessed) {
    return assessed.slice().sort(function (a, b) {
      return (b.score - a.score) || String(a.claim_id).localeCompare(String(b.claim_id));
    });
  }
  function authorityTier(amount) {
    return amount <= G.AUTO_MAX ? 'AUTO' : amount <= G.SPECIALIST_MAX ? 'SPECIALIST' : 'MANAGER';
  }
  // Guardrail check on a counter proposed by the Negotiator agent. Script decides, not the agent.
  function checkCounter(st, proposed) {
    var v = [];
    if (st.round >= G.MAX_ROUNDS) v.push('MAX_ROUNDS');
    if (proposed < st.floor) v.push('BELOW_FLOOR');
    if (proposed > st.last_ask) v.push('ASK_INCREASED');
    var conc = st.last_ask - proposed;
    if (conc > 0 && conc < st.last_ask * G.MIN_CONCESSION_PCT && proposed !== st.floor) v.push('CONCESSION_TOO_SMALL');
    var fixed = Math.min(st.last_ask, Math.max(st.floor, proposed));
    if (v.indexOf('CONCESSION_TOO_SMALL') >= 0) fixed = Math.max(st.floor, Math.round(st.last_ask * (1 - G.MIN_CONCESSION_PCT)));
    return { ok: v.length === 0, violations: v, enforced: fixed };
  }
  // Accept/settle decision on a carrier offer.
  function evaluateOffer(st, offer) {
    var n = Number(offer);
    if (!isFinite(n) || n <= 0) return { action: 'IGNORE_INVALID' };
    if (n >= st.last_ask * (1 - G.MIN_CONCESSION_PCT)) return { action: 'ACCEPT', amount: n, tier: authorityTier(n) };
    if (st.round >= G.MAX_ROUNDS) return n >= st.floor ? { action: 'ACCEPT', amount: n, tier: authorityTier(n) } : { action: 'IMPASSE' };
    return { action: 'COUNTER' };
  }
  return { STATE_RULES: STATE_RULES, CAUSE_COMPONENT: CAUSE_COMPONENT, GUARDRAILS: G, sol: sol,
    negligence: negligence, recallMatch: recallMatch, assess: assess, rank: rank,
    authorityTier: authorityTier, checkCounter: checkCounter, evaluateOffer: evaluateOffer };
})();
if (typeof module !== 'undefined') module.exports = RD;
