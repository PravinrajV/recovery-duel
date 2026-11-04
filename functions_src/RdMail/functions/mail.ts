import { simpleParser } from "mailparser";
import { defineFunction, defineSchema, FunctionError, logger, type FunctionContext } from "@uipath/coded-functions-js-sdk";
import nodemailer from "nodemailer";
import { ImapFlow } from "imapflow";
import { TEST_INBOX, SMTP, IMAP, ASSET, checkOutgoing, claimIdOk, matchByClaim, type Msg } from "./_mail.ts";

interface MailInput {
  /** send = SMTP one message to the test inbox; list = IMAP search INBOX by claim ID; probe = server greetings only */
  op: "send" | "list" | "probe";
  subject?: string;
  body?: string;
  claimId?: string;
  /** Injected by the Flow runtime when the step has an error handler; ignored. */
  errorHandlingEnabled?: boolean;
}

interface MailOutput {
  ok: boolean;
  to: string;
  messageId: string;
  count: number;
  messagesJson: string;
  detail: string;
}

async function creds(ctx: FunctionContext): Promise<{ user: string; pass: string }> {
  const token = ctx.robot?.accessToken || process.env["UIPATH_ACCESS_TOKEN"] || "";
  const robotKey = ctx.robot?.key || process.env["UIPATH_ROBOT_KEY"] || "";
  if (!token || !robotKey) throw new FunctionError("Robot token or key unavailable", 500);
  if (!ctx.platform) throw new FunctionError("Platform context unavailable", 500);
  const { baseUrl, orgId, tenantId, folderKey } = ctx.platform;
  if (!folderKey) throw new FunctionError("Folder key unavailable", 500);
  const url = new URL(`${orgId}/${tenantId}/orchestrator_/odata/Assets/UiPath.Server.Configuration.OData.GetRobotAssetByNameForRobotKey`, baseUrl.endsWith("/") ? baseUrl : baseUrl + "/").toString();
  const res = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", "X-UIPATH-FolderKey": folderKey },
    body: JSON.stringify({ assetName: ASSET, robotKey, supportsCredentialsProxyDisconnected: true }),
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new FunctionError(`Credential asset read failed (${res.status})`, 502);
  const a = await res.json() as { CredentialUsername?: string; CredentialPassword?: string };
  if (!a.CredentialUsername || !a.CredentialPassword) throw new FunctionError("Credential asset has no username/password", 502);
  return { user: a.CredentialUsername, pass: a.CredentialPassword };
}

const empty = (detail: string, ok = true): MailOutput => ({ ok, to: TEST_INBOX, messageId: "", count: 0, messagesJson: "[]", detail });

async function main(input: MailInput, ctx: FunctionContext): Promise<MailOutput> {
  if (input.op === "probe") {
    const t = nodemailer.createTransport({ host: SMTP.host, port: SMTP.port, secure: false, requireTLS: true, connectionTimeout: 10000, greetingTimeout: 10000 });
    let smtp = "";
    try { await t.verify(); smtp = "smtp ok (auth not tried)"; } catch (e) { smtp = "smtp: " + String((e as Error).message).slice(0, 200); }
    const c = new ImapFlow({ host: IMAP.host, port: IMAP.port, secure: true, logger: false, auth: { user: "probe@invalid", pass: "x" }, connectionTimeout: 10000 } as any);
    let imap = "";
    try { await c.connect(); imap = "imap connected"; } catch (e) { imap = "imap: " + String((e as Error).message).slice(0, 200); }
    try { await c.logout(); } catch { /* ignore */ }
    logger.info(`${smtp} | ${imap}`);
    return empty(`${smtp} | ${imap}`);
  }
  const { user, pass } = await creds(ctx);
  if (user.toLowerCase() !== TEST_INBOX) throw new FunctionError("Credential asset is not the test inbox", 400);

  if (input.op === "send") {
    const bad = checkOutgoing(input.subject, input.body);
    if (bad) throw new FunctionError(bad, 400);
    const t = nodemailer.createTransport({ host: SMTP.host, port: SMTP.port, secure: false, requireTLS: true, auth: { user, pass }, connectionTimeout: 15000, greetingTimeout: 15000, socketTimeout: 20000 });
    const info = await t.sendMail({ from: `Recovery Duel demo <${TEST_INBOX}>`, to: TEST_INBOX, subject: input.subject, text: input.body });
    logger.info(`sent ${info.messageId} accepted=${(info.accepted || []).length}`);
    return { ok: (info.accepted || []).length === 1, to: TEST_INBOX, messageId: String(info.messageId || ""), count: 1, messagesJson: "[]", detail: String(info.response || "").slice(0, 120) };
  }

  if (input.op === "list") {
    if (!claimIdOk(input.claimId)) throw new FunctionError("claimId must look like CLM-#####", 400);
    const c = new ImapFlow({ host: IMAP.host, port: IMAP.port, secure: true, logger: false, auth: { user, pass }, connectionTimeout: 15000 } as any);
    await c.connect();
    const out: Msg[] = [];
    const lock = await c.getMailboxLock("INBOX");
    try {
      const uids = (await c.search({ subject: input.claimId! }, { uid: true })) || [];
      const last = (uids as number[]).slice(-20);
      if (last.length) {
        for await (const m of c.fetch(last, { uid: true, envelope: true, source: true }, { uid: true })) {
          const p = m.source ? await simpleParser(m.source) : null;
          const subject = (p?.subject || m.envelope?.subject || "").replace(/\r?\n[ \t]*/g, " ");
          out.push({ uid: m.uid, subject, from: m.envelope?.from?.[0]?.address || "", date: m.envelope?.date ? new Date(m.envelope.date).toISOString() : "", text: String(p?.text || "").slice(0, 2000) });
        }
      }
    } finally { lock.release(); await c.logout(); }
    const matched = matchByClaim(out, input.claimId!);
    logger.info(`inbox matched ${matched.length} for ${input.claimId}`);
    return { ok: true, to: TEST_INBOX, messageId: "", count: matched.length, messagesJson: JSON.stringify(matched), detail: "" };
  }
  throw new FunctionError(`unknown op ${input.op}`, 400);
}

export default defineFunction({
  name: "mail",
  description: "Recovery Duel mail: SMTP send and IMAP read for the test inbox recoveryduel@vncntlabs.com only. Synthetic demo.",
  input: defineSchema<MailInput>(),
  output: defineSchema<MailOutput>(),
  handler: main,
});
