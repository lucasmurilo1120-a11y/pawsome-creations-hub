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
// tema"). Dos formas de jugar con la vista previa:
//   1) "Looks completos": una ilustración entera por personaje x tema.
//   2) "Armá tu combo": accesorios sueltos (cabeza / mano / capa) que se
//      combinan libremente entre sí y entre personajes, superpuestos sobre
//      el personaje base.
// ---------------------------------------------------------------------------

type Character = "nino" | "nina";
type ThemeKey = "ninguno" | "superheroe" | "pirata" | "astronauta" | "mago";
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
// Piezas sueltas — mismos accesorios sirven para niño y niña, y se pueden
// mezclar sin importar de qué tema vinieron originalmente.
// ---------------------------------------------------------------------------

type HeadKey =
  | "ninguno"
  | "mascara-heroi"
  | "bandana-pirata"
  | "capacete-astronauta"
  | "chapeu-mago"
  | "coroa"
  | "elmo-guerreiro";

type HandKey = "ninguno" | "luneta-pirata" | "varinha-magica" | "espada-guerreiro" | "escudo-heroi";

type CapeKey =
  | "ninguno"
  | "capa-heroi"
  | "colete-pirata"
  | "manto-mago"
  | "manto-gala"
  | "traje-espacial"
  | "manto-heroi"
  | "sobretudo-pirata"
  | "armadura-guerreiro"
  | "manto-real";

type Piece<K extends string> = { key: K; label: string; img?: string };

const HEAD_PIECES: Piece<HeadKey>[] = [
  { key: "ninguno", label: "Ninguno" },
  { key: "mascara-heroi", label: "Máscara de héroe", img: "/piezas/mascara-heroi.webp" },
  { key: "bandana-pirata", label: "Bandana pirata", img: "/piezas/bandana-pirata.webp" },
  { key: "capacete-astronauta", label: "Casco espacial", img: "/piezas/capacete-astronauta.webp" },
  { key: "chapeu-mago", label: "Sombrero de mago", img: "/piezas/chapeu-mago.webp" },
  { key: "coroa", label: "Corona", img: "/piezas/coroa.webp" },
  { key: "elmo-guerreiro", label: "Casco de guerrero", img: "/piezas/elmo-guerreiro.webp" },
];

const HAND_PIECES: Piece<HandKey>[] = [
  { key: "ninguno", label: "Ninguno" },
  { key: "luneta-pirata", label: "Catalejo", img: "/piezas/luneta-pirata.webp" },
  { key: "varinha-magica", label: "Varita mágica", img: "/piezas/varinha-magica.webp" },
  { key: "espada-guerreiro", label: "Espada", img: "/piezas/espada-guerreiro.webp" },
  { key: "escudo-heroi", label: "Escudo", img: "/piezas/escudo-heroi.webp" },
];

const CAPE_PIECES: Piece<CapeKey>[] = [
  { key: "ninguno", label: "Ninguno" },
  { key: "capa-heroi", label: "Capa de héroe", img: "/piezas/capa-heroi.webp" },
  { key: "manto-heroi", label: "Traje de héroe", img: "/piezas/manto-heroi.webp" },
  { key: "colete-pirata", label: "Chaleco pirata", img: "/piezas/colete-pirata.webp" },
  { key: "sobretudo-pirata", label: "Abrigo pirata", img: "/piezas/sobretudo-pirata.webp" },
  { key: "manto-mago", label: "Manto de mago", img: "/piezas/manto-mago.webp" },
  { key: "manto-gala", label: "Manto de gala", img: "/piezas/manto-gala.webp" },
  { key: "traje-espacial", label: "Traje espacial", img: "/piezas/traje-espacial.webp" },
  { key: "armadura-guerreiro", label: "Armadura de guerrero", img: "/piezas/armadura-guerreiro.webp" },
  { key: "manto-real", label: "Manto real", img: "/piezas/manto-real.webp" },
];

// Zonas de superposición (en % del escenario, que respeta la proporción de
// la ilustración base) para cada categoría de pieza.
const HEAD_ZONE = { top: "1%", left: "23%", width: "54%", height: "37%" };
const HAND_ZONE = { top: "53%", left: "57%", width: "38%", height: "27%" };
const CAPE_ZONE = { top: "21%", left: "11%", width: "78%", height: "64%" };

