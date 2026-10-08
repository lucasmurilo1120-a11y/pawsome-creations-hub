// Emisión de códigos para las páginas de códigos ("Con su carita" y "Pack familia").
//
// Cada página tiene un token propio (en la tabla plataformas solo está su hash).
// Un código: 6 letras/números, vale por `minutos_validez` (15) y se usa UNA vez.
//
// Dos modos por página (columna verificar_compra):
//  - false (simple): mientras no está el aviso de Hotmart. Se frena el abuso por
//    dispositivo: mientras haya un código vigente se devuelve el mismo, y un mismo
//    dispositivo no recibe otro si ya canjeó uno en 30 días. La página manda un id
//    de dispositivo (queda en su localStorage); sin él se usa la conexión (IP).
//    Por conexión el tope es más alto (5), porque en datos móviles muchas
//    personas comparten la misma IP (CGNAT) y no hay que bloquear a clientes reales.
//  - true (con compra): pide el e-mail de la compra y entrega tantos códigos como
//    unidades compradas (avisadas por el webhook de Hotmart en la tabla compras).

import { admin, aleatorio, sha256 } from "@/lib/carita.server";

export type ResultadoEmision =
  | { ok: true; codigo: string; expira: string; fotos: number; minutos: number; nombre: string }
  | { ok: false; error: "token" | "pide_email" | "sin_compra" | "agotado" | "ya_entregado" | "limite" | "fallo"; usado?: string | undefined };
// `usado`: el último código ya canjeado de ese dispositivo (o de esa compra), para que la
// página lo muestre: pegarlo de nuevo en la app recupera los personajes en otro navegador.

type Plataforma = { id: string; nombre: string; fotos: number; clave_hotmart: string; verificar_compra: boolean; minutos_validez: number };

const TOPE_POR_CONEXION = 5;

async function crearCodigo(p: Plataforma, ip: string, compraId: number | null, dispositivo: string | null = null) {
  const db = await admin();
  const expira = new Date(Date.now() + p.minutos_validez * 60_000).toISOString();
  for (let i = 0; i < 5; i++) {
    const codigo = aleatorio(6);
    const { error } = await db
      .from("codigos")
      .insert({ codigo, plataforma: p.id, fotos: p.fotos, expira, ip_hash: ip, compra_id: compraId, dispositivo });
    if (!error) return { codigo, expira };
  }
  return null;
}

export async function emitirCodigo(token: unknown, emailRaw: unknown, ip: string, dispositivoRaw?: unknown): Promise<ResultadoEmision> {
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
    if ((usados ?? 0) >= total) {
      const { data: ultimo } = await db
        .from("codigos")
        .select("codigo")
        .in("compra_id", ids)
        .not("usado_en", "is", null)
        .order("usado_en", { ascending: false })
        .limit(1)
        .maybeSingle();
      return { ok: false, error: "agotado", usado: (ultimo as { codigo: string } | null)?.codigo };
    }
    const nuevo = await crearCodigo(p, ip, ids[0]!);
    return nuevo ? listo(nuevo) : { ok: false, error: "fallo" };
  }

  // Modo simple.
  const disp =
    typeof dispositivoRaw === "string" && /^[a-zA-Z0-9-]{16,64}$/.test(dispositivoRaw) ? await sha256(`disp:${dispositivoRaw}`) : null;

  const pendienteQ = db
    .from("codigos")
    .select("codigo, expira")
    .eq("plataforma", p.id)
    .is("usado_en", null)
    .gt("expira", ahora)
    .order("expira", { ascending: false })
    .limit(1);
  const { data: pendiente } = await (disp ? pendienteQ.eq("dispositivo", disp) : pendienteQ.eq("ip_hash", ip)).maybeSingle();
  if (pendiente) return listo(pendiente as { codigo: string; expira: string });

  const hace30 = new Date(Date.now() - 30 * 24 * 60 * 60_000).toISOString();
  const canjeadosPor = async (col: "dispositivo" | "ip_hash", valor: string) => {
    const { count } = await db
      .from("codigos")
      .select("id", { count: "exact", head: true })
      .eq("plataforma", p.id)
      .eq(col, valor)
      .not("usado_en", "is", null)
      .gte("creado", hace30);
    return count ?? 0;
  };
  if (disp) {
    if ((await canjeadosPor("dispositivo", disp)) >= 1) {
      const { data: ultimo } = await db
        .from("codigos")
        .select("codigo")
        .eq("plataforma", p.id)
        .eq("dispositivo", disp)
        .not("usado_en", "is", null)
        .order("usado_en", { ascending: false })
        .limit(1)
        .maybeSingle();
      return { ok: false, error: "ya_entregado", usado: (ultimo as { codigo: string } | null)?.codigo };
    }
    if ((await canjeadosPor("ip_hash", ip)) >= TOPE_POR_CONEXION) return { ok: false, error: "ya_entregado" };
  } else if ((await canjeadosPor("ip_hash", ip)) >= 1) {
    return { ok: false, error: "ya_entregado" };
  }

  const nuevo = await crearCodigo(p, ip, null, disp);
  return nuevo ? listo(nuevo) : { ok: false, error: "fallo" };
}
