// Consulta una venta en la API de Hotmart por código de transacción (HP...).
// Es la red de seguridad del canje: si el aviso automático (webhook) no llegó,
// el app pregunta directo a Hotmart. Necesita las credenciales de
// Hotmart > Herramientas > Credenciales como secretos:
//   HOTMART_CLIENT_ID, HOTMART_CLIENT_SECRET, HOTMART_BASIC
// Sin esos secretos, simplemente no se usa.

export type VentaHotmart = { transaccion: string; productId: string; email: string; aprobada: boolean };

const APROBADA = new Set(["APPROVED", "COMPLETE"]);

export function hotmartApiConfigurada() {
  return Boolean(process.env["HOTMART_CLIENT_ID"] && process.env["HOTMART_CLIENT_SECRET"] && process.env["HOTMART_BASIC"]);
}

async function token(): Promise<string | null> {
  const id = process.env["HOTMART_CLIENT_ID"]!;
  const secret = process.env["HOTMART_CLIENT_SECRET"]!;
  const basic = process.env["HOTMART_BASIC"]!;
  const url = `https://api-sec-vlc.hotmart.com/security/oauth/token?grant_type=client_credentials&client_id=${encodeURIComponent(id)}&client_secret=${encodeURIComponent(secret)}`;
  const res = await fetch(url, { method: "POST", headers: { Authorization: `Basic ${basic}` } });
  if (!res.ok) return null;
  const json = (await res.json()) as { access_token?: string };
  return json.access_token ?? null;
}

export async function buscarVentaHotmart(transaccion: string): Promise<VentaHotmart | null> {
  if (!hotmartApiConfigurada()) return null;
  try {
    const t = await token();
    if (!t) return null;
    const res = await fetch(
      `https://developers.hotmart.com/payments/api/v1/sales/history?transaction=${encodeURIComponent(transaccion)}`,
      { headers: { Authorization: `Bearer ${t}`, "Content-Type": "application/json" } },
    );
    if (!res.ok) return null;
    const json = (await res.json()) as {
      items?: { product?: { id?: number | string }; buyer?: { email?: string }; purchase?: { transaction?: string; status?: string } }[];
    };
    const v = json.items?.find((i) => i.purchase?.transaction === transaccion);
    if (!v || v.product?.id == null || !v.buyer?.email) return null;
    return {
      transaccion,
      productId: String(v.product.id),
      email: v.buyer.email.trim().toLowerCase(),
      aprobada: APROBADA.has(v.purchase?.status ?? ""),
    };
  } catch (e) {
    console.error("[hotmart api]", e);
    return null;
  }
}
