import { createServerFn } from "@tanstack/react-start";
import { LOOKS, type LookKey } from "@/lib/kit";
import { MAX_INTENTOS_POR_FOTO } from "@/lib/papelitos-config";

// "Con su carita": el código de la página de códigos desbloquea personajes
// (1 con "Con su carita", 4 con el Pack familia). Cada personaje se crea con una
// foto, que se usa una sola vez y no se guarda: solo quedan los dibujos.
// No hay cuentas: el desbloqueo queda en un "acceso" con un token que el
// celular guarda (y que se puede abrir en otro dispositivo con su enlace).

export type Genero = "nino" | "nina";
export const looksCarita = (g: Genero): LookKey[] => LOOKS[g].filter((l) => l.key !== "ninguno").map((l) => l.key);
const TODOS_LOOKS: LookKey[] = [...new Set([...looksCarita("nino"), ...looksCarita("nina")])];

export type PersonajeCarita = {
  slot: number;
  nombre: string | null;
  genero: Genero;
  intentos: number;
  imagenes: Record<string, string>;
};

export type ErrorCanje = "formato" | "incorrecto" | "vencido" | "usado" | "demasiados" | "fallo";
export type ResultadoCanje = { ok: true; token: string; fotos: number; sumadas: number } | { ok: false; error: ErrorCanje };

export type ErrorCarita = "sin_acceso" | "limite" | "sin_credito" | "ocupado" | "rechazada" | "fallo" | "sin_base";
type Resultado = { ok: true } | { ok: false; error: ErrorCarita };

const MAX_FOTO_CHARS = 3_000_000; // ~2,2 MB en base64; el celular ya la achica a 768 px
const MAX_SLOT = 39;
const slotValido = (slot: unknown) => Number.isInteger(slot) && (slot as number) >= 0 && (slot as number) <= MAX_SLOT;

// --- ayudas -----------------------------------------------------------------

function errorDeIA(e: unknown): Resultado {
  const codigo = (e as { codigo?: string })?.codigo;
  if (codigo === "sin_credito" || codigo === "rechazada") return { ok: false, error: codigo };
  if (codigo === "limite") return { ok: false, error: "ocupado" };
  console.error("[carita]", e);
  return { ok: false, error: "fallo" };
}

// --- 1) Canjear el código ------------------------------------------------------

export const canjearCodigo = createServerFn({ method: "POST" })
  .inputValidator((d: { codigo: string; token?: string | null }) => ({
    codigo: String(d?.codigo ?? "").slice(0, 40),
    token: typeof d?.token === "string" ? d.token.slice(0, 80) : null,
  }))
  .handler(async ({ data }): Promise<ResultadoCanje> => {
    const s = await import("@/lib/carita.server");
    const db = await s.admin();
    const ip = await s.ipDelPedido();

    if ((await s.intentosRecientes(ip, "canje", 60)) >= 10) return { ok: false, error: "demasiados" };
    const fallo = async (error: ErrorCanje): Promise<ResultadoCanje> => {
      await s.registrarIntento(ip, "canje", false);
      await new Promise((r) => setTimeout(r, 400)); // frena pruebas automáticas
      return { ok: false, error };
    };

    const codigo = s.normalizarCodigo(data.codigo);
    if (!s.codigoValido(codigo)) return fallo("formato");

    const { data: fila } = await db
      .from("codigos")
      .select("id, fotos, expira, usado_en, acceso_id")
      .eq("codigo", codigo)
      .maybeSingle();
    const c = fila as { id: number; fotos: number; expira: string; usado_en: string | null; acceso_id: string | null } | null;
    if (!c) return fallo("incorrecto");

    let acceso = await s.accesoDeToken(data.token);
    if (c.usado_en) {
      // Mismo celular canjeando dos veces: no es error.
      if (acceso && c.acceso_id === acceso.id) return { ok: true, token: data.token!, fotos: acceso.fotos, sumadas: 0 };
      return fallo("usado");
    }
    if (new Date(c.expira).getTime() < Date.now()) return fallo("vencido");

    let token = data.token ?? "";
    if (!acceso) {
      token = s.aleatorio(40, "abcdefghijkmnpqrstuvwxyz23456789");
      const { data: nuevo, error } = await db
        .from("accesos")
        .insert({ token_hash: await s.sha256(token), fotos: 0 })
        .select("id, fotos")
        .single();
      if (error || !nuevo) return fallo("fallo");
      acceso = nuevo as { id: string; fotos: number };
    }

    // Marca el código como usado solo si sigue libre (dos personas al mismo tiempo: gana una).
    const { data: marcado } = await db
      .from("codigos")
      .update({ usado_en: new Date().toISOString(), acceso_id: acceso.id })
      .eq("id", c.id)
      .is("usado_en", null)
      .select("id")
      .maybeSingle();
    if (!marcado) return fallo("usado");

    const { data: total } = await db.rpc("sumar_fotos", { p_acceso: acceso.id, p_n: c.fotos });
    await s.registrarIntento(ip, "canje", true);
    return { ok: true, token, fotos: Number(total ?? acceso.fotos + c.fotos), sumadas: c.fotos };
  });

