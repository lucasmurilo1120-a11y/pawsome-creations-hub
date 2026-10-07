import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// Canje por código. El código es el de la transacción de Hotmart (HP...), que
// cada comprador recibe en el e-mail de compra: es único y el order bump tiene
// el suyo. Se puede usar UNA vez; la compra pasa a la cuenta que lo canjea.
//
// Para que nadie pruebe códigos ajenos al azar:
//  - si el e-mail de la cuenta no es el de la compra, se pide también el e-mail de la compra;
//  - máximo 8 intentos fallidos por hora por cuenta.

export type ResultadoCanje =
  | { ok: true; clave: string; fotos: number }
  | { ok: false; error: "formato" | "no_existe" | "usado" | "revocado" | "pide_email" | "email_no_coincide" | "demasiados" };

const MAX_FALLOS_HORA = 8;

export const canjearCodigo = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { codigo: string; email?: string }) => {
    const codigo = String(d?.codigo ?? "")
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "");
    const email = typeof d?.email === "string" ? d.email.trim().toLowerCase().slice(0, 255) : "";
    return { codigo, email };
  })
  .handler(async ({ data, context }): Promise<ResultadoCanje> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const uid = context.userId;
    const miEmail = String(context.claims?.email ?? "").toLowerCase();

    const desde = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count } = await supabaseAdmin
      .from("intentos_canje")
      .select("id", { count: "exact", head: true })
      .eq("user_id", uid)
      .eq("exito", false)
      .gte("creado", desde);
    if ((count ?? 0) >= MAX_FALLOS_HORA) return { ok: false, error: "demasiados" };

    const fallo = async (error: Exclude<ResultadoCanje, { ok: true }>["error"]): Promise<ResultadoCanje> => {
      await supabaseAdmin.from("intentos_canje").insert({ user_id: uid, exito: false });
      await new Promise((r) => setTimeout(r, 400)); // frena pruebas automáticas
      return { ok: false, error };
    };

    if (!/^HP\d{6,20}$/.test(data.codigo)) return fallo("formato");

    // 1) ¿Ya llegó por el aviso automático de Hotmart?
    let { data: compra } = await supabaseAdmin
      .from("compras")
      .select("id, email, clave, fotos, estado, canjeado_por")
      .eq("transaccion", data.codigo)
      .maybeSingle();

    // 2) Si no, se pregunta directo a la API de Hotmart (si está configurada).
    if (!compra) {
      const { buscarVentaHotmart } = await import("@/lib/hotmart.server");
      const venta = await buscarVentaHotmart(data.codigo);
      if (venta) {
        const { data: producto } = await supabaseAdmin
          .from("productos_hotmart")
          .select("clave, fotos")
          .eq("hotmart_product_id", venta.productId)
          .maybeSingle();
        if (producto) {
          const { data: nueva } = await supabaseAdmin
            .from("compras")
            .upsert(
              {
                email: venta.email,
                clave: producto.clave,
                fotos: producto.fotos ?? 0,
                transaccion: venta.transaccion,
                hotmart_product_id: venta.productId,
                estado: venta.aprobada ? "activo" : "revocado",
                evento: "API_CANJE",
              },
              { onConflict: "transaccion" },
            )
            .select("id, email, clave, fotos, estado, canjeado_por")
            .single();
          compra = nueva;
        }
      }
    }

    if (!compra) return fallo("no_existe");
    if (compra.estado !== "activo") return fallo("revocado");
    if (compra.canjeado_por && compra.canjeado_por !== uid) return fallo("usado");
    if (compra.canjeado_por === uid) return { ok: true, clave: compra.clave, fotos: compra.fotos };

    // Si la cuenta es de otro e-mail (regalo), debe saber el e-mail de la compra.
    if (compra.email !== miEmail) {
      if (!data.email) {
        // Cuenta como intento: así nadie usa esta respuesta para descubrir códigos válidos.
        await supabaseAdmin.from("intentos_canje").insert({ user_id: uid, exito: false });
        return { ok: false, error: "pide_email" };
      }
      if (data.email !== compra.email) return fallo("email_no_coincide");
    }

    // Marca como usado de forma atómica: solo si sigue libre.
    const { data: marcada } = await supabaseAdmin
      .from("compras")
      .update({ canjeado_por: uid, canjeado_en: new Date().toISOString() })
      .eq("id", compra.id)
      .is("canjeado_por", null)
      .select("id")
      .maybeSingle();
    if (!marcada) return fallo("usado");

    await supabaseAdmin.from("intentos_canje").insert({ user_id: uid, exito: true });
    return { ok: true, clave: compra.clave, fotos: compra.fotos };
  });
