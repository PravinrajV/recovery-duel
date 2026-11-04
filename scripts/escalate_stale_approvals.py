#!/usr/bin/env python3
"""24h escalation check for Recovery Duel approval tasks.

The Flow Quick Form has no timeout setting (docs/TENANT_CHECK.md), so this runs on a
schedule (cron or an Orchestrator trigger) and escalates stale Specialist tasks.
Dry run by default. --apply labels the task "escalated" and, if --manager is
given, reassigns it to the manager. Uses only the `uip tasks` CLI.
"""
import argparse, json, subprocess, sys
from datetime import datetime, timezone, timedelta

def uip(*args):
    r = subprocess.run(["uip", *args, "--output", "json"], capture_output=True, text=True)
    out = json.loads(r.stdout or "{}")
    if out.get("Result") != "Success":
        sys.exit(f"uip {' '.join(args[:2])} failed: {out.get('Message')}")
    return out.get("Data")

def stale(tasks, now, hours):
    for t in tasks:
        if t.get("IsCompleted") or t.get("IsDeleted"):
            continue
        if not str(t.get("Title", "")).startswith("Recovery Duel: Specialist approval"):
            continue
        created = datetime.fromisoformat(str(t["CreatedTime"]).replace("Z", "+00:00"))
        if now - created >= timedelta(hours=hours):
            yield t

def main():
    p = argparse.ArgumentParser()
    p.add_argument("--folder-key", required=True)
    p.add_argument("--hours", type=float, default=24)
    p.add_argument("--manager", help="manager email to reassign to")
    p.add_argument("--apply", action="store_true")
    p.add_argument("--now", help="ISO time override for testing")
    a = p.parse_args()
    now = datetime.fromisoformat(a.now.replace("Z", "+00:00")) if a.now else datetime.now(timezone.utc)
    data = uip("tasks", "list", "--folder-key", a.folder_key)
    tasks = data if isinstance(data, list) else data.get("value", [])
    hits = list(stale(tasks, now, a.hours))
    for t in hits:
        print(f"ESCALATE task {t['Id']} created {t['CreatedTime']}" + ("" if a.apply else " (dry run)"))
        if a.apply:
            label = json.dumps([{"name": "escalation", "displayName": "Escalation", "displayValue": "Manager, over 24h"}])
            uip("tasks", "labels", str(t["Id"]), "--folder-key", a.folder_key, "--labels", label)
            if a.manager:
                uip("tasks", "reassign", str(t["Id"]), "--user", a.manager)
    print(f"{len(hits)} task(s) over {a.hours}h")

if __name__ == "__main__":
    main()