// --- 2) Estado del acceso (personajes desbloqueados y creados) ------------------

export const estadoCarita = createServerFn({ method: "POST" })
  .inputValidator((d: { token: string }) => ({ token: String(d?.token ?? "").slice(0, 80) }))
  .handler(async ({ data }): Promise<{ ok: true; fotos: number; personajes: PersonajeCarita[] } | { ok: false }> => {
    const s = await import("@/lib/carita.server");
    const acceso = await s.accesoDeToken(data.token);
    if (!acceso) return { ok: false };
    const db = await s.admin();
    const { data: filas } = await db
      .from("personajes_carita")
      .select("slot, nombre, genero, intentos, looks")
      .eq("acceso_id", acceso.id)
      .order("slot");
    const lista = (filas ?? []) as { slot: number; nombre: string | null; genero: Genero; intentos: number; looks: Record<string, string> }[];
    const url = await s.firmar(lista.flatMap((f) => Object.values(f.looks ?? {})));
    return {
      ok: true,
      fotos: acceso.fotos,
      personajes: lista.map((f) => ({
        slot: f.slot,
        nombre: f.nombre,
        genero: f.genero,
        intentos: f.intentos,
        imagenes: Object.fromEntries(Object.entries(f.looks ?? {}).flatMap(([k, p]) => (url.has(p) ? [[k, url.get(p)!]] : []))),
      })),
    };
  });

// --- 3) Foto -> personaje base (look normal) -----------------------------------

export const crearPersonajeBase = createServerFn({ method: "POST" })
  .inputValidator((d: { token: string; foto: string; genero: Genero; slot: number; nombre?: string }) => {
    if (typeof d?.foto !== "string" || !/^data:image\/(jpeg|png|webp);base64,/.test(d.foto) || d.foto.length > MAX_FOTO_CHARS) {
      throw new Error("Foto inválida");
    }
    if (d.genero !== "nino" && d.genero !== "nina") throw new Error("Estilo inválido");
    if (!slotValido(d.slot)) throw new Error("Lugar inválido");
    return { ...d, token: String(d.token ?? ""), nombre: typeof d.nombre === "string" ? d.nombre.trim().slice(0, 20) : "" };
  })
  .handler(async ({ data }): Promise<Resultado> => {
    const s = await import("@/lib/carita.server");
    const acceso = await s.accesoDeToken(data.token);
    if (!acceso || data.slot >= acceso.fotos) return { ok: false, error: "sin_acceso" };
    const db = await s.admin();
    const { data: fila } = await db
      .from("personajes_carita")
      .select("intentos")
      .eq("acceso_id", acceso.id)
      .eq("slot", data.slot)
      .maybeSingle();
    const intentos = (fila as { intentos: number } | null)?.intentos ?? 0;
    if (intentos >= MAX_INTENTOS_POR_FOTO) return { ok: false, error: "limite" };

    // El intento se cuenta antes de llamar a la IA (si falla a mitad, igual cuenta).
    await db.from("personajes_carita").upsert(
      { acceso_id: acceso.id, slot: data.slot, nombre: data.nombre || null, genero: data.genero, intentos: intentos + 1, actualizado: new Date().toISOString() },
      { onConflict: "acceso_id,slot" },
    );
    try {
      const { imagen } = await s.crearBaseDesdeFoto(data.foto, data.genero);
      const path = await s.guardarImagen(acceso.id, data.slot, "ninguno", imagen);
      // Una foto nueva reemplaza los looks anteriores de este personaje.
      await db
        .from("personajes_carita")
        .update({ looks: { ninguno: path }, genero: data.genero, nombre: data.nombre || null, actualizado: new Date().toISOString() })
        .eq("acceso_id", acceso.id)
        .eq("slot", data.slot);
      return { ok: true };
    } catch (e) {
      return errorDeIA(e);
    }
  });

