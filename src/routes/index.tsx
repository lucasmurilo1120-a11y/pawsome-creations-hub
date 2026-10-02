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
// Option data — plan Básico: 2 personajes base x temas ilustrados (+ "Sin
// tema"). Dos formas de jugar con la vista previa:
//   1) "Looks completos": una ilustración entera por personaje x tema.
//   2) "Armá tu combo": la cabeza, el torso y las piernas se eligen por
//      separado, cada una de un tema distinto si se quiere. Cada pieza es el
//      recorte real de esa ilustración (no un accesorio puesto encima de un
//      cuerpo fijo), así que siempre encaja con el resto del cuerpo elegido.
// ---------------------------------------------------------------------------

type Character = "nino" | "nina";
type ThemeKey = "ninguno" | "superheroe" | "pirata" | "astronauta" | "mago" | "guerreiro" | "realeza";
type Mode = "looks" | "combo";

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
  { key: "guerreiro", label: "Guerrero", emoji: "🛡️" },
  { key: "realeza", label: "Realeza", emoji: "👑" },
];

// Un look ilustrado por personaje x tema.
const CHARACTER_IMAGES: Record<Character, Record<ThemeKey, string>> = {
  nino: {
    ninguno: "/personajes/nino-base.webp",
    superheroe: "/personajes/nino-superheroe.webp",
    pirata: "/personajes/nino-pirata.webp",
    astronauta: "/personajes/nino-astronauta.webp",
    mago: "/personajes/nino-mago.webp",
    guerreiro: "/personajes/nino-guerreiro.webp",
    realeza: "/personajes/nino-realeza.webp",
  },
  nina: {
    ninguno: "/personajes/nina-base.webp",
    superheroe: "/personajes/nina-superheroe.webp",
    pirata: "/personajes/nina-pirata.webp",
    astronauta: "/personajes/nina-astronauta.webp",
    mago: "/personajes/nina-mago.webp",
    guerreiro: "/personajes/nina-guerreiro.webp",
    realeza: "/personajes/nina-realeza.webp",
  },
};

// ---------------------------------------------------------------------------
// Armá tu combo — cada ilustración está cortada en 3 franjas (cabeza / torso
// / piernas) en el mismo punto relativo para todos los temas, así cualquier
// cabeza encaja con cualquier torso y con cualquier par de piernas: lo que
// cambia es la parte entera de esa ilustración, no un accesorio suelto.
//
// "astronauta" y "mago" quedan afuera de este modo por ahora: el casco y el
// sombrero todavía salen más anchos que el hombro del cuerpo en algunas
// combinaciones (medido, no es una sospecha) — entran en cuanto la nueva
// versión pase la misma prueba que los demás temas.
// ---------------------------------------------------------------------------

type PartKey = "cabeza" | "torso" | "piernas";
type PartThemeKey = "base" | "superheroe" | "pirata" | "astronauta" | "mago" | "guerreiro" | "realeza";

const PART_THEMES: { key: PartThemeKey; label: string; emoji: string; enabled: boolean }[] = [
  { key: "base", label: "Normal", emoji: "✨", enabled: true },
  { key: "superheroe", label: "Superhéroe", emoji: "🦸", enabled: true },
  { key: "pirata", label: "Pirata", emoji: "🏴‍☠️", enabled: true },
  { key: "guerreiro", label: "Guerrero", emoji: "🛡️", enabled: true },
  { key: "realeza", label: "Realeza", emoji: "👑", enabled: true },
  { key: "astronauta", label: "Astronauta", emoji: "🚀", enabled: false },
  { key: "mago", label: "Mago/Bruja", emoji: "🧙", enabled: false },
];

function partImg(character: Character, theme: PartThemeKey, part: PartKey) {
  return `/partes/${character}-${theme}-${part}.webp`;
}

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

function PartPicker({
  character,
  part,
  value,
  onChange,
}: {
  character: Character;
  part: PartKey;
  value: PartThemeKey;
  onChange: (key: PartThemeKey) => void;
}) {
  const options = PART_THEMES.filter((t) => t.enabled);
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((t) => (
        <button
          key={t.key}
          type="button"
          onClick={() => onChange(t.key)}
          title={t.label}
          aria-label={t.label}
          aria-pressed={value === t.key}
          className={`flex size-14 shrink-0 items-center justify-center rounded-xl border-2 bg-surface p-1.5 transition-colors ${
            value === t.key ? "border-brand shadow-cta" : "border-border hover:bg-mist"
          }`}
        >
          <img
            src={partImg(character, t.key, part)}
            alt={t.label}
            className="max-h-full max-w-full object-contain"
          />
        </button>
      ))}
    </div>
  );
}

