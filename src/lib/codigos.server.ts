// Emisión de códigos para las páginas de códigos ("Con su carita" y "Pack familia").
//
// Cada página tiene un token propio (en la tabla plataformas solo está su hash).
// Un código: 6 letras/números, vale por `minutos_validez` (15) y se usa UNA vez.
//
// Dos modos por página (columna verificar_compra):
//  - false (simple): mientras no está el aviso de Hotmart. Se frena el abuso por
//    dispositivo/conexión: mientras haya un código vigente se devuelve el mismo, y
//    una misma conexión no recibe un código nuevo si ya canjeó uno en 30 días.
//  - true (con compra): pide el e-mail de la compra y entrega tantos códigos como
//    unidades compradas (avisadas por el webhook de Hotmart en la tabla compras).

import { admin, aleatorio, sha256 } from "@/lib/carita.server";

export type ResultadoEmision =
  | { ok: true; codigo: string; expira: string; fotos: number; minutos: number; nombre: string }
  | { ok: false; error: "token" | "pide_email" | "sin_compra" | "agotado" | "ya_entregado" | "limite" | "fallo" };

type Plataforma = { id: string; nombre: string; fotos: number; clave_hotmart: string; verificar_compra: boolean; minutos_validez: number };

async function crearCodigo(p: Plataforma, ip: string, compraId: number | null) {
  const db = await admin();
  const expira = new Date(Date.now() + p.minutos_validez * 60_000).toISOString();
  for (let i = 0; i < 5; i++) {
    const codigo = aleatorio(6);
    const { error } = await db
      .from("codigos")
      .insert({ codigo, plataforma: p.id, fotos: p.fotos, expira, ip_hash: ip, compra_id: compraId });
    if (!error) return { codigo, expira };
  }
  return null;
}

export async function emitirCodigo(token: unknown, emailRaw: unknown, ip: string): Promise<ResultadoEmision> {
  if (typeof token !== "string" || token.length < 20) return { ok: false, error: "token" };
  const db = await admin();
  const { data: plat } = await db
    .from("plataformas")
    .select("id, nombre, fotos, clave_hotmart, verificar_compra, minutos_validez")
    .eq("token_hash", await sha256(token))
    .maybeSingle();
  const p = plat as Plataforma | null;
  if (!p) return { ok: false, error: "token" };

  const ahora = new Date().toISOString();
  const listo = (c: { codigo: string; expira: string }): ResultadoEmision => ({
    ok: true,
    codigo: c.codigo,
    expira: c.expira,
    fotos: p.fotos,
    minutos: p.minutos_validez,
    nombre: p.nombre,
  });

  // Freno general: no más de 20 pedidos por hora desde la misma conexión.
  const { count: pedidos } = await db
    .from("codigos")
    .select("id", { count: "exact", head: true })
    .eq("ip_hash", ip)
    .gte("creado", new Date(Date.now() - 60 * 60_000).toISOString());
  if ((pedidos ?? 0) >= 20) return { ok: false, error: "limite" };

  if (p.verificar_compra) {
    const email = typeof emailRaw === "string" ? emailRaw.trim().toLowerCase().slice(0, 255) : "";
    if (!email) return { ok: false, error: "pide_email" };
    const { data: compras } = await db
      .from("compras")
      .select("id, unidades")
      .ilike("email", email)
      .eq("clave", p.clave_hotmart)
      .eq("estado", "activo");
    const lista = (compras ?? []) as { id: number; unidades: number }[];
    if (!lista.length) return { ok: false, error: "sin_compra" };
    const ids = lista.map((c) => c.id);
    const total = lista.reduce((s, c) => s + (c.unidades || 1), 0);

    const { data: pendiente } = await db
      .from("codigos")
      .select("codigo, expira")
      .in("compra_id", ids)
      .is("usado_en", null)
      .gt("expira", ahora)
      .order("expira", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (pendiente) return listo(pendiente as { codigo: string; expira: string });

    const { count: usados } = await db
      .from("codigos")
      .select("id", { count: "exact", head: true })
      .in("compra_id", ids)
      .not("usado_en", "is", null);
    if ((usados ?? 0) >= total) return { ok: false, error: "agotado" };
    const nuevo = await crearCodigo(p, ip, ids[0]!);
    return nuevo ? listo(nuevo) : { ok: false, error: "fallo" };
  }

  // Modo simple.
  const { data: pendiente } = await db
    .from("codigos")
    .select("codigo, expira")
    .eq("plataforma", p.id)
    .eq("ip_hash", ip)
    .is("usado_en", null)
    .gt("expira", ahora)
    .order("expira", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (pendiente) return listo(pendiente as { codigo: string; expira: string });

  const { count: canjeados } = await db
    .from("codigos")
    .select("id", { count: "exact", head: true })
    .eq("plataforma", p.id)
    .eq("ip_hash", ip)
    .not("usado_en", "is", null)
    .gte("creado", new Date(Date.now() - 30 * 24 * 60 * 60_000).toISOString());
  if ((canjeados ?? 0) >= 1) return { ok: false, error: "ya_entregado" };

  const nuevo = await crearCodigo(p, ip, null);
  return nuevo ? listo(nuevo) : { ok: false, error: "fallo" };
}
