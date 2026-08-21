/**
 * Configuración central de la página de ventas.
 * Todo lo que puede cambiar (precios, promo, garantía, variantes A/B)
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

/** URL real del checkout. */
export const CHECKOUT_URL = "#oferta";

export const RECIPE_COUNT = 100;
export const PER_RECIPE_PRICE = "US$0,15";

/** Prueba social: solo se muestra con datos reales del producto. */
export const REVIEWS = {
  enabled: false,
  average: null as number | null,
  count: null as number | null,
  items: [] as { name: string; country: string; comment: string; image?: string }[],
};

/** Notificaciones de compra: solo con eventos reales del checkout. */
export const REALTIME_PURCHASES_ENABLED = false;

/** Variantes de headline para pruebas A/B futuras. Activa: "A". */
export const HEADLINE_VARIANTS = {
  A: "100 formas de preparar algo especial para tu perro.",
  B: "Prepara algo especial para tu perro, hecho por ti.",
  C: "Convierte ingredientes simples en momentos especiales para tu perro.",
} as const;

export const ACTIVE_HEADLINE: keyof typeof HEADLINE_VARIANTS = "A";

export const CTA_VARIANTS = {
  A: "QUIERO LAS 100 RECETAS",
  B: "QUIERO ACCEDER AHORA",
} as const;

export const ACTIVE_CTA: keyof typeof CTA_VARIANTS = "A";

export type AnalyticsEvent =
  | "hero_cta_clicked"
  | "category_selected"
  | "recipe_demo_interacted"
  | "recipe_quantity_demo_changed"
  | "tool_demo_opened"
  | "pricing_viewed"
  | "checkout_clicked"
  | "faq_opened"
  | "final_cta_clicked"
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
