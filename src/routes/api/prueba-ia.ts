import { createFileRoute } from "@tanstack/react-router";

// Prueba interna de la IA (protegida con clave; el hash está en config.prueba_ia_hash).
// GET /api/prueba-ia?clave=...&modelos=1            -> lista de modelos de imagen
// GET /api/prueba-ia?clave=...&foto=URL&genero=nina&version=v1|v2&ver=1 -> crea el personaje base
//   (el mismo camino que usa la app; ver=1 devuelve la imagen)
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
        const version = url.searchParams.get("version") === "v1" ? "v1" : "v2";
        const foto = url.searchParams.get("foto") ?? FOTO_PRUEBA;
        const inicio = Date.now();
        try {
          const { crearBaseDesdeFoto } = await import("@/lib/carita.server");
          const fotoData = await ia.urlADataUrl(foto);
          const { imagen, descripcion } = await crearBaseDesdeFoto(fotoData, genero, { modelo, version });
          const seg = ((Date.now() - inicio) / 1000).toFixed(1);
          const nota = `ok ${version} modelo=${modelo ?? "config"} ${seg}s | ${descripcion ?? "sin descripción"}`.slice(0, 1000);
          const { data } = await db.from("pruebas_ia").insert({ nota, imagen }).select("id").single();
          if (url.searchParams.get("ver")) {
            const { bytes, tipo } = ia.dataUrlABytes(imagen);
            return new Response(bytes.buffer as ArrayBuffer, {
              headers: { "Content-Type": tipo, "X-Prueba": String((data as { id: number } | null)?.id ?? ""), "X-Nota": encodeURIComponent(nota) },
            });
          }
          return new Response(`OK prueba ${(data as { id: number } | null)?.id}: ${nota}`, {
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
