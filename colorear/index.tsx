import { createFileRoute } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { Download, Palette, Printer } from "lucide-react";

import { Button } from "@/components/ui/button";

// Producto extra de Papelitos (order bump): libro para colorear con el nombre del niño.
const BRAND = "Papelitos";
const PRODUCT = "Papelitos para colorear";

// "  mateo   josé " -> "Mateo José": así el nombre siempre se ve bien impreso.
function formatName(raw: string): string {
  return raw
    .trim()
    .replace(/\s+/g, " ")
    .split(" ")
    .map((word) => (word ? word.charAt(0).toLocaleUpperCase("es") + word.slice(1) : word))
    .join(" ");
}

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: `${PRODUCT}: el libro para colorear con su nombre` },
      {
        name: "description",
        content: "Escribe el nombre de tu hijo, elige su personaje y descarga su libro para colorear: su héroe en 7 looks para pintar y su diploma de artista.",
      },
      { property: "og:title", content: `${PRODUCT}: su héroe, listo para pintar` },
      { property: "og:description", content: "Su personaje en 7 looks para colorear, con su nombre en cada página. Imprímelo en casa." },
    ],
  }),
  component: ColoringApp,
});

type Character = "nino" | "nina" | "nino2" | "nina2";
type ThemeKey = "ninguno" | "superheroe" | "pirata" | "astronauta" | "mago" | "guerreiro" | "realeza";

const CHARACTERS: { key: Character; label: string }[] = [
  { key: "nino", label: "Niño" },
  { key: "nina", label: "Niña" },
  { key: "nino2", label: "Niño 2" },
  { key: "nina2", label: "Niña 2" },
];

const THEMES: { key: ThemeKey; label: string }[] = [
  { key: "ninguno", label: "Normal" },
  { key: "superheroe", label: "Superhéroe" },
  { key: "pirata", label: "Pirata" },
  { key: "astronauta", label: "Astronauta" },
  { key: "mago", label: "Mago/Bruja" },
  { key: "guerreiro", label: "Guerrero" },
  { key: "realeza", label: "Realeza" },
];

const file = (c: Character, t: ThemeKey) => `${c}-${t === "ninguno" ? "base" : t}.webp`;
const lineArt = (c: Character, t: ThemeKey) => `/colorear/${file(c, t)}`;
const mini = (c: Character, t: ThemeKey) => `/personajes/mini/${file(c, t)}`;

// portada + 7 páginas para colorear + diploma
const TOTAL_PAGES = 1 + THEMES.length + 1;

const PAGE_BREAK = { breakAfter: "page", pageBreakAfter: "always" } as const;

function PrintBook({ name, character }: { name: string; character: Character }) {
  return (
    <div className="print-kit hidden print:block" aria-hidden>
      <section style={PAGE_BREAK} className="flex min-h-[250mm] flex-col items-center justify-center gap-6 text-center">
        <p className="text-lg font-semibold tracking-wide text-brand">{BRAND}</p>
        <h1 className="font-display text-5xl font-semibold text-foreground">El libro para colorear de {name}</h1>
        <img src={lineArt(character, "superheroe")} alt="" className="max-h-[160mm] object-contain" />
        <p className="text-base text-muted-foreground">7 looks para pintar con tus colores favoritos.</p>
      </section>

      {THEMES.map((t) => (
        <section key={t.key} style={PAGE_BREAK} className="flex min-h-[250mm] flex-col items-center justify-center gap-5 text-center">
          <p className="text-sm font-semibold tracking-wide text-brand">
            PARA COLOREAR · {t.key === "ninguno" ? "LOOK NORMAL" : t.label.toUpperCase()}
          </p>
          <h2 className="font-display text-3xl font-semibold text-foreground">Colorea a {name}</h2>
          <img src={lineArt(character, t.key)} alt="" className="max-h-[200mm] object-contain" />
          <p className="text-sm text-muted-foreground">Usa tus colores favoritos y, si quieres, recórtalo por el borde.</p>
        </section>
      ))}

      <section className="flex min-h-[250mm] flex-col items-center justify-center gap-6 text-center">
        <div className="flex w-full flex-col items-center gap-5 rounded-3xl border-4 border-dashed border-brand p-10">
          <p className="text-lg font-semibold tracking-wide text-brand">{BRAND}</p>
          <h2 className="font-display text-5xl font-semibold text-foreground">Diploma de Artista</h2>
          <p className="text-lg text-muted-foreground">Se otorga con orgullo a</p>
          <p className="font-display text-6xl font-semibold text-brand-deep">{name}</p>
          <img src={lineArt(character, "realeza")} alt="" className="max-h-[100mm] object-contain" />
          <p className="max-w-md text-lg text-foreground">por llenar de color cada página de su libro.</p>
          <p className="mt-4 text-sm text-muted-foreground">Fecha: ____ / ____ / ________</p>
        </div>
      </section>
    </div>
  );
}

