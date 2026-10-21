import { handler, isEmail } from "./_lib.js";
export default handler(async ({ email, consent }, sb) => { if (!isEmail(String(email || "").trim()) || consent !== true) throw new Error("bad"); const { error } = await sb.from("newsletter_subscribers").upsert({ email: email.trim().toLowerCase(), consent: true }, { onConflict: "email" }); return { ok: !error }; });
