#!/usr/bin/env python3
"""T15 tenant scenario harness. SYNTHETIC data, SIMULATED carrier.
Runs each scenario with `uip maestro flow debug` (trigger input, so the bucket ledger is not touched),
completes the Specialist/Manager Quick Form task it creates with `uip tasks complete`,
and asserts the final state. Writes docs/runs/T15_<id>_debug.json and docs/runs/T15_RESULTS.md.
Usage: scripts/harness.py [S01 S02 ...]   (default: all)
"""
import json, subprocess, sys, time, threading, pathlib, csv, datetime
ROOT = pathlib.Path(__file__).resolve().parent.parent
FLOW = "solution/RecoveryDuel/RecoveryDuel"
SHARED = "4167c81e-9521-4d51-bbd5-4f126762bc9e"
RUNS = ROOT / "docs/runs"

def uip(*args, timeout=900):
    p = subprocess.run(["uip", *args, "--output", "json"], cwd=ROOT, capture_output=True, text=True, timeout=timeout)
    try: return json.loads(p.stdout)
    except Exception: return {"Result": "Error", "raw": (p.stdout + p.stderr)[-800:]}

def pending_tasks():
    d = uip("tasks", "list", "--folder-key", SHARED, "-l", "50").get("Data") or []
    return {t["Id"]: t for t in d if not t.get("IsCompleted") and "Recovery Duel" in (t.get("Title") or "")}

def claims_rows(ids):
    rows = {r["claim_id"]: r for r in csv.DictReader(open(ROOT / "data/claims.csv"))}
    return [rows[i] for i in ids]

def extract(data):
    els = data.get("variables", {}).get("elements", [])
    out = {"finalStatus": data.get("finalStatus"), "jobKey": data.get("jobKey"), "rank": None, "top": None,
           "neg": None, "approval": None, "stopped": None, "agents_ran": False}
    vars_ = {}
    for e in els:
        v = (e.get("inputs") or {}).get("args", {}).get("vars") or {}
        vars_.update({k: x for k, x in v.items() if x is not None})
        r = (e.get("outputs") or {}).get("response")
        eid = e["elementId"]
        if eid in ("evidenceAnalyst", "liabilityAssessor", "carrierAgent"): out["agents_ran"] = True
        if not isinstance(r, dict): continue
        if eid == "intake": out["stopped"] = r.get("stopped")
        if eid == "rank": out["rank"] = {a["claim_id"]: a.get("status") for a in r.get("ranked", [])}
        if eid == "pickTop": out["top"] = (r.get("assessment") or {}).get("claim_id") if r.get("found") else None
        if "negotiation" in r and isinstance(r["negotiation"], dict): out["neg"] = r["negotiation"]
        if eid == "approvalCtx": out["route"] = r.get("route")
    if out["neg"] is None and any(e["elementId"] == "noCaseEnd" for e in els):
        out["neg"] = {"status": "NO_CASE", "history": []}  # flow return on the no-case path (not in the debug trace)
    if out["neg"] is None and isinstance(vars_.get("negotiation"), dict): out["neg"] = vars_["negotiation"]
    out["approval"] = vars_.get("approval")
    return out

def run(sc, expected):
    inp = {"claims": claims_rows(sc["claims"]), "asOf": "2026-11-04", "killSwitch": bool(sc.get("killSwitch")),
           "counterparty": {"persona": sc["persona"], "reservation_price": sc["reservation"]},
           "source": "input", "runId": "T15-" + sc["id"]}
    f = ROOT / f"tests/inputs/T15_{sc['id']}.json"; f.write_text(json.dumps(inp))
    before = set(pending_tasks())
    res, done = {}, threading.Event()
    def go():
        res["r"] = uip("maestro", "flow", "debug", FLOW, "-i", "@" + str(f.relative_to(ROOT)), "--timeout", "1200", timeout=1300)
        done.set()
    threading.Thread(target=go, daemon=True).start()
    task_log = []
    while not done.wait(15):
        if not sc["expect"].get("approve"): continue
        for tid, t in pending_tasks().items():
            if tid in before or tid in [x[0] for x in task_log]: continue
            action = sc["expect"]["approve"]
            c = uip("tasks", "complete", str(tid), "--folder-key", SHARED, "--type", "QuickFormTask", "--action", action)
            task_log.append((tid, t.get("Title"), action, c.get("Result")))
    r = res.get("r", {})
    data = r.get("Data") or {}
    (RUNS / f"T15_{sc['id']}_debug.json").write_text(json.dumps(r, indent=1))
    got = extract(data) if data else {"finalStatus": "ERROR", "error": r.get("raw") or r.get("Message")}
    got["tasks"] = task_log
    return check(sc, expected, got), got

