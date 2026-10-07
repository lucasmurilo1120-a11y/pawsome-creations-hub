import { BRAND } from "@/lib/papelitos-config";

// Libro para colorear (extra): portada + 7 páginas en líneas + diploma de artista.
// Usa las ilustraciones en líneas de public/colorear para los 4 personajes estándar.

export type PersonajeEstandar = "nino" | "nina" | "nino2" | "nina2";
export type LookKey = "ninguno" | "superheroe" | "pirata" | "astronauta" | "mago" | "guerreiro" | "realeza";

export const LOOKS_COLOREAR: { key: LookKey; label: string }[] = [
  { key: "ninguno", label: "Normal" },
  { key: "superheroe", label: "Superhéroe" },
  { key: "pirata", label: "Pirata" },
  { key: "astronauta", label: "Astronauta" },
  { key: "mago", label: "Mago/Bruja" },
  { key: "guerreiro", label: "Guerrero" },
  { key: "realeza", label: "Realeza" },
];

export const PAGINAS_COLOREAR = 1 + LOOKS_COLOREAR.length + 1;

export const lineArt = (c: PersonajeEstandar, t: LookKey) => `/colorear/${c}-${t === "ninguno" ? "base" : t}.webp`;

const PAGE_BREAK = { breakAfter: "page", pageBreakAfter: "always" } as const;

export function LibroColorearImprimible({ name, personaje }: { name: string; personaje: PersonajeEstandar }) {
  return (
    <div className="print-kit hidden print:block" aria-hidden>
      <section style={PAGE_BREAK} className="flex min-h-[250mm] flex-col items-center justify-center gap-6 text-center">
        <p className="text-lg font-semibold tracking-wide text-brand">{BRAND}</p>
        <h1 className="font-display text-5xl font-semibold text-foreground">El libro para colorear de {name}</h1>
        <img src={lineArt(personaje, "superheroe")} alt="" className="max-h-[160mm] object-contain" />
        <p className="text-base text-muted-foreground">7 looks para pintar con tus colores favoritos.</p>
      </section>

      {LOOKS_COLOREAR.map((t) => (
        <section key={t.key} style={PAGE_BREAK} className="flex min-h-[250mm] flex-col items-center justify-center gap-5 text-center">
          <p className="text-sm font-semibold tracking-wide text-brand">
            PARA COLOREAR · {t.key === "ninguno" ? "LOOK NORMAL" : t.label.toUpperCase()}
          </p>
          <h2 className="font-display text-3xl font-semibold text-foreground">Colorea a {name}</h2>
          <img src={lineArt(personaje, t.key)} alt="" className="max-h-[200mm] object-contain" />
          <p className="text-sm text-muted-foreground">Usa tus colores favoritos y, si quieres, recórtalo por el borde.</p>
        </section>
      ))}

      <section className="flex min-h-[250mm] flex-col items-center justify-center gap-6 text-center">
        <div className="flex w-full flex-col items-center gap-5 rounded-3xl border-4 border-dashed border-brand p-10">
          <p className="text-lg font-semibold tracking-wide text-brand">{BRAND}</p>
          <h2 className="font-display text-5xl font-semibold text-foreground">Diploma de Artista</h2>
          <p className="text-lg text-muted-foreground">Se otorga con orgullo a</p>
          <p className="font-display text-6xl font-semibold text-brand-deep">{name}</p>
          <img src={lineArt(personaje, "realeza")} alt="" className="max-h-[100mm] object-contain" />
          <p className="max-w-md text-lg text-foreground">por llenar de color cada página de su libro.</p>
          <p className="mt-4 text-sm text-muted-foreground">Fecha: ____ / ____ / ________</p>
        </div>
      </section>
    </div>
  );
}
