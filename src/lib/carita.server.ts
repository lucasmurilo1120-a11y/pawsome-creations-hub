// Utilidades de servidor para "Con su carita" y los códigos. Solo se importa
// desde server functions y server routes (usa la clave de servicio de Supabase).
import { getRequest } from "@tanstack/react-start/server";

export async function admin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

export async function sha256(texto: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(texto));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// Letras y números fáciles de leer (sin 0/O ni 1/I/L).
const ALFABETO = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

export function aleatorio(n: number, alfabeto = ALFABETO): string {
  const bytes = crypto.getRandomValues(new Uint8Array(n));
  return Array.from(bytes, (b) => alfabeto[b % alfabeto.length]).join("");
}

export function normalizarCodigo(raw: unknown): string {
  return String(raw ?? "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");
}

export const codigoValido = (c: string) => /^[ABCDEFGHJKMNPQRSTUVWXYZ23456789]{6}$/.test(c);

export async function ipHash(request: Request): Promise<string> {
  const ip =
    request.headers.get("cf-connecting-ip") ??
    request.headers.get("x-real-ip") ??
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "sin-ip";
  return sha256(`papelitos:${ip}`);
}

export const ipDelPedido = () => ipHash(getRequest());

export type Acceso = { id: string; fotos: number };

export async function accesoDeToken(token: unknown): Promise<Acceso | null> {
  if (typeof token !== "string" || token.length < 20 || token.length > 80) return null;
  const db = await admin();
  const { data } = await db.from("accesos").select("id, fotos").eq("token_hash", await sha256(token)).maybeSingle();
  return (data as Acceso | null) ?? null;
}

export async function config(clave: string): Promise<string | null> {
  const db = await admin();
  const { data } = await db.from("config").select("valor").eq("clave", clave).maybeSingle();
  return (data as { valor: string } | null)?.valor ?? null;
}

// Cuenta intentos recientes de una IP (para frenar pruebas automáticas).
export async function intentosRecientes(ip: string, tipo: string, minutos: number, soloFallidos = true): Promise<number> {
  const db = await admin();
  let q = db
    .from("intentos")
    .select("id", { count: "exact", head: true })
    .eq("ip_hash", ip)
    .eq("tipo", tipo)
    .gte("creado", new Date(Date.now() - minutos * 60_000).toISOString());
  if (soloFallidos) q = q.eq("exito", false);
  const { count } = await q;
  return count ?? 0;
}

export async function registrarIntento(ip: string, tipo: string, exito: boolean) {
  const db = await admin();
  await db.from("intentos").insert({ ip_hash: ip, tipo, exito });
}

// --- Imágenes de "Con su carita" -------------------------------------------------

export const PROMPT_BASE =
  "Create a full-body character for a children's paper-doll kit, based on the person in the FIRST image (a photo). " +
  "Draw it in EXACTLY the same illustration style as the SECOND image: same proportions (big head, big expressive eyes, small body), " +
  "same clean outline, same soft shading and color palette, same front-facing standing pose with arms slightly open, " +
  "plain white background and nothing else in the image. Keep the person's real features so the family recognizes them at first sight: " +
  "face shape, skin tone, eye color and shape, eyebrows, nose, smile, hair color, hair length, hairstyle and texture, glasses, freckles and beard if any. " +
  "Clothing exactly like the SECOND image. No text.";

export const PROMPT_LOOK =
  "Dress the character from the FIRST image in the costume shown in the SECOND image. " +
  "Keep the character's face, hair, skin tone and proportions exactly as in the FIRST image, and keep the same illustration style, " +
  "front-facing standing pose and plain white background. Copy the costume, accessories, props and colors from the SECOND image. No text.";

function origenDelPedido(): string {
  const fijo = process.env["APP_ORIGIN"];
  if (fijo) return fijo;
  return new URL(getRequest().url).origin;
}

export const referencia = (genero: "nino" | "nina", look: string) => `${origenDelPedido()}/personajes/${genero}-${look}.webp`;

export async function firmar(paths: string[]): Promise<Map<string, string>> {
  const mapa = new Map<string, string>();
  if (!paths.length) return mapa;
  const db = await admin();
  const { data } = await db.storage.from("personajes").createSignedUrls(paths, 60 * 60 * 24);
  (data ?? []).forEach((d: { path: string | null; signedUrl: string | null }, i: number) => {
    const p = d.path ?? paths[i];
    if (p && d.signedUrl) mapa.set(p, d.signedUrl);
  });
  return mapa;
}

export async function guardarImagen(accesoId: string, slot: number, look: string, dataUrl: string): Promise<string> {
  const { dataUrlABytes } = await import("@/lib/ia.server");
  const db = await admin();
  const { bytes, tipo } = dataUrlABytes(dataUrl);
  const path = `${accesoId}/${slot}/${look}.png`;
  const { error } = await db.storage.from("personajes").upload(path, bytes, { contentType: tipo, upsert: true });
  if (error) throw new Error(error.message);
  return path;
}
