#!/usr/bin/env bash
# Offline checks: data generator tests + Flow validate. No tenant login needed.
set -euo pipefail
cd "$(dirname "$0")/.."
python3 tests/test_gen_data.py
uip maestro flow validate solution/RecoveryDuel/RecoveryDuel/RecoveryDuel.flow --output json | python3 -c 'import json,sys; d=json.load(sys.stdin); s=d["Data"]["Status"]; print("flow validate:", s); sys.exit(0 if s=="Valid" else 1)'
