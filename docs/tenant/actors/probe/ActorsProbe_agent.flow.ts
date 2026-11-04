import { flow, summarize, script, inlineAgent, out, err, js, tmpl, types } from '@uipath/maestro-builder-sdk';
export default flow("0cc81aa7-8d7c-4275-9eab-874e17940161")
  .name('ActorsProbe')
  .input({ estimateFile: types.file, claimId: types.string, vin: types.string, expectedTotal: types.number })
  .output({ extracted: types.object, validation: types.object, raw: types.string })
  .step('readEstimate', inlineAgent({
    model: 'anthropic.claude-sonnet-4-6', temperature: 0, maxIterations: 4,
    systemPrompt: 'You read SYNTHETIC repair estimates. Use the analyze files tool on the provided file. Copy values exactly as printed; never invent. Return a result conforming to the output schema. text: lines CLAIM_ID: <v>; VIN: <v>; ESTIMATE_NO: <v>; LOSS_CAUSE: <v>; PARTS: <number>; LABOR: <number>; TOTAL: <number> (numbers without $ or commas, UNKNOWN if absent). confidence: 0 to 1, how sure you are every value was read from the page.',
    userPrompt: 'Extract the fields from this file: {{input.estimate}}',
    inputs: { estimate: out('start', 'estimateFile') },
    returns: { text: 'string', confidence: 'number' },
    tools: [{ kind: 'builtin', tool: 'analyzefiles' }],
  }))
  .onError((h) => h.return({ extracted: js`({})`, validation: js`({ status: "EXTRACT_ERROR" })`, raw: tmpl`${err('readEstimate', 'detail')}` }))
  .step('validate', script({ code: `
    const t = String($vars.readEstimate.output.text || '');
    const f = {};
    for (const line of t.split(/[\\n;]+/)) { const m = line.match(/^\\s*([A-Z_]+)\\s*:\\s*(.+?)\\s*$/); if (m) f[m[1]] = m[2]; }
    const num = (x) => Number(String(x || '').replace(/[$,]/g, ''));
    const s = $vars.start.output;
    const checks = {
      claim_id_match: f.CLAIM_ID === s.claimId,
      vin_match: f.VIN === s.vin,
      total_parses: Number.isFinite(num(f.TOTAL)),
      total_within_5pct: Math.abs(num(f.TOTAL) - s.expectedTotal) <= 0.05 * s.expectedTotal,
    };
    const ok = Object.values(checks).every(Boolean);
    return { fields: f, checks, status: ok ? 'VALIDATED' : 'NEEDS_HUMAN_VALIDATION' };
  `, returns: 'object' }))
  .return({ extracted: js`$vars.validate.output.fields`, validation: js`$vars.validate.output`, raw: js`String($vars.readEstimate.output.text || '')` })
  .build();
