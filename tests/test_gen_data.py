import csv, hashlib, json, os, subprocess, sys, tempfile, unittest
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "scripts"))
import gen_data as g


def run(out):
    subprocess.run([sys.executable, os.path.join(ROOT, "scripts", "gen_data.py"), "--out", out], check=True, capture_output=True)
    return {f: hashlib.sha256(open(os.path.join(out, f), "rb").read()).hexdigest() for f in sorted(os.listdir(out))}


class GenDataTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.claims, cls.weather, cls.scen = g.generate()

    def test_deterministic(self):
        with tempfile.TemporaryDirectory() as a, tempfile.TemporaryDirectory() as b:
            self.assertEqual(run(a), run(b))

    def test_committed_data_matches_generator(self):
        with tempfile.TemporaryDirectory() as a:
            fresh = run(a)
        for f, h in fresh.items():
            self.assertEqual(h, hashlib.sha256(open(os.path.join(ROOT, "data", f), "rb").read()).hexdigest(), f)

    def test_counts(self):
        c = self.claims
        self.assertEqual(len(c), 200)
        self.assertGreaterEqual(sum(1 for x in c if x["matched_recall"]), 20)
        self.assertGreaterEqual(sum(1 for x in c if 0 <= x["sol_days_left"] < 90), 5)
        self.assertGreaterEqual(sum(1 for x in c if x["data_status"] == "NEEDS_DATA"), 3)
        self.assertTrue(all(x["synthetic"] == "true" for x in c))

    def test_all_15_scenarios_seeded(self):
        ids = {s["id"] for s in self.scen}
        self.assertEqual(ids, {f"S{i:02d}" for i in range(1, 16)})
        self.assertTrue(all(s["simulated"] for s in self.scen))

    def test_recalls_are_real_fixture_ids(self):
        real = {r["campaign"] for v in g.load_recalls().values() for r in v}
        for x in self.claims:
            if x["matched_recall"]:
                self.assertIn(x["matched_recall"], real)

    def test_scenario_specifics(self):
        by = {}
        for x in self.claims:
            if x["scenario"]:
                by.setdefault(x["scenario"], x)  # first row per scenario is the primary one
        self.assertLess(by["S06"]["sol_days_left"], 0)
        self.assertTrue(0 <= by["S07"]["sol_days_left"] < 30)
        self.assertEqual(by["S08"]["matched_recall"], "")
        self.assertEqual(by["S09"]["state"], "VA")
        self.assertNotEqual(len(by["S12"]["vin"].replace("O", "").replace("I", "").replace("Q", "")), 17)
        hero = [x for x in self.claims if x["paid_amount"] == 14200 and x["matched_recall"]]
        self.assertTrue(hero)

    def test_dates_consistent(self):
        for x in self.claims:
            self.assertLess(x["loss_date"], x["closed_date"])
            self.assertLess(x["loss_date"], g.AS_OF.isoformat())

    def test_valid_vin_check_digits(self):
        for x in self.claims:
            if x["scenario"] == "S12":
                continue
            v = x["vin"]
            self.assertEqual(len(v), 17)
            chk = sum(g.TRANSLIT[ch] * w for i, (ch, w) in enumerate(zip(v, g.WEIGHTS)) if i != 8) % 11
            self.assertEqual(v[8], "X" if chk == 10 else str(chk))


if __name__ == "__main__":
    unittest.main()