function StepTitle({ n, children }: { n: number; children: ReactNode }) {
  return (
    <span className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
      <span className="grid size-6 shrink-0 place-items-center rounded-full bg-brand text-xs font-bold text-primary-foreground">{n}</span>
      {children}
    </span>
  );
}

function ColoringApp() {
  const [character, setCharacter] = useState<Character>("nino");
  const [theme, setTheme] = useState<ThemeKey>("superheroe");
  const [rawName, setRawName] = useState("");
  const name = formatName(rawName);
  const who = name || (character === "nina" || character === "nina2" ? "Sofía" : "Mateo");
  const downloadLabel = name ? `Descargar el libro de ${name} (PDF)` : "Descargar su libro (PDF)";

  return (
    <>
      <main className="min-h-screen bg-background pb-28 print:hidden sm:pb-0">
        <header className="border-b border-border/60 bg-surface/70">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
            <span className="font-display text-lg font-semibold text-foreground">{PRODUCT}</span>
            <span className="hidden text-sm text-muted-foreground sm:inline">Su héroe, listo para pintar</span>
          </div>
        </header>

        <section className="mx-auto max-w-6xl px-5 py-8 sm:py-10">
          <div className="mb-8 max-w-2xl">
            <h1 className="font-display text-3xl font-semibold text-balance text-foreground sm:text-4xl">
              {name ? `El libro para colorear de ${name}` : "Crea el libro para colorear de tu hijo"}
            </h1>
            <p className="mt-3 leading-relaxed text-muted-foreground">
              Su personaje en los 7 looks, en líneas para pintar, con su nombre en cada página y un diploma de artista al final: {TOTAL_PAGES} páginas listas para imprimir.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-[minmax(0,360px)_1fr] md:items-start">
            <div className="mx-auto w-full max-w-[320px] md:sticky md:top-6 md:mx-0">
              <div className="flex aspect-[5/8] flex-col items-center justify-center gap-2 rounded-3xl bg-surface p-4 text-center shadow-lift">
                <p className="text-xs font-semibold tracking-wide text-brand">
                  PARA COLOREAR · {theme === "ninguno" ? "LOOK NORMAL" : THEMES.find((t) => t.key === theme)!.label.toUpperCase()}
                </p>
                <p className="font-display text-xl font-semibold">Colorea a {who}</p>
                <img src={lineArt(character, theme)} alt={`Página para colorear de ${who}`} className="min-h-0 flex-1 object-contain" />
              </div>
            </div>

            <div className="flex flex-col gap-7 rounded-3xl border border-border bg-surface p-5 shadow-soft sm:p-6">
              <div>
                <label htmlFor="hero-name">
                  <StepTitle n={1}>¿Cómo se llama tu artista?</StepTitle>
                </label>
                <input
                  id="hero-name"
                  type="text"
                  value={rawName}
                  maxLength={18}
                  onChange={(e) => setRawName(e.target.value)}
                  placeholder="Ej.: Mateo"
                  autoComplete="off"
                  autoCapitalize="words"
                  className="h-12 w-full rounded-xl border border-border bg-background px-4 text-base text-foreground outline-none transition-colors focus:border-brand"
                />
                <p className="mt-1.5 text-xs text-muted-foreground">Aparecerá en la portada, en cada página y en su diploma.</p>
              </div>

              <div>
                <StepTitle n={2}>Elige su personaje</StepTitle>
                <div className="grid grid-cols-4 gap-2">
                  {CHARACTERS.map((c) => {
                    const active = character === c.key;
                    return (
                      <button
                        key={c.key}
                        type="button"
                        onClick={() => setCharacter(c.key)}
                        aria-pressed={active}
                        className={`flex flex-col items-center gap-1 rounded-2xl border-2 bg-surface p-1.5 pb-2 text-xs font-medium transition-[transform,border-color] duration-150 ease-out active:scale-[0.97] ${
                          active ? "border-brand text-brand-deep" : "border-transparent text-foreground hover:border-border"
                        }`}
                      >
                        <img src={mini(c.key, "ninguno")} alt="" width={72} height={120} className="h-[96px] w-full object-contain" />
                        {c.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <StepTitle n={3}>Mira sus páginas</StepTitle>
                <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
                  {THEMES.map((t) => {
                    const active = theme === t.key;
                    return (
                      <button
                        key={t.key}
                        type="button"
                        onClick={() => setTheme(t.key)}
                        aria-pressed={active}
                        className={`flex flex-col items-center gap-1 rounded-2xl border-2 bg-surface p-1.5 pb-2 text-xs font-medium transition-[transform,border-color] duration-150 ease-out active:scale-[0.97] ${
                          active ? "border-brand text-brand-deep" : "border-transparent text-foreground hover:border-border"
                        }`}
                      >
                        <img src={lineArt(character, t.key)} alt="" width={72} height={120} loading="lazy" className="h-[84px] w-full object-contain" />
                        <span className="leading-tight">{t.label}</span>
                      </button>
                    );
                  })}
                </div>
                <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                  Las 7 páginas vienen en su libro, cada una con su nombre.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 rounded-3xl border border-brand/25 bg-mist/60 p-6">
            <div className="flex items-start gap-3">
              <Palette className="mt-0.5 size-5 shrink-0 text-brand" />
              <div>
                <p className="font-semibold text-foreground">{name ? `El libro de ${name}, listo para imprimir` : "Su libro completo para imprimir"}</p>
                <p className="text-sm text-muted-foreground">{TOTAL_PAGES} páginas: portada, 7 páginas para colorear con su nombre y su diploma de artista.</p>
              </div>
            </div>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <Button size="lg" className="shadow-cta" disabled={!name} onClick={() => window.print()}>
                <Download className="size-4" />
                {downloadLabel}
              </Button>
              <p className="text-sm text-muted-foreground">
                {name ? "En la ventana que se abre, elige “Guardar como PDF” o imprime directo." : "Escribe el nombre para activar la descarga."}
              </p>
            </div>
            <div className="mt-6 border-t border-brand/15 pt-5">
              <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Printer className="size-4 text-brand" />
                Para que quede perfecto al imprimir
              </p>
              <ul className="mt-2 space-y-1.5 text-sm leading-relaxed text-muted-foreground">
                <li>Papel común sirve. Si va a usar marcadores, mejor papel grueso para que no se traspase.</li>
                <li>Deja la escala en 100% o “Ajustar a la página”.</li>
                <li>En iPhone o iPad: toca Compartir, luego Imprimir, y desde ahí puedes guardar el PDF.</li>
                <li>¿Más de un hijo? Cambia el nombre y descarga otro libro, las veces que quieras.</li>
              </ul>
            </div>
          </div>
        </section>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/95 p-3 backdrop-blur-md print:hidden sm:hidden">
        <Button size="lg" className="h-12 w-full shadow-cta" disabled={!name} onClick={() => window.print()}>
          <Download className="size-4" />
          {name ? downloadLabel : "Escribe su nombre para descargar"}
        </Button>
      </div>

      {name ? <PrintBook name={name} character={character} /> : null}
    </>
  );
}