// --- 4) Personaje base -> cada uno de sus 6 disfraces -------------------------------

export const crearLookCarita = createServerFn({ method: "POST" })
  .inputValidator((d: { token: string; slot: number; look: LookKey }) => {
    if (!slotValido(d?.slot)) throw new Error("Lugar inválido");
    if (!TODOS_LOOKS.includes(d?.look)) throw new Error("Look inválido");
    return { ...d, token: String(d.token ?? "") };
  })
  .handler(async ({ data }): Promise<Resultado> => {
    const s = await import("@/lib/carita.server");
    const acceso = await s.accesoDeToken(data.token);
    if (!acceso || data.slot >= acceso.fotos) return { ok: false, error: "sin_acceso" };
    const db = await s.admin();
    const { data: fila } = await db
      .from("personajes_carita")
      .select("genero, looks, looks_generados")
      .eq("acceso_id", acceso.id)
      .eq("slot", data.slot)
      .maybeSingle();
    const f = fila as { genero: Genero; looks: Record<string, string>; looks_generados: number } | null;
    const looks = f?.looks ?? {};
    if (!f || !looks["ninguno"]) return { ok: false, error: "sin_base" };
    if (!looksCarita(f.genero).includes(data.look)) return { ok: false, error: "fallo" };
    // Tope de costo: 6 looks por intento, con margen para reintentos.
    if (f.looks_generados >= 6 * MAX_INTENTOS_POR_FOTO * 2) return { ok: false, error: "limite" };

    try {
      const { generarImagen, urlADataUrl } = await import("@/lib/ia.server");
      const { data: firmada } = await db.storage.from("personajes").createSignedUrl(looks["ninguno"], 600);
      if (!firmada?.signedUrl) return { ok: false, error: "sin_base" };
      const base = await urlADataUrl(firmada.signedUrl);
      const disfraz = await urlADataUrl(s.referencia(f.genero, data.look));
      const imagen = await generarImagen(s.PROMPT_LOOK, [base, disfraz]);
      const path = await s.guardarImagen(acceso.id, data.slot, data.look, imagen);
      await db.rpc("guardar_look_carita", { p_acceso: acceso.id, p_slot: data.slot, p_look: data.look, p_path: path });
      return { ok: true };
    } catch (e) {
      return errorDeIA(e);
    }
  });

// --- 5) Borrar los dibujos de un personaje (los intentos usados no se devuelven) -------

export const borrarPersonajeCarita = createServerFn({ method: "POST" })
  .inputValidator((d: { token: string; slot: number }) => {
    if (!slotValido(d?.slot)) throw new Error("Lugar inválido");
    return { ...d, token: String(d.token ?? "") };
  })
  .handler(async ({ data }): Promise<{ ok: boolean }> => {
    const s = await import("@/lib/carita.server");
    const acceso = await s.accesoDeToken(data.token);
    if (!acceso) return { ok: false };
    const db = await s.admin();
    const archivos = ["ninguno", ...TODOS_LOOKS].map((l) => `${acceso.id}/${data.slot}/${l}.png`);
    await db.storage.from("personajes").remove(archivos);
    await db.from("personajes_carita").update({ looks: {} }).eq("acceso_id", acceso.id).eq("slot", data.slot);
    return { ok: true };
  });
