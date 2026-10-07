// Generación de imágenes con la IA integrada de Lovable (AI Gateway).
// Solo se usa en el servidor: la clave LOVABLE_API_KEY nunca llega al navegador.
//
// Si más adelante se usa una clave propia de Google (más barata), basta con cambiar
// esta función: el resto del app no se entera.

export const MODELO_IMAGEN = process.env["PAPELITOS_MODELO_IMAGEN"] ?? "google/gemini-3.1-flash-image";
const GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";

export class ErrorIA extends Error {
  constructor(
    public codigo: "sin_credito" | "limite" | "rechazada" | "fallo",
    mensaje: string,
  ) {
    super(mensaje);
  }
}

// Recibe un texto y una lista de imágenes (URLs públicas o data URLs) y devuelve
// la imagen generada como data URL (base64).
export async function generarImagen(prompt: string, imagenes: string[]): Promise<string> {
  const key = process.env["LOVABLE_API_KEY"];
  if (!key) throw new ErrorIA("fallo", "Falta LOVABLE_API_KEY");

  const res = await fetch(GATEWAY, {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: MODELO_IMAGEN,
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
  if (!res.ok) throw new ErrorIA("fallo", `IA respondió ${res.status}`);

  const json = (await res.json()) as {
    choices?: { message?: { images?: { image_url?: { url?: string } }[]; content?: string } }[];
  };
  const url = json.choices?.[0]?.message?.images?.[0]?.image_url?.url;
  // Sin imagen = el filtro de seguridad de la IA la rechazó (o no entendió la foto).
  if (!url) throw new ErrorIA("rechazada", json.choices?.[0]?.message?.content ?? "Sin imagen");
  return url;
}

export function dataUrlABytes(dataUrl: string): { bytes: Uint8Array; tipo: string } {
  const m = /^data:([^;]+);base64,(.+)$/.exec(dataUrl);
  if (!m) throw new ErrorIA("fallo", "Formato de imagen inesperado");
  const bin = atob(m[2]!);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return { bytes, tipo: m[1]! };
}
