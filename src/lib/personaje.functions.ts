import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { MAX_CREACIONES_CARITA } from "@/lib/papelitos-config";

// Personaje "Con su carita": la foto llega, se usa una sola vez para crear el
// personaje base y se descarta (nunca se guarda). Solo se guardan los dibujos.

export type Genero = "nino" | "nina";
export const LOOKS_CARITA = ["superheroe", "pirata", "astronauta", "mago", "guerreiro", "realeza"] as const;
export type LookCarita = (typeof LOOKS_CARITA)[number];

type Resultado = { ok: true; path: string } | { ok: false; error: "sin_compra" | "limite" | "sin_credito" | "ocupado" | "rechazada" | "fallo" | "sin_base" };

const MAX_FOTO_CHARS = 3_000_000; // ~2,2 MB en base64; el app ya la achica a 768 px

const PROMPT_BASE =
  "Create a full-body character for a children's paper-doll kit, based on the child in the FIRST image (a photo). " +
  "Draw it in EXACTLY the same illustration style as the SECOND image: same proportions (big head, big expressive eyes, small body), " +
  "same clean outline, same soft shading and color palette, same front-facing standing pose with arms slightly open, " +
  "plain white background and nothing else in the image. Keep the child's real features so the parents recognize them: " +
  "hair color, hair length and texture, face shape, eye color, skin tone and glasses if any. " +
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
function referencia(genero: Genero, look: "base" | LookCarita) {
  const fijo = process.env["APP_ORIGIN"];
  const delPedido = new URL(getRequest().url);
  const origin = fijo ?? (delPedido.protocol === "https:" ? delPedido.origin : "");
  if (!origin) throw new Error("Origen del app no configurado");
  return `${origin}/personajes/${genero}-${look}.webp`;
}

async function tieneCarita(supabase: { from: (t: string) => any }): Promise<boolean> {
  const { data } = await supabase.from("compras").select("clave").eq("estado", "activo");
  return Array.isArray(data) && data.some((c: { clave: string }) => c.clave === "carita");
}

async function guardarImagen(userId: string, look: string, dataUrl: string): Promise<string> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { dataUrlABytes } = await import("@/lib/ia.server");
  const { bytes, tipo } = dataUrlABytes(dataUrl);
  const path = `${userId}/${look}.png`;
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

// 1) Foto -> personaje base (look normal).
export const crearPersonajeBase = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { foto: string; genero: Genero }) => {
    if (typeof d?.foto !== "string" || !/^data:image\/(jpeg|png|webp);base64,/.test(d.foto) || d.foto.length > MAX_FOTO_CHARS) {
      throw new Error("Foto inválida");
    }
    if (d.genero !== "nino" && d.genero !== "nina") throw new Error("Género inválido");
    return d;
  })
  .handler(async ({ data, context }): Promise<Resultado> => {
    if (!(await tieneCarita(context.supabase))) return { ok: false, error: "sin_compra" };

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: fila } = await supabaseAdmin
      .from("personajes_carita")
      .select("creaciones")
      .eq("user_id", context.userId)
      .maybeSingle();
    if ((fila?.creaciones ?? 0) >= MAX_CREACIONES_CARITA) return { ok: false, error: "limite" };

    try {
      const { generarImagen } = await import("@/lib/ia.server");
      const estilo = await aDataUrl(referencia(data.genero, "base"));
      const imagen = await generarImagen(PROMPT_BASE, [data.foto, estilo]);
      const path = await guardarImagen(context.userId, "ninguno", imagen);
      await supabaseAdmin.from("personajes_carita").upsert(
        {
          user_id: context.userId,
          genero: data.genero,
          looks: { ninguno: path },
          creaciones: (fila?.creaciones ?? 0) + 1,
          actualizado: new Date().toISOString(),
        },
        { onConflict: "user_id" },
      );
      return { ok: true, path };
    } catch (e) {
      return errorDeIA(e);
    }
  });

// 2) Personaje base -> cada uno de los otros 6 looks (se llama una vez por look, en paralelo).
export const crearLookCarita = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { look: LookCarita }) => {
    if (!LOOKS_CARITA.includes(d?.look)) throw new Error("Look inválido");
    return d;
  })
  .handler(async ({ data, context }): Promise<Resultado> => {
    if (!(await tieneCarita(context.supabase))) return { ok: false, error: "sin_compra" };

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: fila } = await supabaseAdmin
      .from("personajes_carita")
      .select("genero, looks, regeneraciones")
      .eq("user_id", context.userId)
      .maybeSingle();
    const looks = (fila?.looks ?? {}) as Record<string, string>;
    if (!fila || !looks.ninguno) return { ok: false, error: "sin_base" };
    if (fila.regeneraciones >= LOOKS_CARITA.length * MAX_CREACIONES_CARITA) return { ok: false, error: "limite" };

    try {
      const { generarImagen } = await import("@/lib/ia.server");
      const { data: firmada } = await supabaseAdmin.storage.from("personajes").createSignedUrl(looks.ninguno, 600);
      if (!firmada?.signedUrl) return { ok: false, error: "sin_base" };
      const base = await aDataUrl(firmada.signedUrl);
      const disfraz = await aDataUrl(referencia(fila.genero as Genero, data.look));
      const imagen = await generarImagen(PROMPT_LOOK, [base, disfraz]);
      const path = await guardarImagen(context.userId, data.look, imagen);

      // Fusión atómica en la base: varios looks se generan al mismo tiempo.
      await supabaseAdmin.rpc("guardar_look_carita", { p_user: context.userId, p_look: data.look, p_path: path });
      return { ok: true, path };
    } catch (e) {
      return errorDeIA(e);
    }
  });

// 3) Borrar todo (botón "Borrar su personaje").
export const borrarPersonajeCarita = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const archivos = ["ninguno", ...LOOKS_CARITA].map((l) => `${context.userId}/${l}.png`);
    await supabaseAdmin.storage.from("personajes").remove(archivos);
    await supabaseAdmin.from("personajes_carita").update({ looks: {} }).eq("user_id", context.userId);
    return { ok: true as const };
  });
