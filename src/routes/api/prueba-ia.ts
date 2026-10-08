import { createFileRoute } from "@tanstack/react-router";

// Prueba interna de la IA (protegida con clave; el hash está en config.prueba_ia_hash).
// GET /api/prueba-ia?clave=...&modelos=1            -> lista de modelos de imagen
// GET /api/prueba-ia?clave=...&modelo=...&foto=URL  -> crea el personaje base con esa foto
// El resultado se guarda en public.pruebas_ia. Se puede borrar esta ruta después.

const FOTO_PRUEBA =
  "https://raw.githubusercontent.com/lucasmurilo1120-a11y/pawsome-creations-hub/marketing-assets/teste/rosto-menino.jpg";

export const Route = createFileRoute("/api/prueba-ia")({
  server: {
    handlers: {
      GET: async ({ request }: { request: Request }) => {
        const url = new URL(request.url);
        const { admin, config, sha256 } = await import("@/lib/carita.server");
        const hash = await config("prueba_ia_hash");
        if (!hash || (await sha256(url.searchParams.get("clave") ?? "")) !== hash) return new Response("no", { status: 401 });
        const ia = await import("@/lib/ia.server");
        const db = await admin();

        if (url.searchParams.get("modelos")) {
          const modelos = await ia.listarModelos();
          const conImagen = modelos.filter((m) => /image|imagen|gpt-image|banana/i.test(m));
          await db.from("pruebas_ia").insert({ nota: "modelos", imagen: modelos.join("\n") });
          return new Response(`MODELOS DE IMAGEN:\n${conImagen.join("\n")}\n\nTODOS:\n${modelos.join("\n")}`, {
            headers: { "Content-Type": "text/plain; charset=utf-8" },
          });
        }

        const modelo = url.searchParams.get("modelo") ?? undefined;
        const genero = url.searchParams.get("genero") === "nina" ? "nina" : "nino";
        const foto = url.searchParams.get("foto") ?? FOTO_PRUEBA;
        const inicio = Date.now();
        try {
          const prompt =
            "Create a full-body character for a children's paper-doll kit, based on the person in the FIRST image (a photo). " +
            "Draw it in EXACTLY the same illustration style as the SECOND image: same proportions (big head, big expressive eyes, small body), " +
            "same clean outline, same soft shading and color palette, same front-facing standing pose with arms slightly open, " +
            "plain white background and nothing else in the image. Keep the person's real features so the family recognizes them at first sight: " +
            "face shape, skin tone, eye color and shape, eyebrows, nose, smile, hair color, hair length, hairstyle and texture, glasses, freckles and beard if any. " +
            "Clothing exactly like the SECOND image. No text.";
          const fotoData = await ia.urlADataUrl(foto);
          const estilo = await ia.urlADataUrl(`${url.origin}/personajes/${genero}-base.webp`);
          const imagen = await ia.generarImagen(prompt, [fotoData, estilo], modelo);
          const seg = ((Date.now() - inicio) / 1000).toFixed(1);
          const { data } = await db
            .from("pruebas_ia")
            .insert({ nota: `ok modelo=${modelo ?? "config"} ${seg}s`, imagen })
            .select("id")
            .single();
          return new Response(`OK prueba ${(data as { id: number } | null)?.id} en ${seg}s con ${modelo ?? "modelo de config"}`, {
            headers: { "Content-Type": "text/plain; charset=utf-8" },
          });
        } catch (e) {
          const msg = e instanceof Error ? e.message : String(e);
          await db.from("pruebas_ia").insert({ nota: `error modelo=${modelo ?? "config"}: ${msg}`.slice(0, 1000) });
          return new Response(`ERROR: ${msg}`, { status: 500, headers: { "Content-Type": "text/plain; charset=utf-8" } });
        }
      },
    },
  },
});
