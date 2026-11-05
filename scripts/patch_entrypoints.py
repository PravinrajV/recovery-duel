#!/usr/bin/env python3
"""Post-compile patch: give every scheduled entry point a GUID entryPointId.

maestro-builder-sdk 1.205.0 writes a scheduled .entryPoint()'s node id ("nightly") as its entryPointId.
The solution feed rejects that on publish (HTTP 400, errorCode 1205, "No entry points defined for project").
The SDK already mints GUIDs for form triggers for the same reason; this does the same for schedules.
Run after every `uip maestro flow compile` (tests/run.sh does). Idempotent.
"""
import json, sys, uuid
from pathlib import Path
p = Path(sys.argv[1] if len(sys.argv) > 1 else Path(__file__).resolve().parents[1] / "solution/RecoveryDuel/RecoveryDuel/RecoveryDuel.flow")
d = json.loads(p.read_text()); n = 0
for node in d.get("nodes", []):
    inp = node.get("inputs") or {}
    if node.get("type") == "core.trigger.scheduled" and inp.get("entryPointId") == node["id"]:
        inp["entryPointId"] = str(uuid.uuid5(uuid.NAMESPACE_URL, f"{d.get('id')}:{node['id']}:entryPoint")); n += 1
if n: p.write_text(json.dumps(d, indent=2) + "\n")
print(f"patch_entrypoints: {n} patched")
