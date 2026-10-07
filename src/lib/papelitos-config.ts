// Configuración comercial de Papelitos en un solo lugar.
// Los precios de los extras son sugerencias: cámbialos acá y se actualiza todo el app.

export const BRAND = "Papelitos";
export const SUPPORT_EMAIL = "lucasmurilo1120@gmail.com";
// Página de ventas (para quien entra sin haber comprado).
export const SALES_URL = "https://build-your-world-853.lovable.app";

// Claves de lo que se puede comprar. Cada producto de Hotmart se asocia a una
// de estas claves en la tabla productos_hotmart (ver supabase/migrations).
export type Clave = "kit" | "premium" | "colorear" | "carita";

export type Extra = {
  clave: Extract<Clave, "colorear" | "carita">;
  titulo: string;
  descripcion: string;
  precio: string;
  // Link del checkout de Hotmart SOLO de este extra. Vacío = botón "Muy pronto".
  checkout: string;
};

export const EXTRAS: Extra[] = [
  {
    clave: "carita",
    titulo: "Con su carita",
    descripcion: "Sube una foto y su héroe tendrá su cara en los 7 looks y en todas sus historias.",
    precio: "US$4,97",
    checkout: "",
  },
  {
    clave: "colorear",
    titulo: "Libro para colorear",
    descripcion: "Su personaje en los 7 looks para pintar, con su nombre en cada página y un diploma de artista.",
    precio: "US$4,97",
    checkout: "",
  },
];

// Pack familia: suma fotos (personajes con carita) a quien ya tiene "Con su carita".
// Se ofrece dentro del app después de crear el primer personaje.
export const PACK_FAMILIA = {
  titulo: "Pack familia",
  descripcion: "Suma 4 fotos más: sus hermanos, mamá, papá o los abuelos, cada uno como personaje del kit.",
  fotos: 4,
  precio: "US$9,97",
  checkout: "",
};

// Intentos por cada foto comprada (si la primera no sale bien, puede probar con otra).
// Cada intento usa IA, por eso hay un límite.
export const MAX_INTENTOS_POR_FOTO = 3;

// Agrega el e-mail del comprador al link de Hotmart para que no tenga que escribirlo.
export function checkoutConEmail(url: string, email?: string | null) {
  if (!url) return "";
  if (!email) return url;
  return `${url}${url.includes("?") ? "&" : "?"}email=${encodeURIComponent(email)}`;
}
