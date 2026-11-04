#!/usr/bin/env python3
"""Build the storage-bucket JSON data layer (T7/T8). SYNTHETIC data only.
claims.json  : intake rows from data/claims.csv (numbers typed)
config.json  : kill switches and guardrails (mirrors rules/rules.js GUARDRAILS)
ledger.json  : append-only audit ledger, starts empty
"""
import csv, json, os
root = os.path.join(os.path.dirname(__file__), "..")
out = os.path.join(root, "data", "store"); os.makedirs(out, exist_ok=True)
NUM = {"paid_amount", "deductible", "insured_fault_pct"}
rows = []
for r in csv.DictReader(open(os.path.join(root, "data", "claims.csv"))):
    rows.append({k: (float(v) if k in NUM and v != "" else v) for k, v in r.items()})
for r in rows:
    for k in NUM:
        if isinstance(r.get(k), float) and r[k].is_integer(): r[k] = int(r[k])
claims = {"schema": "recovery-duel/claims@1", "synthetic": True, "count": len(rows), "claims": rows}
config = {"schema": "recovery-duel/config@1", "synthetic": True,
          "kill_switch": {"global": False, "negotiation": False, "outbound_email": False, "paused_states": []},
          "guardrails": {"MAX_ROUNDS": 5, "MIN_CONCESSION_PCT": 0.03, "FLOOR_PCT": 0.70, "AUTO_MAX": 5000, "SPECIALIST_MAX": 25000},
          "approval": {"escalate_after_hours": 24}}
ledger = {"schema": "recovery-duel/ledger@1", "synthetic": True, "entries": []}
for n, d in [("claims.json", claims), ("config.json", config), ("ledger.json", ledger)]:
    json.dump(d, open(os.path.join(out, n), "w"), indent=1)
print(f"claims {len(rows)}, config, ledger written to data/store/")
