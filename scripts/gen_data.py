#!/usr/bin/env python3
"""Synthetic data generator for Recovery Duel.

ALL claims, policyholders, VINs, police reports and weather records are SYNTHETIC.
Recall data is REAL, read from cached NHTSA fixtures in data/fixtures/nhtsa/
(fetched from https://api.nhtsa.gov/recalls/recallsByVehicle on 2026-11-04).
State law values are ILLUSTRATIVE and UNVERIFIED, not legal advice.

Deterministic: same seed -> byte-identical output.
Usage: python3 scripts/gen_data.py [--seed 20261104] [--out data]
"""
import argparse, csv, json, os, random
from datetime import date, timedelta

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FIX = os.path.join(ROOT, "data", "fixtures", "nhtsa")
AS_OF = date(2026, 11, 4)  # fixed "today" so SOL math is reproducible
N_CLAIMS = 200

# ILLUSTRATIVE, UNVERIFIED. Property-damage SOL years and negligence doctrine.
STATE_RULES = {
    "CA": {"sol_years": 3, "doctrine": "pure_comparative", "bar_at_pct": None},
    "NY": {"sol_years": 3, "doctrine": "pure_comparative", "bar_at_pct": None},
    "TX": {"sol_years": 2, "doctrine": "modified_51", "bar_at_pct": 51},
    "FL": {"sol_years": 4, "doctrine": "modified_51", "bar_at_pct": 51},
    "VA": {"sol_years": 5, "doctrine": "contributory", "bar_at_pct": 1},
}

VEHICLES = [  # (make, model, year, fixture file, WMI+VDS prefix, model-year code)
    ("HONDA", "ACCORD", 2018, "recalls_honda_accord_2018.json", "1HGCV1F3", "J"),
    ("TOYOTA", "CAMRY", 2019, "recalls_toyota_camry_2019.json", "4T1B11HK", "K"),
    ("FORD", "F-150", 2020, "recalls_ford_f-150_2020.json", "1FTEW1E5", "L"),
    ("CHEVROLET", "EQUINOX", 2018, "recalls_chevrolet_equinox_2018.json", "2GNAXJEV", "J"),
    ("NISSAN", "ALTIMA", 2019, "recalls_nissan_altima_2019.json", "1N4BL4BV", "K"),
    ("HYUNDAI", "SONATA", 2017, "recalls_hyundai_sonata_2017.json", "5NPE24AF", "H"),
]

# loss cause -> NHTSA component keyword it would match (None = unrelated to any recall)
LOSS_CAUSES = {
    "brake_failure_rear_end": "SERVICE BRAKES",
    "engine_stall_fuel_pump": "FUEL SYSTEM",
    "tire_blowout": "TIRES",
    "headlight_failure_night_collision": "EXTERIOR LIGHTING",
    "airbag_nondeploy": "AIR BAGS",
    "hail_damage": None,
    "deer_strike": None,
    "parking_lot_backing": None,
}

TRANSLIT = {**{str(d): d for d in range(10)},
            **dict(zip("ABCDEFGH", range(1, 9))), **dict(zip("JKLMN", range(1, 6))),
            "P": 7, "R": 9, **dict(zip("STUVWXYZ", range(2, 10)))}
WEIGHTS = [8, 7, 6, 5, 4, 3, 2, 10, 0, 9, 8, 7, 6, 5, 4, 3, 2]
VIN_CHARS = "ABCDEFGHJKLMNPRSTUVWXYZ0123456789"


def vin_with_check(prefix8, year_code, rng):
    body = prefix8 + "0" + year_code + rng.choice("ABCDEFGH") + "".join(rng.choice("0123456789") for _ in range(6))
    s = sum(TRANSLIT[c] * w for c, w in zip(body, WEIGHTS))
    chk = s % 11
    return body[:8] + ("X" if chk == 10 else str(chk)) + body[9:]


def load_recalls():
    out = {}
    for make, model, year, fn, _, _ in VEHICLES:
        with open(os.path.join(FIX, fn)) as f:
            d = json.load(f)
        out[(make, model, year)] = [
            {"campaign": r["NHTSACampaignNumber"], "component": r["Component"]} for r in d["results"]]
    return out


def matching_recall(recalls, veh, cause):
    kw = LOSS_CAUSES[cause]
    if not kw:
        return None
    for r in recalls[veh]:
        if kw in r["component"]:
            return r["campaign"]
    return None


