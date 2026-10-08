import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { LOOKS, type LookKey } from "@/lib/kit";
import { MAX_INTENTOS_POR_FOTO } from "@/lib/papelitos-config";

// Personajes "Con su carita". Cada foto comprada es un "slot" (0, 1, 2...):
// "Con su carita" da 1 foto y el Pack familia suma 4. La foto se usa una sola vez
// para crear el personaje base y se descarta (nunca se guarda); solo quedan los dibujos.

export type Genero = "nino" | "nina";
export type LookCarita = LookKey;
// Un personaje con carita lleva los 6 disfraces del estilo elegido (los mismos
// looks del Niño o de la Niña del kit), además de su look normal.
export const looksCarita = (g: Genero): LookKey[] => LOOKS[g].filter((l) => l.key !== "ninguno").map((l) => l.key);
const TODOS_LOOKS_CARITA: LookKey[] = [...new Set([...looksCarita("nino"), ...looksCarita("nina")])];

type Resultado =
  | { ok: true; path: string }
  | { ok: false; error: "sin_compra" | "limite" | "sin_credito" | "ocupado" | "rechazada" | "fallo" | "sin_base" };

const MAX_FOTO_CHARS = 3_000_000; // ~2,2 MB en base64; el app ya la achica a 768 px
const MAX_SLOT = 19;

const PROMPT_BASE =
  "Create a full-body character for a children's paper-doll kit, based on the person in the FIRST image (a photo). " +
  "Draw it in EXACTLY the same illustration style as the SECOND image: same proportions (big head, big expressive eyes, small body), " +
  "same clean outline, same soft shading and color palette, same front-facing standing pose with arms slightly open, " +
  "plain white background and nothing else in the image. Keep the person's real features so the family recognizes them: " +
  "hair color, hair length and texture, face shape, eye color, skin tone, glasses and beard if any. " +
  "Clothing exactly like the SECOND image. No text.";

const PROMPT_LOOK =
  "Dress the character from the FIRST image in the costume shown in the SECOND image. " +
  "Keep the character's face, hair, skin tone and proportions exactly as in the FIRST image, and keep the same illustration style, " +
  "front-facing standing pose and plain white background. Copy the costume, accessories and colors from the SECOND image. No text.";

async function aDataUrl(url: string): Promise<string> {
  const res = await fetch(url);
  if (!res.ok) return url;
  const tipo = res.headers.get("content-type") ?? "image/webp";
  const buf = new Uint8Array(await res.arrayBuffer());
  let bin = "";
  for (let i = 0; i < buf.length; i++) bin += String.fromCharCode(buf[i]!);
  return `data:${tipo};base64,${btoa(bin)}`;
}

// Ilustraciones de referencia (estilo y disfraces). APP_ORIGIN fija el dominio del app;
// si no está definido, se usa el del pedido solo si es https.
function referencia(genero: Genero, look: "base" | LookKey) {
  const fijo = process.env["APP_ORIGIN"];
  const delPedido = new URL(getRequest().url);
  const origin = fijo ?? (delPedido.protocol === "https:" ? delPedido.origin : "");
  if (!origin) throw new Error("Origen del app no configurado");
  return `${origin}/personajes/${genero}-${look}.webp`;
}

// Cuántas fotos tiene esta cuenta: solo las compras que canjeó con su código (HP...).
async function fotosCompradas(supabase: { from: (t: string) => any }, uid: string): Promise<number> {
  const { data } = await supabase.from("compras").select("clave, fotos, canjeado_por").eq("estado", "activo");
  if (!Array.isArray(data)) return 0;
  return data
    .filter((c: { clave: string; canjeado_por: string | null }) => c.clave === "carita" && c.canjeado_por === uid)
    .reduce((s: number, c: { fotos: number }) => s + (c.fotos ?? 0), 0);
}

async function guardarImagen(userId: string, slot: number, look: string, dataUrl: string): Promise<string> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { dataUrlABytes } = await import("@/lib/ia.server");
  const { bytes, tipo } = dataUrlABytes(dataUrl);
  const path = `${userId}/${slot}/${look}.png`;
  const { error } = await supabaseAdmin.storage.from("personajes").upload(path, bytes, { contentType: tipo, upsert: true });
  if (error) throw new Error(error.message);
  return path;
}

function errorDeIA(e: unknown): Resultado {
  const codigo = (e as { codigo?: string })?.codigo;
  if (codigo === "sin_credito" || codigo === "rechazada") return { ok: false, error: codigo };
  if (codigo === "limite") return { ok: false, error: "ocupado" };
  console.error("[carita]", e);
  return { ok: false, error: "fallo" };
}

const slotValido = (slot: unknown) => Number.isInteger(slot) && (slot as number) >= 0 && (slot as number) <= MAX_SLOT;

