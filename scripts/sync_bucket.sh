#!/usr/bin/env bash
# Upload data/store/*.json to the Orchestrator storage bucket recovery-duel-data (T7/T8).
# Usage: scripts/sync_bucket.sh <folder-key> <bucket-key>
set -euo pipefail
cd "$(dirname "$0")/.."
FOLDER=${1:?folder key}; BUCKET=${2:?bucket key}
python3 scripts/build_store.py
for f in claims config ledger; do
  uip or bucket-files upload "$BUCKET" "$f.json" --folder-key "$FOLDER" --file "data/store/$f.json" --content-type application/json --output json \
    | python3 -c "import json,sys; d=json.load(sys.stdin); print('$f.json', d['Result'], d.get('Message') or ''); sys.exit(0 if d['Result']=='Success' else 1)"
done