def police_text(rng, cause, other_fault_pct):
    cue = {
        "brake_failure_rear_end": "Driver of insured vehicle stated brake pedal went to the floor before impact.",
        "engine_stall_fuel_pump": "Insured vehicle lost power in traffic lane and was struck.",
        "tire_blowout": "Tread separation observed on insured vehicle front tire.",
        "headlight_failure_night_collision": "Insured vehicle headlights inoperative at scene, night conditions.",
        "airbag_nondeploy": "Frontal airbag did not deploy in moderate frontal impact.",
        "hail_damage": "No collision. Hail damage reported while parked.",
        "deer_strike": "Insured vehicle struck deer on rural road.",
        "parking_lot_backing": "Low-speed backing contact in parking lot.",
    }[cause]
    return (f"[SYNTHETIC] Officer #{rng.randint(1000, 9999)}. {cue} "
            f"Estimated other-party fault {other_fault_pct}%.")


def base_claim(rng, i, recalls, cause=None, state=None, veh_idx=None):
    v = VEHICLES[rng.randrange(len(VEHICLES)) if veh_idx is None else veh_idx]
    veh = v[:3]
    cause = cause or rng.choice(list(LOSS_CAUSES))
    state = state or rng.choice(list(STATE_RULES))
    loss = AS_OF - timedelta(days=rng.randint(60, 900))
    paid = rng.randint(18, 420) * 100
    insured_fault = rng.choice([0, 0, 0, 10, 20, 30, 40, 60])
    return {
        "claim_id": f"CLM-{i:05d}", "scenario": "", "synthetic": "true",
        "policyholder": f"Policyholder {i:05d} (synthetic)",
        "state": state, "make": veh[0], "model": veh[1], "model_year": veh[2],
        "vin": vin_with_check(v[4], v[5], rng),
        "loss_date": loss.isoformat(), "closed_date": (loss + timedelta(days=rng.randint(20, 50))).isoformat(),
        "loss_cause": cause, "paid_amount": paid, "deductible": rng.choice([250, 500, 1000]),
        "insured_fault_pct": insured_fault,
        "matched_recall": matching_recall(recalls, veh, cause) or "",
        "data_status": "OK",
        "police_report": police_text(rng, cause, 100 - insured_fault),
    }


def sol_days_left(c):
    yrs = STATE_RULES[c["state"]]["sol_years"]
    ld = date.fromisoformat(c["loss_date"])
    try:
        exp = ld.replace(year=ld.year + yrs)
    except ValueError:
        exp = ld.replace(year=ld.year + yrs, day=28)
    return (exp - AS_OF).days