function ModeTabs({ value, onChange }: { value: Mode; onChange: (m: Mode) => void }) {
  const tabs: { key: Mode; label: string }[] = [
    { key: "looks", label: "Looks completos" },
    { key: "combo", label: "Armá tu combo" },
  ];
  return (
    <div className="inline-flex gap-1 rounded-full border border-border bg-surface p-1">
      {tabs.map((t) => (
        <button
          key={t.key}
          type="button"
          onClick={() => onChange(t.key)}
          className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
            value === t.key ? "bg-brand text-primary-foreground shadow-cta" : "text-foreground hover:bg-mist"
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

function PartsStage({
  character,
  headTheme,
  torsoTheme,
  legsTheme,
  label,
}: {
  character: Character;
  headTheme: PartThemeKey;
  torsoTheme: PartThemeKey;
  legsTheme: PartThemeKey;
  label: string;
}) {
  return (
    <div className="flex w-full flex-col" role="img" aria-label={`Ilustración de ${label}`}>
      <img
        src={partImg(character, headTheme, "cabeza")}
        alt=""
        className="block w-full select-none"
        draggable={false}
      />
      <img
        src={partImg(character, torsoTheme, "torso")}
        alt=""
        className="block w-full select-none"
        draggable={false}
      />
      <img
        src={partImg(character, legsTheme, "piernas")}
        alt=""
        className="block w-full select-none"
        draggable={false}
      />
    </div>
  );
}

function CreatorApp() {
  const [mode, setMode] = useState<Mode>("looks");
  const [character, setCharacter] = useState<Character>("nino");
  const [theme, setTheme] = useState<ThemeKey>("ninguno");

  const [headTheme, setHeadTheme] = useState<PartThemeKey>("base");
  const [torsoTheme, setTorsoTheme] = useState<PartThemeKey>("base");
  const [legsTheme, setLegsTheme] = useState<PartThemeKey>("base");

  const summary = useMemo(() => {
    const c = CHARACTERS.find((x) => x.key === character)!.label;
    if (mode === "looks") {
      const t = THEMES.find((x) => x.key === theme)!.label;
      return theme === "ninguno" ? c : `${c} · ${t}`;
    }
    const partLabel = (key: PartThemeKey) => PART_THEMES.find((p) => p.key === key)!.label;
    const parts = [
      headTheme !== "base" ? `Cabeza ${partLabel(headTheme)}` : null,
      torsoTheme !== "base" ? `Torso ${partLabel(torsoTheme)}` : null,
      legsTheme !== "base" ? `Piernas ${partLabel(legsTheme)}` : null,
    ].filter((label): label is string => label !== null);
    return parts.length ? `${c} · ${parts.join(" + ")}` : c;
  }, [mode, character, theme, headTheme, torsoTheme, legsTheme]);

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
            Elegí un look completo, o armá tu propia combinación
          </h1>
          <p className="mt-3 leading-relaxed text-muted-foreground">
            Esto es una vista previa interactiva. Tu kit para imprimir incluye los 2 personajes base, los 4 temas
            ilustrados y las 4 historias — no solo la combinación que elijas aquí.
          </p>
        </div>

        <div className="mb-6">
          <ModeTabs value={mode} onChange={setMode} />
        </div>

        <div className="grid gap-8 md:grid-cols-[minmax(0,320px)_1fr] md:items-start">
          {/* Preview */}
          <div className="mx-auto w-full max-w-[280px] md:mx-0">
            <div className="flex aspect-[5/8] items-center justify-center rounded-3xl bg-surface p-4 shadow-lift">
              {mode === "looks" ? (
                <img
                  src={imageSrc}
                  alt={`Ilustración de ${summary}`}
                  className="max-h-full max-w-full object-contain"
                />
              ) : (
                <div className="w-full max-w-[220px]">
                  <PartsStage
                    character={character}
                    headTheme={headTheme}
                    torsoTheme={torsoTheme}
                    legsTheme={legsTheme}
                    label={summary}
                  />
                </div>
              )}
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

            {mode === "looks" ? (
              <>
                <div>
                  <p className="mb-2 text-sm font-semibold text-foreground">Tema</p>
                  <ThemePicker value={theme} onChange={setTheme} />
                </div>

                <p className="text-sm leading-relaxed text-muted-foreground">
                  Cada tema es una ilustración completa —pelo, ropa y accesorios ya combinados por nuestro equipo—
                  lista para imprimir y recortar.
                </p>
              </>
            ) : (
              <>
                <div>
                  <p className="mb-2 text-sm font-semibold text-foreground">Cabeza</p>
                  <PartPicker character={character} part="cabeza" value={headTheme} onChange={setHeadTheme} />
                </div>

                <div>
                  <p className="mb-2 text-sm font-semibold text-foreground">Torso</p>
                  <PartPicker character={character} part="torso" value={torsoTheme} onChange={setTorsoTheme} />
                </div>

                <div>
                  <p className="mb-2 text-sm font-semibold text-foreground">Piernas</p>
                  <PartPicker character={character} part="piernas" value={legsTheme} onChange={setLegsTheme} />
                </div>

                <p className="text-sm leading-relaxed text-muted-foreground">
                  Elegí el tema de cada parte del cuerpo por separado: la cabeza de un tema, el torso de otro y las
                  piernas de otro. Cada parte es el recorte real de esa ilustración, así que siempre encaja bien con
                  el resto.
                </p>
              </>
            )}
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
