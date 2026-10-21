import { handler, isEmail } from "./_lib.js";
export default handler(async ({ name, email, message }, sb) => {
  name = String(name || "").trim(); email = String(email || "").trim(); message = String(message || "").trim();
  if (name.length < 2 || !isEmail(email) || message.length < 10 || message.length > 2000) throw new Error("bad");
  const since = new Date(Date.now() - 10 * 60000).toISOString();
  const { count } = await sb.from("contact_messages").select("id", { count: "exact", head: true }).eq("email", email).gte("created_at", since);
  if ((count ?? 0) >= 3) return { ok: false, error: "Too many messages. Please try again later." };
  const { error } = await sb.from("contact_messages").insert({ name, email, message });
  return { ok: !error, error: error ? "Could not send. Please try again." : undefined };
});
