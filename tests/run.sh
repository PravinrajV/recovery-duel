#!/usr/bin/env bash
# Offline checks: data generator tests + Flow validate. No tenant login needed.
set -euo pipefail
cd "$(dirname "$0")/.."
python3 tests/test_gen_data.py
node --test tests/test_rules.mjs
( cd solution/RecoveryDuel/RecoveryDuel && uip maestro flow check .flow-sdk/RecoveryDuel.flow.ts --source --output json | python3 -c 'import json,sys; d=json.load(sys.stdin)["Data"]; print("flow check:", d["Errors"], "errors", d["Warnings"], "warnings"); sys.exit(0 if d["Errors"]+d["Warnings"]==0 else 1)' \
  && uip maestro flow compile .flow-sdk/RecoveryDuel.flow.ts -o RecoveryDuel.flow --output json >/dev/null )
uip maestro flow validate solution/RecoveryDuel/RecoveryDuel/RecoveryDuel.flow --output json | python3 -c 'import json,sys; d=json.load(sys.stdin); s=d["Data"]["Status"]; print("flow validate:", s); sys.exit(0 if s=="Valid" else 1)'
