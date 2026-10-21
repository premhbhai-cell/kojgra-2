import { createClient } from "@supabase/supabase-js";
export const admin = () => createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
export const MAX = 10;
export const isMobile = s => /^[6-9]\d{9}$/.test(s), isPin = s => /^[1-9]\d{5}$/.test(s), isEmail = s => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
export const totals = (sub, pct, fee, free) => { const d = Math.round(sub * pct / 100), a = sub - d, sh = a <= 0 ? 0 : a >= free ? 0 : fee; return { subtotal: sub, discount: d, shipping: sh, total: a + sh }; };
export async function couponPercent(sb, code) { if (!code) return 0; const { data } = await sb.from("coupons").select("percent_off,active").eq("code", String(code).trim().toUpperCase()).maybeSingle(); return data?.active ? data.percent_off : -1; }
export const handler = fn => async (req, res) => { if (req.method !== "POST") return res.status(405).json({ ok: false }); try { res.json(await fn(req.body || {}, admin())); } catch (e) { console.error(e); res.status(400).json({ ok: false, error: "Invalid request." }); } };
