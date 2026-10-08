import { createFileRoute } from "@tanstack/react-router";

// Endpoint de las páginas de códigos (otros sitios): POST { token, email? } -> código.
// Responde con CORS abierto: sin el token de la página no se obtiene nada.

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "content-type",
  "Access-Control-Max-Age": "86400",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...CORS, "Content-Type": "application/json", "Cache-Control": "no-store" } });

export const Route = createFileRoute("/api/codigo")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: CORS }),
      POST: async ({ request }: { request: Request }) => {
        let body: { token?: unknown; email?: unknown; dispositivo?: unknown } = {};
        try {
          body = (await request.json()) as typeof body;
        } catch {
          return json({ ok: false, error: "fallo" }, 400);
        }
        try {
          const { ipHash } = await import("@/lib/carita.server");
          const { emitirCodigo } = await import("@/lib/codigos.server");
          const r = await emitirCodigo(body.token, body.email, await ipHash(request), body.dispositivo);
          return json(r, r.ok ? 200 : r.error === "token" ? 401 : 200);
        } catch (e) {
          console.error("[api/codigo]", e);
          return json({ ok: false, error: "fallo" }, 500);
        }
      },
    },
  },
});