def check(sc, expected, got):
    e, fails = sc["expect"], []
    if got.get("finalStatus") != "Completed": return [f"run {got.get('finalStatus')} {got.get('error','')[:200]}"]
    for cid in sc["claims"]:
        want = expected[cid]["status"]; have = (got["rank"] or {}).get(cid)
        if got.get("stopped"): break
        if have != want: fails.append(f"{cid} rank {have} != rules {want}")
    if got["top"] != e["top"]: fails.append(f"top {got['top']} != {e['top']}")
    neg = got["neg"] or {}; st = neg.get("status")
    allowed = e.get("neg_in") or [e["neg"]]
    if st not in allowed: fails.append(f"neg {st} not in {allowed}")
    if e.get("stopped") and not got.get("stopped"): fails.append("kill switch did not stop intake")
    if e.get("stopped") and got.get("agents_ran"): fails.append("agents ran after kill switch")
    if e["top"] is None and got.get("agents_ran"): fails.append("agents ran on a no-case claim")
    if st == "SETTLED":
        amt, floor = neg.get("settled_amount") or neg.get("last_offer"), expected[e["top"]]["floor"]
        if amt is None or amt < floor: fails.append(f"settled {amt} below floor {floor}")
        if amt is not None and amt > sc["reservation"]: fails.append(f"settled {amt} above carrier limit {sc['reservation']}")
        if e.get("tier") and neg.get("tier") != e["tier"]: fails.append(f"tier {neg.get('tier')} != {e['tier']}")
        tier = neg.get("tier"); ap = got.get("approval") or {}
        want_dec = "APPROVED" if tier == "AUTO" or e.get("approve") == "Approve" else "REJECTED"
        if ap.get("decision") != want_dec: fails.append(f"approval {ap.get('decision')} != {want_dec}")
        if tier in ("SPECIALIST", "MANAGER") and not any(t[3] == "Success" for t in got["tasks"]): fails.append("no approval task completed")
    for h in neg.get("history", []):
        if h.get("from") == "SIMULATED_CARRIER" and not str(h.get("message", "")).startswith("[SIMULATED CARRIER]"):
            fails.append(f"carrier message r{h.get('round')} not labelled"); break
    return fails

def main():
    spec = json.load(open(ROOT / "tests/scenarios/scenarios.json"))["scenarios"]
    want = sys.argv[1:] or [s["id"] for s in spec]
    ids = sorted({c for s in spec for c in s["claims"]})
    expected = json.loads(subprocess.run(["node", "scripts/expected.mjs", *ids], cwd=ROOT, capture_output=True, text=True, check=True).stdout)
    resf = RUNS / "T15_results.json"
    results = json.loads(resf.read_text()) if resf.exists() else {}
    for sc in spec:
        if sc["id"] not in want: continue
        t0 = time.time(); fails, got = run(sc, expected)
        neg = got.get("neg") or {}
        results[sc["id"]] = {"pass": not fails, "fails": fails, "job": got.get("jobKey"), "neg": neg.get("status"),
            "rounds": neg.get("round"), "amount": neg.get("settled_amount") if neg.get("status") == "SETTLED" else None,
            "tier": neg.get("tier"), "approval": (got.get("approval") or {}).get("decision"), "top": got.get("top"),
            "rank": got.get("rank"), "stopped": got.get("stopped"), "tasks": got.get("tasks"),
            "partial": sc["expect"].get("partial"), "secs": round(time.time() - t0), "at": datetime.datetime.now().isoformat(timespec="seconds")}
        print(sc["id"], "PASS" if not fails else "FAIL", fails, flush=True)
        resf.write_text(json.dumps(results, indent=1))
    write_md(spec, results)

def write_md(spec, results):
    L = ["# T15 scenario results (tenant debug runs, SYNTHETIC data, SIMULATED carrier)", "",
         "| Scenario | Claims | Expected | Result | Rounds | Amount | Tier | Approval | Job | Pass |", "|---|---|---|---|---|---|---|---|---|---|"]
    for sc in spec:
        r = results.get(sc["id"])
        if not r: L.append(f"| {sc['id']} | {' '.join(sc['claims'])} | | not run | | | | | | |"); continue
        exp = "/".join(sc["expect"].get("neg_in") or [sc["expect"]["neg"]]) + (" (kill switch)" if sc.get("killSwitch") else "")
        L.append(f"| {sc['id']} | {' '.join(sc['claims'])} | {exp} | {r['neg']} | {r['rounds'] or ''} | {('$' + format(r['amount'], ',')) if r['amount'] else ''} | {r['tier'] or ''} | {r['approval'] or ''} | {(r['job'] or '')[:8]} | {'PASS' if r['pass'] else 'FAIL: ' + '; '.join(r['fails'])}{' (partial: ' + r['partial'] + ')' if r.get('partial') else ''} |")
    n = sum(1 for s in spec if results.get(s["id"], {}).get("pass"))
    L += ["", f"**{n}/{len(spec)} pass.** Rank status per claim is asserted against the offline rules engine (`scripts/expected.mjs`)."]
    (RUNS / "T15_RESULTS.md").write_text("\n".join(L) + "\n")
    print(f"{n}/{len(spec)} pass")

if __name__ == "__main__": main()
