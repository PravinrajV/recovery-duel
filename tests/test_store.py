import json, subprocess, re
subprocess.run(["python3", "scripts/build_store.py"], check=True, capture_output=True)
c = json.load(open("data/store/claims.json")); g = json.load(open("data/store/config.json")); l = json.load(open("data/store/ledger.json"))
assert c["synthetic"] and c["count"] == len(c["claims"]) == 200
assert all(isinstance(r["paid_amount"], (int, float)) for r in c["claims"])
src = open("rules/rules.js").read()
G = dict((k, float(v)) for k, v in re.findall(r"(\w+): ([\d.]+)", re.search(r"var G = \{([^}]*)\}", src).group(1)))
assert all(float(g["guardrails"][k]) == v for k, v in G.items()), "config guardrails drift from rules.js"
assert g["kill_switch"]["global"] is False and l["entries"] == []
print("store tests: 3/3 pass")
