import { handler } from "./_lib.js";
export default handler(async ({ orderNumber, phone }, sb) => {
  if (!orderNumber || String(phone).length !== 10) return null;
  const { data } = await sb.from("orders").select("order_number,status,payment_method,payment_status,full_name,address_line,landmark,city,state,pincode,subtotal,discount,shipping,total,created_at,items:order_items(name,label,unit_price,quantity)").eq("order_number", String(orderNumber).trim().toUpperCase()).eq("phone", String(phone)).maybeSingle();
  return data ?? null;
});