// Tamaño natural de cada ilustración base — se usa como atributo width/height
// del <img> para que el navegador reserve el alto correcto (vía su propio
// aspect ratio) sin depender de la utilidad CSS aspect-ratio.
const CHARACTER_NATURAL_SIZE: Record<Character, { w: number; h: number }> = {
  nino: { w: 370, h: 396 },
  nina: { w: 376, h: 398 },
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

function PieceSwatches<K extends string>({
  options,
  value,
  onChange,
}: {
  options: Piece<K>[];
  value: K;
  onChange: (key: K) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt.key}
          type="button"
          onClick={() => onChange(opt.key)}
          title={opt.label}
          aria-label={opt.label}
          aria-pressed={value === opt.key}
          className={`flex size-14 shrink-0 items-center justify-center rounded-xl border-2 bg-surface p-1.5 transition-colors ${
            value === opt.key ? "border-brand shadow-cta" : "border-border hover:bg-mist"
          }`}
        >
          {opt.img ? (
            <img src={opt.img} alt={opt.label} className="max-h-full max-w-full object-contain" />
          ) : (
            <span className="text-lg text-muted-foreground" aria-hidden>
              ✕
            </span>
          )}
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

function ComboStage({
  character,
  head,
  hand,
  cape,
}: {
  character: Character;
  head: HeadKey;
  hand: HandKey;
  cape: CapeKey;
}) {
  const baseSrc = CHARACTER_IMAGES[character].ninguno;
  const { w: naturalW, h: naturalH } = CHARACTER_NATURAL_SIZE[character];
  const headPiece = HEAD_PIECES.find((p) => p.key === head);
  const handPiece = HAND_PIECES.find((p) => p.key === hand);
  const capePiece = CAPE_PIECES.find((p) => p.key === cape);

  return (
    // Sin aspect-ratio: el <img> base queda en flujo normal (width 100% +
    // height auto), así que es ÉL quien define el alto real del contenedor
    // según su proporción natural. Esto es más robusto que depender de la
    // utilidad aspect-[w/h] combinada con hijos absolutos — las piezas
    // superpuestas (absolute + %) ahora miden su posición contra un alto que
    // siempre está resuelto.
    <div className="relative w-full">
      <img
        src={baseSrc}
        alt=""
        width={naturalW}
        height={naturalH}
        className="block h-auto w-full select-none"
        draggable={false}
      />
      {capePiece?.img && (
        <div className="pointer-events-none absolute flex items-center justify-center" style={CAPE_ZONE}>
          <img src={capePiece.img} alt={capePiece.label} className="max-h-full max-w-full object-contain" />
        </div>
      )}
      {handPiece?.img && (
        <div className="pointer-events-none absolute flex items-center justify-center" style={HAND_ZONE}>
          <img src={handPiece.img} alt={handPiece.label} className="max-h-full max-w-full object-contain" />
        </div>
      )}
      {headPiece?.img && (
        <div className="pointer-events-none absolute flex items-center justify-center" style={HEAD_ZONE}>
          <img src={headPiece.img} alt={headPiece.label} className="max-h-full max-w-full object-contain" />
        </div>
      )}
    </div>
  );
}

function CreatorApp() {
  const [mode, setMode] = useState<Mode>("looks");
  const [character, setCharacter] = useState<Character>("nino");
  const [theme, setTheme] = useState<ThemeKey>("ninguno");

  const [head, setHead] = useState<HeadKey>("ninguno");
  const [hand, setHand] = useState<HandKey>("ninguno");
  const [cape, setCape] = useState<CapeKey>("ninguno");

  const summary = useMemo(() => {
    const c = CHARACTERS.find((x) => x.key === character)!.label;
    if (mode === "looks") {
      const t = THEMES.find((x) => x.key === theme)!.label;
      return theme === "ninguno" ? c : `${c} · ${t}`;
    }
    const parts = [
      HEAD_PIECES.find((p) => p.key === head)!.label,
      HAND_PIECES.find((p) => p.key === hand)!.label,
      CAPE_PIECES.find((p) => p.key === cape)!.label,
    ].filter((label) => label !== "Ninguno");
    return parts.length ? `${c} · ${parts.join(" + ")}` : c;
  }, [mode, character, theme, head, hand, cape]);

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
                  <ComboStage character={character} head={head} hand={hand} cape={cape} />
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
                  <PieceSwatches options={HEAD_PIECES} value={head} onChange={setHead} />
                </div>

                <div>
                  <p className="mb-2 text-sm font-semibold text-foreground">Mano</p>
                  <PieceSwatches options={HAND_PIECES} value={hand} onChange={setHand} />
                </div>

                <div>
                  <p className="mb-2 text-sm font-semibold text-foreground">Capa / Vestimenta</p>
                  <PieceSwatches options={CAPE_PIECES} value={cape} onChange={setCape} />
                </div>

                <p className="text-sm leading-relaxed text-muted-foreground">
                  Combiná cada accesorio como quieras: el sombrero de un tema con la capa de otro — ¡la combinación
                  es toda tuya!
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
