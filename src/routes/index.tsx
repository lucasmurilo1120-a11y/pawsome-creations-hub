import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Download, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Héroes de Papel — Crea tu personaje" },
      {
        name: "description",
        content:
          "Elegí el personaje y el tema de tu Héroe de Papel, mirá cómo queda y descargá tu kit para imprimir, recortar y jugar.",
      },
      { property: "og:title", content: "Héroes de Papel — Crea tu personaje" },
      {
        property: "og:description",
        content: "Personalizá tu personaje y descargá el kit completo para imprimir en casa.",
      },
    ],
  }),
  component: CreatorApp,
});

// ---------------------------------------------------------------------------
// Option data — plan Básico: 2 personajes base x 4 temas ilustrados (+ "Sin
// tema"). Cada combinación es una ilustración completa generada por IA
// (pelo, ropa y accesorios ya combinados) — no un doll armado pieza por
// pieza, así que no hay guardarropa modular acá.
// ---------------------------------------------------------------------------

type Character = "nino" | "nina";
type ThemeKey = "ninguno" | "superheroe" | "pirata" | "astronauta" | "mago";

const CHARACTERS: { key: Character; label: string; emoji: string }[] = [
  { key: "nino", label: "Niño", emoji: "👦" },
  { key: "nina", label: "Niña", emoji: "👧" },
];

const THEMES: { key: ThemeKey; label: string; emoji: string }[] = [
  { key: "ninguno", label: "Sin tema", emoji: "✨" },
  { key: "superheroe", label: "Superhéroe", emoji: "🦸" },
  { key: "pirata", label: "Pirata", emoji: "🏴‍☠️" },
  { key: "astronauta", label: "Astronauta", emoji: "🚀" },
  { key: "mago", label: "Mago/Bruja", emoji: "🧙" },
];

// Un look ilustrado por personaje x tema.
const CHARACTER_IMAGES: Record<Character, Record<ThemeKey, string>> = {
  nino: {
    ninguno: "/personajes/nino-base.webp",
    superheroe: "/personajes/nino-superheroe.webp",
    pirata: "/personajes/nino-pirata.webp",
    astronauta: "/personajes/nino-astronauta.webp",
    mago: "/personajes/nino-mago.webp",
  },
  nina: {
    ninguno: "/personajes/nina-base.webp",
    superheroe: "/personajes/nina-superheroe.webp",
    pirata: "/personajes/nina-pirata.webp",
    astronauta: "/personajes/nina-astronauta.webp",
    mago: "/personajes/nina-mago.webp",
  },
};

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

function ThemePicker({ value, onChange }: { value: ThemeKey; onChange: (key: ThemeKey) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {THEMES.map((t) => (
        <button
          key={t.key}
          type="button"
          onClick={() => onChange(t.key)}
          className={`flex items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-medium transition-colors ${
            value === t.key
              ? "border-brand bg-brand text-primary-foreground shadow-cta"
              : "border-border bg-surface text-foreground hover:bg-mist"
          }`}
        >
          <span aria-hidden>{t.emoji}</span>
          {t.label}
        </button>
      ))}
    </div>
  );
}

function CreatorApp() {
  const [character, setCharacter] = useState<Character>("nino");
  const [theme, setTheme] = useState<ThemeKey>("ninguno");

  const summary = useMemo(() => {
    const c = CHARACTERS.find((x) => x.key === character)!.label;
    const t = THEMES.find((x) => x.key === theme)!.label;
    return theme === "ninguno" ? c : `${c} · ${t}`;
  }, [character, theme]);

  const imageSrc = CHARACTER_IMAGES[character][theme];

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-border/60 bg-surface/70">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <span className="font-display text-lg font-semibold text-foreground">Héroes de Papel</span>
          <span className="hidden text-sm text-muted-foreground sm:inline">Crea tu personaje</span>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-5 py-10">
        <div className="mb-8 max-w-2xl">
          <p className="text-sm font-semibold text-brand">Tu kit, a tu manera</p>
          <h1 className="mt-2 font-display text-3xl font-semibold text-balance text-foreground sm:text-4xl">
            Elegí el personaje y el tema — y mirá tu héroe cobrar vida
          </h1>
          <p className="mt-3 leading-relaxed text-muted-foreground">
            Esto es una vista previa interactiva. Tu kit para imprimir incluye los 2 personajes base, los 4 temas
            ilustrados y las 4 historias — no solo la combinación que elijas aquí.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-[minmax(0,320px)_1fr] md:items-start">
          {/* Preview */}
          <div className="mx-auto w-full max-w-[280px] md:mx-0">
            <div className="flex aspect-[5/8] items-center justify-center rounded-3xl bg-surface p-4 shadow-lift">
              <img
                src={imageSrc}
                alt={`Ilustración de ${summary}`}
                className="max-h-full max-w-full object-contain"
              />
            </div>
            <p className="mt-3 text-center text-sm font-semibold text-brand-deep">{summary}</p>
          </div>

          {/* Controls */}
          <div className="flex flex-col gap-6 rounded-3xl border border-border bg-surface p-6 shadow-soft">
            <div>
              <p className="mb-2 text-sm font-semibold text-foreground">Personaje</p>
              <div className="flex gap-2">
                {CHARACTERS.map((c) => (
                  <button
                    key={c.key}
                    type="button"
                    onClick={() => setCharacter(c.key)}
                    className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                      character === c.key
                        ? "border-brand bg-brand text-primary-foreground"
                        : "border-border bg-surface text-foreground hover:bg-mist"
                    }`}
                  >
                    <span aria-hidden>{c.emoji}</span>
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2 text-sm font-semibold text-foreground">Tema</p>
              <ThemePicker value={theme} onChange={setTheme} />
            </div>

            <p className="text-sm leading-relaxed text-muted-foreground">
              Cada tema es una ilustración completa —pelo, ropa y accesorios ya combinados por nuestro equipo—
              lista para imprimir y recortar.
            </p>
          </div>
        </div>

        {/* Download */}
        <div className="mt-10 rounded-3xl border border-brand/25 bg-mist/60 p-6">
          <div className="flex items-start gap-3">
            <Sparkles className="mt-0.5 size-5 shrink-0 text-brand" />
            <div>
              <p className="font-semibold text-foreground">Tu kit completo para imprimir</p>
              <p className="text-sm text-muted-foreground">
                3 PDF listos para imprimir: los 2 muñecos base con los 4 temas ilustrados y las 4 historias.
              </p>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <Button asChild size="lg" className="shadow-cta">
              <a href="/descargas/heroes-de-papel-nino.pdf" download>
                <Download className="size-4" />
                Muñeco niño (PDF)
              </a>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <a href="/descargas/heroes-de-papel-nina.pdf" download>
                <Download className="size-4" />
                Muñeca niña (PDF)
              </a>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <a href="/descargas/heroes-de-papel-historias.pdf" download>
                <Download className="size-4" />
                4 historias (PDF)
              </a>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
