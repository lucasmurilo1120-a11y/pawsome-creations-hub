import { createFileRoute } from "@tanstack/react-router";

// Aviso automático (webhook) de Hotmart, versión 2.0.0.
// Configurar en Hotmart: Herramientas > Webhook > URL = <sitio>/api/hotmart
// y guardar el "hottok" de Hotmart como secreto HOTMART_HOTTOK en Lovable Cloud.
//
// Cada compra (incluido cada order bump, que Hotmart envía como compra propia
// ligada por parent_purchase_transaction) se guarda en public.compras con la
// clave que corresponde a su producto en public.productos_hotmart.

const ACTIVAR = new Set(["PURCHASE_APPROVED", "PURCHASE_COMPLETE"]);
const REVOCAR = new Set(["PURCHASE_REFUNDED", "PURCHASE_CHARGEBACK", "PURCHASE_CANCELED"]);

type HotmartEvento = {
  event?: string;
  hottok?: string;
  data?: {
    product?: { id?: number | string };
    buyer?: { email?: string };
    purchase?: { transaction?: string };
  };
};

async function hottokValido(recibido: string | null | undefined): Promise<boolean> {
  const esperado = process.env["HOTMART_HOTTOK"];
  if (!esperado || !recibido) return false;
  const { createHash, timingSafeEqual } = await import("node:crypto");
  const h = (v: string) => createHash("sha256").update(v, "utf8").digest();
  return timingSafeEqual(h(recibido), h(esperado));
}

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

        const token = request.headers.get("x-hotmart-hottok") ?? body.hottok;
        if (!(await hottokValido(token))) return new Response("No autorizado", { status: 401 });

        const evento = body.event ?? "";
        const email = body.data?.buyer?.email?.trim().toLowerCase();
        const transaccion = body.data?.purchase?.transaction;
        const productId = body.data?.product?.id != null ? String(body.data.product.id) : "";

        // Eventos que no cambian el acceso (boleto impreso, carrito abandonado, etc.): solo confirmamos.
        if (!ACTIVAR.has(evento) && !REVOCAR.has(evento)) return new Response("ok", { status: 200 });
        if (!email || !transaccion || !productId) return new Response("Datos incompletos", { status: 400 });

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        const { data: producto } = await supabaseAdmin
          .from("productos_hotmart")
          .select("clave")
          .eq("hotmart_product_id", productId)
          .maybeSingle();

        // Producto que no es de Papelitos: lo ignoramos sin error para que Hotmart no reintente.
        if (!producto) return new Response("producto ignorado", { status: 200 });

        const { error } = await supabaseAdmin.from("compras").upsert(
          {
            email,
            clave: producto.clave,
            transaccion,
            hotmart_product_id: productId,
            estado: ACTIVAR.has(evento) ? "activo" : "revocado",
            evento,
            actualizado: new Date().toISOString(),
          },
          { onConflict: "transaccion" },
        );
        if (error) {
          console.error("[hotmart] error al guardar la compra", error.message);
          return new Response("error", { status: 500 });
        }
        return new Response("ok", { status: 200 });
      },
    },
  },
});
