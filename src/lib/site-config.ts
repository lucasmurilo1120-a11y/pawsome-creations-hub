/**
 * Configuración central de la página de ventas.
 * Todo lo que puede cambiar (precio, promo, garantía, soporte, features)
 * vive aquí. Nada se muestra si no está realmente configurado.
 */

export const REGULAR_PRICE = "US$15";
export const PROMO_PRICE: string | null = null;
export const PROMO_ACTIVE = false;
/** ISO date string, p. ej. "2026-09-01T23:59:00Z". null = sin fecha real de término. */
export const PROMO_END_AT: string | null = null;

/** Solo llenar si el checkout realmente ofrece cuotas. Ej: "3 pagos de US$5". */
export const INSTALLMENT_TEXT: string | null = null;

/** Días de garantía reales según las condiciones de compra. 0 = no mostrar. */
export const GUARANTEE_DAYS = 0;

/** URL real del checkout. Todos los CTAs usan esta única configuración. */
export const CHECKOUT_URL = "#oferta";

/** Característica fija del producto: siempre 100, nunca depende de carga. */
export const RECIPE_COUNT = 100;

/** Email de soporte real. null = no mostrar correo de contacto. */
export const SUPPORT_EMAIL: string | null = null;

/** Firma emocional principal de la marca. */
export const BRAND_SIGNATURE = "Hecho por ti. Para quien siempre está contigo.";

/** CTA único de compra en toda la página. */
export const CTA_TEXT = "QUIERO ACCESO A LAS 100 RECETAS";
export const CTA_TEXT_SHORT = "QUIERO ACCESO";

/** Autoridad profesional: solo con revisión real y comprobable. */
export const PROFESSIONAL_REVIEW_ENABLED = false;

/** Notificaciones de compra en tiempo real: solo con eventos reales del checkout. */
export const REALTIME_PURCHASES_ENABLED = false;

/** Contador de accesos confirmados (transacciones approved reales). 0 = ocultar. */
export const VERIFIED_PURCHASE_COUNT = 0;

/** Galería de preparaciones de clientes reales (UGC con consentimiento). */
export const UGC_ENABLED = false;

/** Prueba social: reseñas reales enviadas por compradores. */
export const REVIEWS = {
  enabled: true,
  items: [
    {
      name: "Camila R.",
      country: "México",
      comment:
        "Antes guardaba recetas en Instagram y después nunca las volvía a encontrar. Muchas ni explicaban bien las cantidades ni cuánto rendían. Aquí está todo organizado, con ingredientes, preparación y conservación en el mismo lugar.",
    },
    {
      name: "Valentina M.",
      country: "Colombia",
      comment:
        "Lo que más me gustó fue poder cambiar la cantidad que quiero preparar sin hacer cuentas. La plataforma ajusta los ingredientes automáticamente y eso me facilitó mucho.",
    },
    {
      name: "Daniela P.",
      country: "Chile",
      comment:
        "No tengo experiencia en la cocina y pensé que sería complicado. Elegí una receta fácil, seguí cada paso desde el celular y lo logré sin dificultad.",
    },
    {
      name: "Sofía L.",
      country: "Argentina",
      comment:
        "Compré porque quería hacer algo diferente para el cumpleaños de mi perra. Preparé uno de los pastelitos y quedó muy especial. Fue mucho más significativo que simplemente comprar un premio listo.",
    },
    {
      name: "Mariana G.",
      country: "Perú",
      comment:
        "Siempre terminaba dándole lo mismo porque no sabía qué preparar. Ahora tengo varias opciones de galletas, snacks, cupcakes y pasteles, todo organizado y fácil de encontrar.",
    },
    {
      name: "Andrea C.",
      country: "México",
      comment:
        "Lo que me molestaba de las recetas de internet era no saber cómo guardarlas después. Aquí la propia receta explica la conservación y muestra los cuidados importantes antes de preparar.",
    },
    {
      name: "Laura V.",
      country: "Colombia",
      comment:
        "Tenía recetas regadas entre TikTok, Pinterest e Instagram. A la hora de hacer algo nunca las encontraba. Aquí entro, elijo la categoría, abro la receta y ya tengo todo lo que necesito.",
    },
    {
      name: "Paula N.",
      country: "Argentina",
      comment:
        "Elegí algunas recetas para hacer el fin de semana y puse todo en la lista de compras. No tuve que anotar ingrediente por ingrediente. Facilitó mucho mi organización.",
    },
    {
      name: "Fernanda A.",
      country: "México",
      comment:
        "Empecé queriendo solo hacer recetas para mis perros, pero me encantó la calculadora de costos. Registré el precio de los ingredientes y la plataforma hizo las cuentas por mí.",
    },
    {
      name: "Natalia S.",
      country: "Colombia",
      comment:
        "Cuando lo vi, pensé que sería un PDF más de recetas. Después de entrar me di cuenta de que era muy diferente. Puedo buscar, guardar favoritas, ajustar cantidades y usar todo directo desde el celular.",
    },
    {
      name: "Gabriela T.",
      country: "Chile",
      comment:
        "No quería perder tiempo buscando una receta y comparando varios sitios. Aquí elijo lo que quiero preparar y encuentro la información organizada y el paso a paso.",
    },
    {
      name: "Lucía F.",
      country: "Uruguay",
      comment:
        "Me encantó preparar algo con mis propias manos y ver a mi perra esperando a mi lado en la cocina. Terminó siendo un momento de las dos, y ya elegí lo que voy a preparar para su cumpleaños.",
    },
  ],
};

export type AnalyticsEvent =
  | "page_view"
  | "hero_cta_clicked"
  | "sticky_cta_clicked"
  | "category_selected"
  | "recipe_demo_interacted"
  | "recipe_quantity_demo_changed"
  | "tool_demo_opened"
  | "pricing_viewed"
  | "checkout_clicked"
  | "faq_opened"
  | "final_cta_clicked"
  | "scroll_25"
  | "scroll_50"
  | "scroll_75"
  | "scroll_90"
  | "purchase_completed";

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

export function track(event: AnalyticsEvent, payload: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push({ event, ...payload });
}

const TRACKED_PARAMS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "fbclid",
];

/** Devuelve la URL de checkout preservando UTMs cuando el destino es externo. */
export function getCheckoutUrl() {
  if (typeof window === "undefined") return CHECKOUT_URL;
  if (!/^https?:\/\//.test(CHECKOUT_URL)) return CHECKOUT_URL;
  try {
    const url = new URL(CHECKOUT_URL);
    const current = new URLSearchParams(window.location.search);
    for (const key of TRACKED_PARAMS) {
      const value = current.get(key);
      if (value && !url.searchParams.has(key)) url.searchParams.set(key, value);
    }
    return url.toString();
  } catch {
    return CHECKOUT_URL;
  }
}
