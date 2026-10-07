import { BRAND, ESCENAS_LISTAS } from "@/lib/papelitos-config";

// MiniMundos Color (extra).
// - Con ESCENAS_LISTAS: portada con su nombre + 16 escenas para pintar (cada una con
//   su guía a color en la esquina) + diploma de artista = 18 páginas.
// - Sin las escenas todavía: portada + 7 looks del personaje en líneas + diploma = 9 páginas.

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

// Las 16 escenas, en el orden de los prompts de la "Fábrica de Personagens".
export const ESCENAS: { titulo: string; personaje: PersonajeEstandar }[] = [
  { titulo: "El superhéroe salva al gatito", personaje: "nino" },
  { titulo: "El pirata y su barco", personaje: "nino" },
  { titulo: "Astronauta en la Luna", personaje: "nino" },
  { titulo: "El príncipe y su castillo", personaje: "nino" },
  { titulo: "La princesa en el jardín real", personaje: "nina" },
  { titulo: "El hada del bosque", personaje: "nina" },
  { titulo: "La capitana en la isla del tesoro", personaje: "nina" },
  { titulo: "La bailarina en el escenario", personaje: "nina" },
  { titulo: "El domador de dragones", personaje: "nino2" },
  { titulo: "El buzo en el fondo del mar", personaje: "nino2" },
  { titulo: "El mago en la biblioteca mágica", personaje: "nino2" },
  { titulo: "¡Gol!", personaje: "nino2" },
  { titulo: "La brujita y su caldero", personaje: "nina2" },
  { titulo: "La sirena en la laguna", personaje: "nina2" },
  { titulo: "Exploradora en la estación espacial", personaje: "nina2" },
  { titulo: "La jardinera y las mariposas", personaje: "nina2" },
];

const num = (i: number) => String(i + 1).padStart(2, "0");
export const escenaColor = (i: number) => `/colorear/escenas/escena-${num(i)}.webp`;
export const escenaLineas = (i: number) => `/colorear/escenas/escena-${num(i)}-lineas.webp`;

export const PAGINAS_COLOREAR = ESCENAS_LISTAS ? ESCENAS.length + 2 : LOOKS_COLOREAR.length + 2;

export const lineArt = (c: PersonajeEstandar, t: LookKey) => `/colorear/${c}-${t === "ninguno" ? "base" : t}.webp`;

const PAGE_BREAK = { breakAfter: "page", pageBreakAfter: "always" } as const;

function Diploma({ name, img }: { name: string; img: string }) {
  return (
    <section className="flex min-h-[250mm] flex-col items-center justify-center gap-6 text-center">
      <div className="flex w-full flex-col items-center gap-5 rounded-3xl border-4 border-dashed border-brand p-10">
        <p className="text-lg font-semibold tracking-wide text-brand">{BRAND}</p>
        <h2 className="font-display text-5xl font-semibold text-foreground">Diploma de Artista</h2>
        <p className="text-lg text-muted-foreground">Se otorga con orgullo a</p>
        <p className="font-display text-6xl font-semibold text-brand-deep">{name}</p>
        <img src={img} alt="" className="max-h-[90mm] object-contain" />
        <p className="max-w-md text-lg text-foreground">por llenar de color cada página de su libro.</p>
        <p className="mt-4 text-sm text-muted-foreground">Fecha: ____ / ____ / ________</p>
      </div>
    </section>
  );
}

function LibroEscenas({ name }: { name: string }) {
  return (
    <div className="print-kit hidden print:block" aria-hidden>
      <section style={PAGE_BREAK} className="flex min-h-[250mm] flex-col items-center justify-center gap-6 text-center">
        <p className="text-lg font-semibold tracking-wide text-brand">{BRAND} · MiniMundos Color</p>
        <h1 className="font-display text-5xl font-semibold text-foreground">Los MiniMundos de {name}</h1>
        <div className="grid w-full max-w-[150mm] grid-cols-2 gap-4">
          {[3, 5, 9, 12].map((i) => (
            <img key={i} src={escenaColor(i)} alt="" className="aspect-[3/4] w-full rounded-2xl object-cover" />
          ))}
        </div>
        <p className="text-base text-muted-foreground">{ESCENAS.length} escenas para pintar con tus colores favoritos.</p>
      </section>

      {ESCENAS.map((e, i) => (
        <section key={e.titulo} style={PAGE_BREAK} className="flex min-h-[250mm] flex-col gap-4">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-sm font-semibold tracking-wide text-brand">
                MINIMUNDOS COLOR · {i + 1} DE {ESCENAS.length}
              </p>
              <h2 className="mt-1 font-display text-3xl font-semibold text-foreground">{e.titulo}</h2>
              <p className="mt-2 text-sm text-muted-foreground">Artista: {name}</p>
            </div>
            <figure className="w-[34mm] shrink-0 rounded-xl border border-border p-1.5 text-center">
              <img src={escenaColor(i)} alt="" className="w-full rounded-lg" />
              <figcaption className="mt-1 text-[9pt] text-muted-foreground">Guía de colores</figcaption>
            </figure>
          </div>
          <img src={escenaLineas(i)} alt="" className="mx-auto max-h-[205mm] w-full object-contain" />
        </section>
      ))}

      <Diploma name={name} img={escenaLineas(3)} />
    </div>
  );
}

function LibroLooks({ name, personaje }: { name: string; personaje: PersonajeEstandar }) {
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

      <Diploma name={name} img={lineArt(personaje, "realeza")} />
    </div>
  );
}

export function LibroColorearImprimible({ name, personaje }: { name: string; personaje: PersonajeEstandar }) {
  return ESCENAS_LISTAS ? <LibroEscenas name={name} /> : <LibroLooks name={name} personaje={personaje} />;
}