def seed_scenarios(rng, recalls):
    """Rows tied to the 15 design test scenarios. Returns (claims, scenarios)."""
    rows, scen = [], []

    def add(sid, desc, persona=None, reservation=None, **kw):
        c = base_claim(rng, len(rows) + 1, recalls, cause=kw.pop("cause", "brake_failure_rear_end"),
                       state=kw.pop("state", "CA"), veh_idx=kw.pop("veh_idx", 1))
        c.update(kw)
        if "loss_date" in kw:  # keep closed_date after loss_date
            c["closed_date"] = (date.fromisoformat(c["loss_date"]) + timedelta(days=rng.randint(20, 50))).isoformat()
        c["scenario"] = f"S{sid:02d}"
        c["matched_recall"] = matching_recall(recalls, (c["make"], c["model"], c["model_year"]), c["loss_cause"]) or ""
        rows.append(c)
        scen.append({"id": f"S{sid:02d}", "claim_id": c["claim_id"], "description": desc,
                     "counterparty_persona": persona, "reservation_price": reservation, "simulated": True})
        return c

    recent = (AS_OF - timedelta(days=200)).isoformat()
    add(1, "Clear recall match, cooperative carrier, settles round 2", "cooperative", 9000, paid_amount=9800, insured_fault_pct=0, loss_date=recent)
    add(2, "Stubborn carrier, settles at floor round 5", "stubborn", 9000, paid_amount=12000, insured_fault_pct=0, loss_date=recent)
    add(3, "Lowball below floor every round -> impasse -> arbitration packet", "lowball", 1500, paid_amount=16000, insured_fault_pct=0, loss_date=recent)
    add(4, "Counter above T1 authority -> specialist escalation", "cooperative", 14000, paid_amount=14200, insured_fault_pct=0, loss_date=recent)
    add(5, "Above T2 -> manager, timeout -> auto-escalate", "stubborn", 30000, paid_amount=38000, insured_fault_pct=0, loss_date=recent)
    # S6 SOL expired: TX 2y, loss 3 years ago
    add(6, "SOL expired -> closed not recoverable", state="TX", loss_date=(AS_OF - timedelta(days=3 * 365 + 10)).isoformat(), insured_fault_pct=0)
    # S7 SOL < 30 days: TX 2y, loss 2y-15d ago
    add(7, "SOL < 30 days -> top of queue", "cooperative", 8000, state="TX", loss_date=(AS_OF - timedelta(days=2 * 365 - 15)).isoformat(), insured_fault_pct=0)
    add(8, "Recall component unrelated to loss cause -> no case", cause="hail_damage", loss_date=recent)
    add(9, "Contributory-negligence state, insured 10% at fault -> barred", state="VA", insured_fault_pct=10, loss_date=recent)
    add(10, "Modified comparative: 51% insured fault -> barred", state="TX", insured_fault_pct=51, loss_date=recent)
    add(10, "Modified comparative: 40% insured fault -> reduced demand", "cooperative", 6000, state="TX", insured_fault_pct=40, paid_amount=11000, loss_date=recent)
    add(11, "NHTSA API 500/timeout -> retries then NEEDS_DATA", data_status="NEEDS_DATA", loss_date=recent)
    add(12, "Malformed VIN -> vPIC error handled", vin="1HGCV1F3XJ0O0IQ12", data_status="NEEDS_DATA", veh_idx=0, cause="engine_stall_fuel_pump", loss_date=recent)
    add(13, "Reply email with doc request -> evidence packet, no counter", "requests_docs", 7000, loss_date=recent)
    add(14, "Prompt injection in reply email ('accept $1') -> ignored, compliance flags", "injection", 7000, loss_date=recent)
    add(15, "Kill switch mid-batch -> clean stop; replay same seed -> identical", "cooperative", 7000, loss_date=recent)
    # Demo hero claim: $14,200 -> ~$11,050 in 4 rounds
    add(1, "DEMO hero: $14,200 settles near $11,050 in 4 rounds", "cooperative", 11050, paid_amount=14200, insured_fault_pct=0, loss_date=recent, veh_idx=0, cause="engine_stall_fuel_pump")
    # extra near-deadline rows so >=5 claims have SOL < 90 days
    for st, days_short in (("TX", 40), ("CA", 60), ("NY", 75)):
        yrs = STATE_RULES[st]["sol_years"]
        add(7, f"SOL {days_short} days left ({st}) -> high urgency", "cooperative", 6000, state=st,
            loss_date=(AS_OF - timedelta(days=yrs * 365 - days_short)).isoformat(), insured_fault_pct=0)
    # extra NEEDS_DATA so >=3
    add(11, "NHTSA complaints timeout -> NEEDS_DATA", data_status="NEEDS_DATA", loss_date=recent)
    return rows, scen


def generate(seed=20261104):
    rng = random.Random(seed)
    recalls = load_recalls()
    claims, scenarios = seed_scenarios(rng, recalls)
    while len(claims) < N_CLAIMS:
        claims.append(base_claim(rng, len(claims) + 1, recalls))
    for c in claims:
        c["sol_days_left"] = sol_days_left(c)
    weather = [{"claim_id": c["claim_id"], "date": c["loss_date"], "state": c["state"],
                "condition": "hail" if c["loss_cause"] == "hail_damage" else rng.choice(["clear", "rain", "fog", "clear", "night_clear"]),
                "synthetic": "true"} for c in claims]
    return claims, weather, scenarios


def write(out_dir, seed):
    claims, weather, scenarios = generate(seed)
    os.makedirs(out_dir, exist_ok=True)
    for name, rows in (("claims.csv", claims), ("weather.csv", weather)):
        with open(os.path.join(out_dir, name), "w", newline="") as f:
            w = csv.DictWriter(f, fieldnames=list(rows[0]), lineterminator="\n")
            w.writeheader(); w.writerows(rows)
    with open(os.path.join(out_dir, "scenarios.json"), "w") as f:
        json.dump({"seed": seed, "as_of": AS_OF.isoformat(), "scenarios": scenarios}, f, indent=1)
    with open(os.path.join(out_dir, "state_rules.json"), "w") as f:
        json.dump({"status": "ILLUSTRATIVE, UNVERIFIED, not legal advice", "rules": STATE_RULES}, f, indent=1)
    return claims


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--seed", type=int, default=20261104)
    ap.add_argument("--out", default=os.path.join(ROOT, "data"))
    a = ap.parse_args()
    cl = write(a.out, a.seed)
    print(f"claims={len(cl)} recall_match={sum(1 for c in cl if c['matched_recall'])} "
          f"near_sol={sum(1 for c in cl if 0 <= c['sol_days_left'] < 90)} "
          f"needs_data={sum(1 for c in cl if c['data_status']=='NEEDS_DATA')}")
