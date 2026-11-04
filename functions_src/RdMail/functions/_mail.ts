// Pure helpers for the Recovery Duel mail function (unit-tested offline).
// The ONLY address this function ever sends to. Not configurable by input, data or asset.
export const TEST_INBOX = "recoveryduel@vncntlabs.com";
export const SMTP = { host: "smtp.ionos.com", port: 587 } as const;
export const IMAP = { host: "imap.ionos.com", port: 993 } as const;
export const ASSET = "rd-mail"; // Orchestrator Credential asset (username + password), folder Default

const SUBJECT_OK = /^(Re: )?\[(SYNTHETIC \/ SIMULATED DEMO|SIMULATED CARRIER)\]/;

export function checkOutgoing(subject: string | undefined, body: string | undefined): string | null {
  if (!subject || !subject.trim()) return "subject required";
  if (!SUBJECT_OK.test(subject)) return "subject must carry the SYNTHETIC/SIMULATED label";
  if (!/CLM-\d{5}/.test(subject)) return "subject must carry a claim ID (CLM-#####)";
  if (!body || !body.trim()) return "body required";
  if (subject.length > 200 || body.length > 20000) return "message too long";
  return null;
}

export function claimIdOk(id: string | undefined): boolean {
  return !!id && /^CLM-\d{5}$/.test(id);
}

export interface Msg { uid: number; subject: string; from: string; date: string; text: string }

export function matchByClaim(list: Msg[], claimId: string): Msg[] {
  return list.filter((m) => String(m.subject || "").includes(claimId));
}
