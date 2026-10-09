import { createFileRoute } from "@tanstack/react-router";

// Aviso automático (webhook) de Hotmart, versión 2.0.0.
// Configurar en Hotmart: Herramientas > Webhook > URL = <sitio del app>/api/hotmart
// y guardar el "hottok" de Hotmart en la tabla config (clave "hotmart_hottok").
// Cada compra (también cada order bump, que Hotmart envía como compra propia) se
// guarda en public.compras con la clave de su producto en public.productos_hotmart.

const ACTIVAR = new Set(["PURCHASE_APPROVED", "PURCHASE_COMPLETE"]);
const REVOCAR = new Set(["PURCHASE_REFUNDED", "PURCHASE_CHARGEBACK", "PURCHASE_CANCELED", "PURCHASE_PROTEST"]);

type HotmartEvento = {
  event?: string;
  hottok?: string;
  data?: {
    product?: { id?: number | string };
    buyer?: { email?: string };
    purchase?: { transaction?: string };
  };
};

export const Route = createFileRoute("/api/hotmart")({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        let body: HotmartEvento;
        try {
          body = (await request.json()) as HotmartEvento;
        } catch {
          return new Response("JSON inválido", { status: 400 });
        }

        const { admin, config, sha256 } = await import("@/lib/carita.server");
        const esperado = process.env["HOTMART_HOTTOK"] ?? (await config("hotmart_hottok"));
        const recibido = request.headers.get("x-hotmart-hottok") ?? body.hottok ?? "";
        if (!esperado || (await sha256(recibido)) !== (await sha256(esperado))) {
          return new Response("No autorizado", { status: 401 });
        }

        const evento = body.event ?? "";
        if (!ACTIVAR.has(evento) && !REVOCAR.has(evento)) return new Response("ok", { status: 200 });
        const email = body.data?.buyer?.email?.trim().toLowerCase();
        const transaccion = body.data?.purchase?.transaction;
        const productId = body.data?.product?.id != null ? String(body.data.product.id) : "";
        if (!email || !transaccion || !productId) return new Response("Datos incompletos", { status: 400 });

        const db = await admin();
        const { data: producto } = await db
          .from("productos_hotmart")
          .select("clave, unidades")
          .eq("hotmart_product_id", productId)
          .maybeSingle();
        // Producto que no es de MiniMundos: se ignora sin error para que Hotmart no reintente.
        if (!producto) return new Response("producto ignorado", { status: 200 });

        const p = producto as { clave: string; unidades: number };
        const { error } = await db.from("compras").upsert(
          {
            email,
            clave: p.clave,
            unidades: p.unidades ?? 1,
            transaccion,
            hotmart_product_id: productId,
            estado: ACTIVAR.has(evento) ? "activo" : "revocado",
            evento,
            actualizado: new Date().toISOString(),
          },
          { onConflict: "transaccion" },
        );
        if (error) {
          console.error("[hotmart]", error.message);
          return new Response("Error", { status: 500 });
        }
        return new Response("ok", { status: 200 });
      },
    },
  },
});
