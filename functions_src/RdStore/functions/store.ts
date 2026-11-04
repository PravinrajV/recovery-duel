import { defineFunction, defineSchema, FunctionError, logger, type FunctionContext } from "@uipath/coded-functions-js-sdk";
import { UiPath } from "@uipath/uipath-typescript/core";
import { Buckets } from "@uipath/uipath-typescript/buckets";
import { BUCKET, appendEntry, type LedgerEntry } from "./_store.ts";

interface StoreInput {
  /** load = read claims.json + config.json; append = add one entry to ledger.json */
  op: "load" | "append";
  /** JSON string of a LedgerEntry, required for append */
  entryJson?: string;
  /** Injected by the Flow runtime when the step has an error handler; ignored. */
  errorHandlingEnabled?: boolean;
}

interface StoreOutput {
  ok: boolean;
  claimsJson: string;
  configJson: string;
  ledgerCount: number;
}

async function readText(b: Buckets, folderKey: string, path: string): Promise<string | null> {
  const u = await b.getReadUri({ name: BUCKET }, path, { folderKey });
  const headers: Record<string, string> = { ...(u.headers || {}) };
  const res = await fetch(u.uri, { method: u.httpMethod || "GET", headers, signal: AbortSignal.timeout(8000) });
  if (res.status === 404) return null;
  if (!res.ok) throw new FunctionError(`Read ${path} failed (${res.status})`, 502);
  return await res.text();
}

async function main(input: StoreInput, ctx: FunctionContext): Promise<StoreOutput> {
  const token = ctx.robot?.accessToken || process.env["UIPATH_ACCESS_TOKEN"] || "";
  if (!token) throw new FunctionError("Robot token unavailable", 500);
  if (!ctx.platform) throw new FunctionError("Platform context unavailable", 500);
  const { baseUrl, orgId, tenantId } = ctx.platform;
  // Bucket lives in the same folder the function is deployed to (runtime-provided, not caller input).
  const folderKey = ctx.platform.folderKey || process.env["RD_FOLDER_KEY"] || "";
  if (!folderKey) throw new FunctionError("Folder key unavailable", 500);
  const sdk = new UiPath({ baseUrl, orgName: orgId, tenantName: tenantId, secret: token });
  await sdk.initialize();
  const b = new Buckets(sdk);

  if (input.op === "load") {
    const claims = await readText(b, folderKey, "claims.json");
    const config = await readText(b, folderKey, "config.json");
    if (!claims || !config) throw new FunctionError("claims.json or config.json missing in bucket", 404);
    logger.info(`loaded claims ${claims.length}B config ${config.length}B`);
    return { ok: true, claimsJson: claims, configJson: config, ledgerCount: -1 };
  }
  if (input.op === "append") {
    if (!input.entryJson) throw new FunctionError("entryJson required", 400);
    const entry = JSON.parse(input.entryJson) as LedgerEntry;
    const current = await readText(b, folderKey, "ledger.json");
    const { doc, count } = appendEntry(current, entry);
    await b.uploadFile({ name: BUCKET }, "ledger.json", new TextEncoder().encode(JSON.stringify(doc, null, 1)), { folderKey });
    logger.info(`ledger now ${count} entries`);
    return { ok: true, claimsJson: "", configJson: "", ledgerCount: count };
  }
  throw new FunctionError(`unknown op ${input.op}`, 400);
}

export default defineFunction({
  name: "store",
  description: "Recovery Duel storage-bucket store: load claims/config, append to ledger. Synthetic data only.",
  input: defineSchema<StoreInput>(),
  output: defineSchema<StoreOutput>(),
  handler: main,
});
