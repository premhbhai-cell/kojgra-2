import { handler, couponPercent } from "./_lib.js";
export default handler(async ({ code }, sb) => { const pct = await couponPercent(sb, code); return pct > 0 ? { ok: true, code: String(code).trim().toUpperCase(), percent: pct } : { ok: false }; });
