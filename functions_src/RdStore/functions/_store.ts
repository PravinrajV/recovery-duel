// Pure helpers for the Recovery Duel bucket store (unit-tested offline).
export const BUCKET = "recovery-duel-data";


export interface LedgerEntry {
  run_id: string;
  claim_id: string;
  status: string;
  amount: number;
  tier: string;
  approval: string;
  rounds: number;
  at: string;
}

export interface LedgerDoc { schema: string; synthetic: boolean; entries: LedgerEntry[] }

export function appendEntry(ledgerText: string | null, entry: LedgerEntry): { doc: LedgerDoc; count: number; added: boolean } {
  let doc: LedgerDoc = { schema: "recovery-duel/ledger@1", synthetic: true, entries: [] };
  if (ledgerText && ledgerText.trim()) {
    const parsed = JSON.parse(ledgerText);
    if (Array.isArray(parsed)) doc.entries = parsed;
    else doc = { ...doc, ...parsed, entries: Array.isArray(parsed.entries) ? parsed.entries : [] };
  }
  if (!entry.run_id || !entry.claim_id) throw new Error("entry needs run_id and claim_id");
  if (doc.entries.some((e) => e.run_id === entry.run_id && e.claim_id === entry.claim_id)) {
    return { doc, count: doc.entries.length, added: false }; // idempotent on retry
  }
  doc.entries.push(entry);
  return { doc, count: doc.entries.length, added: true };
}