// 1) Foto -> personaje base (look normal) en un slot.
export const crearPersonajeBase = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { foto: string; genero: Genero; slot: number; nombre?: string }) => {
    if (typeof d?.foto !== "string" || !/^data:image\/(jpeg|png|webp);base64,/.test(d.foto) || d.foto.length > MAX_FOTO_CHARS) {
      throw new Error("Foto inválida");
    }
    if (d.genero !== "nino" && d.genero !== "nina") throw new Error("Género inválido");
    if (!slotValido(d.slot)) throw new Error("Slot inválido");
    const nombre = typeof d.nombre === "string" ? d.nombre.trim().slice(0, 20) : "";
    return { ...d, nombre };
  })
  .handler(async ({ data, context }): Promise<Resultado> => {
    const fotos = await fotosCompradas(context.supabase, context.userId);
    if (fotos === 0) return { ok: false, error: "sin_compra" };
    if (data.slot >= fotos) return { ok: false, error: "limite" };

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: fila } = await supabaseAdmin
      .from("personajes_carita")
      .select("intentos")
      .eq("user_id", context.userId)
      .eq("slot", data.slot)
      .maybeSingle();
    const intentos = fila?.intentos ?? 0;
    if (intentos >= MAX_INTENTOS_POR_FOTO) return { ok: false, error: "limite" };

    try {
      const { generarImagen } = await import("@/lib/ia.server");
      const estilo = await aDataUrl(referencia(data.genero, "base"));
      const imagen = await generarImagen(PROMPT_BASE, [data.foto, estilo]);
      const path = await guardarImagen(context.userId, data.slot, "ninguno", imagen);
      await supabaseAdmin.from("personajes_carita").upsert(
        {
          user_id: context.userId,
          slot: data.slot,
          nombre: data.nombre || null,
          genero: data.genero,
          looks: { ninguno: path }, // una foto nueva reemplaza los looks anteriores de este personaje
          intentos: intentos + 1,
          actualizado: new Date().toISOString(),
        },
        { onConflict: "user_id,slot" },
      );
      return { ok: true, path };
    } catch (e) {
      return errorDeIA(e);
    }
  });

// 2) Personaje base -> cada uno de los otros 6 looks del estilo (una llamada por look, en paralelo).
export const crearLookCarita = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { slot: number; look: LookKey }) => {
    if (!slotValido(d?.slot)) throw new Error("Slot inválido");
    if (!TODOS_LOOKS_CARITA.includes(d?.look)) throw new Error("Look inválido");
    return d;
  })
  .handler(async ({ data, context }): Promise<Resultado> => {
    if ((await fotosCompradas(context.supabase, context.userId)) <= data.slot) return { ok: false, error: "sin_compra" };

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: fila } = await supabaseAdmin
      .from("personajes_carita")
      .select("genero, looks, looks_generados")
      .eq("user_id", context.userId)
      .eq("slot", data.slot)
      .maybeSingle();
    const looks = (fila?.looks ?? {}) as Record<string, string>;
    if (!fila || !looks["ninguno"]) return { ok: false, error: "sin_base" };
    const genero = fila.genero as Genero;
    if (!looksCarita(genero).includes(data.look)) return { ok: false, error: "fallo" };
    // Tope de seguridad de costo: 6 looks por intento, con margen para reintentos.
    if (fila.looks_generados >= looksCarita(genero).length * MAX_INTENTOS_POR_FOTO * 2) return { ok: false, error: "limite" };

    try {
      const { generarImagen } = await import("@/lib/ia.server");
      const { data: firmada } = await supabaseAdmin.storage.from("personajes").createSignedUrl(looks["ninguno"], 600);
      if (!firmada?.signedUrl) return { ok: false, error: "sin_base" };
      const base = await aDataUrl(firmada.signedUrl);
      const disfraz = await aDataUrl(referencia(genero, data.look));
      const imagen = await generarImagen(PROMPT_LOOK, [base, disfraz]);
      const path = await guardarImagen(context.userId, data.slot, data.look, imagen);
      // Fusión atómica en la base: varios looks se generan al mismo tiempo.
      await supabaseAdmin.rpc("guardar_look_carita", { p_user: context.userId, p_slot: data.slot, p_look: data.look, p_path: path });
      return { ok: true, path };
    } catch (e) {
      return errorDeIA(e);
    }
  });

// 3) Borrar los dibujos de un personaje. Los intentos usados no se devuelven
//    (si no, borrar y volver a crear daría IA gratis sin límite).
export const borrarPersonajeCarita = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { slot: number }) => {
    if (!slotValido(d?.slot)) throw new Error("Slot inválido");
    return d;
  })
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const archivos = ["ninguno", ...TODOS_LOOKS_CARITA].map((l) => `${context.userId}/${data.slot}/${l}.png`);
    await supabaseAdmin.storage.from("personajes").remove(archivos);
    await supabaseAdmin.from("personajes_carita").update({ looks: {} }).eq("user_id", context.userId).eq("slot", data.slot);
    return { ok: true as const };
  });
