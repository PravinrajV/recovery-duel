#!/usr/bin/env python3
"""Complete the Action Center tasks an eval run of "Recovery Duel agents" creates (stand-in human).

Usage: scripts/eval_tasks.py <minutes>   polls every 15 s, acts only on open "Recovery Duel" tasks whose
claim id is in PLAN below, logs each completion to stdout. Same actions as tests/scenarios/scenarios.json.
"""
import json, subprocess, sys, time
SHARED = "4167c81e-9521-4d51-bbd5-4f126762bc9e"
PLAN = {  # claim -> (doc review action, settlement approval action)
    "CLM-00017": (None, "Approve"), "CLM-00005": ("Reject", "Reject"), "CLM-00011": ("Reject", "Approve"),
    "CLM-00015": ("Accept", None), "CLM-00003": (None, None),
}
def uip(*a):
    p = subprocess.run(["uip", *a, "--output", "json"], capture_output=True, text=True, timeout=300)
    try: return json.loads(p.stdout)
    except Exception: return {"Result": "Error", "raw": (p.stdout + p.stderr)[-500:]}
def claim_of(t):
    g = uip("tasks", "get", str(t["Id"]), "--task-type", "QuickFormTask", "--folder-key", SHARED).get("Data") or {}
    d = g.get("Data") or {}
    if isinstance(d, str):
        try: d = json.loads(d)
        except Exception: d = {}
    return d.get("claimid") or d.get("Claimid") or d.get("claimId")
end, done = time.time() + 60 * float(sys.argv[1] if len(sys.argv) > 1 else 30), set()
while time.time() < end:
    for t in uip("tasks", "list", "--folder-key", SHARED, "-l", "50").get("Data") or []:
        if t.get("IsCompleted") or t["Id"] in done or "Recovery Duel" not in (t.get("Title") or ""): continue
        c = claim_of(t)
        if c not in PLAN: continue
        act = PLAN[c][0] if "repair estimate" in t["Title"] else PLAN[c][1]
        if not act: continue
        r = uip("tasks", "complete", str(t["Id"]), "--folder-key", SHARED, "--type", "QuickFormTask", "--action", act)
        done.add(t["Id"]); print(time.strftime("%H:%M:%S"), t["Id"], c, t["Title"], act, r.get("Result"), flush=True)
    time.sleep(15)
