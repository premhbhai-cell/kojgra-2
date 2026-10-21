import { handler, couponPercent, totals, MAX, isMobile, isPin, isEmail } from "./_lib.js";
export default handler(async (d, sb) => {
  const t = (s, a, b) => String(s ?? "").trim().length >= a && String(s ?? "").trim().length <= b;
  if (!Array.isArray(d.items) || !d.items.length || d.items.length > 30 || !t(d.fullName, 2, 80) || !isMobile(d.phone) || !isEmail(String(d.email).trim()) || !t(d.address, 5, 200) || !t(d.city, 2, 60) || !t(d.state, 2, 60) || !isPin(d.pincode) || d.paymentMethod !== "cod") throw new Error("bad");
  const items = d.items.map(i => ({ variantId: String(i.variantId), quantity: Math.floor(+i.quantity) })); if (items.some(i => !(i.quantity >= 1 && i.quantity <= MAX))) throw new Error("bad");
  const ids = [...new Set(items.map(i => i.variantId))];
  const { data: variants, error } = await sb.from("product_variants").select("id,label,sku,price,stock,product:products(name,status)").in("id", ids);
  if (error || !variants) return { ok: false, error: "Could not check stock. Please try again." };
  let subtotal = 0; const lines = [];
  for (const it of items) { const v = variants.find(x => x.id === it.variantId);
    if (!v || v.product?.status !== "published") return { ok: false, error: "A product in your cart is no longer available." };
    if (v.stock < it.quantity) return { ok: false, error: `Only ${v.stock} left of ${v.product.name} ${v.label}.` };
    subtotal += +v.price * it.quantity; lines.push({ variant_id: v.id, name: v.product.name, label: v.label, sku: v.sku, unit_price: +v.price, quantity: it.quantity, stock: v.stock }); }
  const pct = await couponPercent(sb, d.coupon); if (pct < 0) return { ok: false, error: "That promo code is not valid." };
  const { data: s } = await sb.from("site_settings").select("shipping_fee,free_shipping_above").eq("id", 1).single();
  const tt = totals(subtotal, pct, +(s?.shipping_fee ?? 49), +(s?.free_shipping_above ?? 499));
  const reserved = [];
  for (const l of lines) { const { data: upd } = await sb.from("product_variants").update({ stock: l.stock - l.quantity }).eq("id", l.variant_id).eq("stock", l.stock).select("id");
    if (!upd?.length) { for (const r of reserved) await sb.from("product_variants").update({ stock: r.stock }).eq("id", r.id); return { ok: false, error: "Stock just changed. Please review your cart and try again." }; }
    reserved.push({ id: l.variant_id, stock: l.stock }); }
  const orderNumber = "KJ" + Date.now().toString(36).toUpperCase() + Math.floor(Math.random() * 90 + 10);
  const { data: order, error: oErr } = await sb.from("orders").insert({ order_number: orderNumber, payment_method: "Cash on Delivery", payment_status: "Pending (pay on delivery)", full_name: d.fullName.trim(), phone: d.phone, email: d.email.trim(), address_line: d.address.trim(), landmark: (d.landmark || "").trim() || null, city: d.city.trim(), state: d.state.trim(), pincode: d.pincode, subtotal: tt.subtotal, discount: tt.discount, shipping: tt.shipping, total: tt.total, coupon_code: pct > 0 ? String(d.coupon).toUpperCase() : null }).select("id").single();
  if (oErr || !order) { for (const r of reserved) await sb.from("product_variants").update({ stock: r.stock }).eq("id", r.id); return { ok: false, error: "Could not place order. Please try again." }; }
  await sb.from("order_items").insert(lines.map(({ stock, ...l }) => ({ ...l, order_id: order.id })));
  return { ok: true, orderNumber, phone: d.phone };
});
