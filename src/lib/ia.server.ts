// Generación de imágenes con la IA integrada de Lovable (AI Gateway).
// Solo se usa en el servidor: la clave LOVABLE_API_KEY nunca llega al navegador.
// El modelo se elige en la tabla config (clave "modelo_imagen"), así se puede
// cambiar sin publicar de nuevo.

const GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";
const MODELO_POR_DEFECTO = "google/gemini-3.1-flash-image-preview";
const MODELO_TEXTO_POR_DEFECTO = "google/gemini-2.5-flash";

export class ErrorIA extends Error {
  constructor(
    public codigo: "sin_credito" | "limite" | "rechazada" | "fallo",
    mensaje: string,
  ) {
    super(mensaje);
  }
}

async function modeloImagen(): Promise<string> {
  try {
    const { config } = await import("@/lib/carita.server");
    return (await config("modelo_imagen")) ?? MODELO_POR_DEFECTO;
  } catch {
    return MODELO_POR_DEFECTO;
  }
}

// Recibe un texto y una lista de imágenes (URLs públicas o data URLs) y devuelve
// la imagen generada como data URL (base64).
export async function generarImagen(prompt: string, imagenes: string[], modelo?: string): Promise<string> {
  const key = process.env["LOVABLE_API_KEY"];
  if (!key) throw new ErrorIA("fallo", "Falta LOVABLE_API_KEY");

  const res = await fetch(GATEWAY, {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: modelo ?? (await modeloImagen()),
      modalities: ["image", "text"],
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            ...imagenes.map((url) => ({ type: "image_url", image_url: { url } })),
          ],
        },
      ],
    }),
  });

  if (res.status === 402) throw new ErrorIA("sin_credito", "Sin crédito de IA");
  if (res.status === 429) throw new ErrorIA("limite", "Demasiadas solicitudes");
  if (!res.ok) throw new ErrorIA("fallo", `IA respondió ${res.status}: ${(await res.text()).slice(0, 300)}`);

  const json = (await res.json()) as {
    choices?: { message?: { images?: { image_url?: { url?: string } }[]; content?: string } }[];
  };
  const url = json.choices?.[0]?.message?.images?.[0]?.image_url?.url;
  // Sin imagen = el filtro de seguridad de la IA la rechazó (o no entendió la foto).
  if (!url) throw new ErrorIA("rechazada", json.choices?.[0]?.message?.content ?? "Sin imagen");
  return url;
}

// Describe los rasgos visibles de la persona de la foto (texto), para reforzar el parecido.
// Si falla o tarda, se dibuja igual sin la descripción.
const PROMPT_DESCRIBIR =
  "Describe only the visible physical traits of the person in this photo so an illustrator can draw a recognizable cartoon of them. " +
  "One compact sentence in English, no names, no opinions. Include: age group (toddler, child, teen, adult), skin tone " +
  "(fair, light, light olive, olive, tan, medium brown, brown, dark brown or deep), hair color, hair length, hair texture " +
  "(straight, wavy, curly or coily) and style, eye color, eyebrows, face shape, and any glasses, freckles, dimples, missing teeth, beard or mustache.";

export async function describirPersona(foto: string): Promise<string | null> {
  const key = process.env["LOVABLE_API_KEY"];
  if (!key) return null;
  let modelo = MODELO_TEXTO_POR_DEFECTO;
  try {
    const { config } = await import("@/lib/carita.server");
    modelo = (await config("modelo_texto")) ?? MODELO_TEXTO_POR_DEFECTO;
  } catch {
    /* modelo por defecto */
  }
  const res = await fetch(GATEWAY, {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    signal: AbortSignal.timeout(25_000),
    body: JSON.stringify({
      model: modelo,
      messages: [{ role: "user", content: [{ type: "text", text: PROMPT_DESCRIBIR }, { type: "image_url", image_url: { url: foto } }] }],
    }),
  });
  if (!res.ok) return null;
  const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  const texto = json.choices?.[0]?.message?.content?.replace(/\s+/g, " ").trim();
  return texto ? texto.slice(0, 500) : null;
}

export async function listarModelos(): Promise<string[]> {
  const key = process.env["LOVABLE_API_KEY"];
  if (!key) return ["(falta LOVABLE_API_KEY)"];
  const res = await fetch("https://ai.gateway.lovable.dev/v1/models", { headers: { Authorization: `Bearer ${key}` } });
  if (!res.ok) return [`(models respondió ${res.status})`];
  const json = (await res.json()) as { data?: { id?: string }[] };
  return (json.data ?? []).map((m) => m.id ?? "").filter(Boolean);
}

export function dataUrlABytes(dataUrl: string): { bytes: Uint8Array; tipo: string } {
  const m = /^data:([^;]+);base64,(.+)$/.exec(dataUrl);
  if (!m) throw new ErrorIA("fallo", "Formato de imagen inesperado");
  const bin = atob(m[2]!);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return { bytes, tipo: m[1]! };
}

export async function urlADataUrl(url: string): Promise<string> {
  const res = await fetch(url);
  if (!res.ok) throw new ErrorIA("fallo", `No se pudo leer ${url} (${res.status})`);
  const tipo = res.headers.get("content-type") ?? "image/webp";
  const buf = new Uint8Array(await res.arrayBuffer());
  let bin = "";
  for (let i = 0; i < buf.length; i += 0x8000) bin += String.fromCharCode(...buf.subarray(i, i + 0x8000));
  return `data:${tipo};base64,${btoa(bin)}`;
}
