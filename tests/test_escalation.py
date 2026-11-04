import sys, importlib.util
from datetime import datetime, timezone
spec = importlib.util.spec_from_file_location("e", "scripts/escalate_stale_approvals.py"); e = importlib.util.module_from_spec(spec); spec.loader.exec_module(e)
now = datetime(2026, 11, 5, 12, tzinfo=timezone.utc)
T = [
  {"Id": 1, "Title": "Recovery Duel: Specialist approval for SYNTHETIC settlement", "CreatedTime": "2026-11-04T11:00:00Z", "IsCompleted": False},
  {"Id": 2, "Title": "Recovery Duel: Specialist approval for SYNTHETIC settlement", "CreatedTime": "2026-11-04T13:00:00Z", "IsCompleted": False},
  {"Id": 3, "Title": "Recovery Duel: Specialist approval for SYNTHETIC settlement", "CreatedTime": "2026-11-01T00:00:00Z", "IsCompleted": True},
  {"Id": 4, "Title": "Other task", "CreatedTime": "2026-11-01T00:00:00Z", "IsCompleted": False},
  {"Id": 5, "Title": "Recovery Duel: Manager approval for SYNTHETIC settlement", "CreatedTime": "2026-11-01T00:00:00Z", "IsCompleted": False},
]
ids = [t["Id"] for t in e.stale(T, now, 24)]
assert ids == [1], ids
print("escalation tests: 1/1 pass")
