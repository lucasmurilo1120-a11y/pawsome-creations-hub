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
          "Elegí el pelo, la ropa y el tema de tu Héroe de Papel, mirá cómo queda y descargá tu kit para imprimir, recortar y jugar.",
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
// Option data (mirrors the printed wardrobe sheets: 3 shirts, 3 pants, 3 shoes,
// 3 caps, shared between both base dolls; plus the 4 theme niches already
// illustrated for the story booklet).
// ---------------------------------------------------------------------------

type Character = "nino" | "nina";
type ShirtKey = "estrella" | "rayas" | "bolsillo";
type PantsKey = "ink" | "mostaza" | "terracota";
type ShoesKey = "blanco" | "celeste" | "verde";
type CapKey = "estrella" | "celeste" | "mostaza";
type ThemeKey = "ninguno" | "superheroe" | "pirata" | "astronauta" | "mago";

const CHARACTERS: { key: Character; label: string; emoji: string }[] = [
  { key: "nino", label: "Niño", emoji: "👦" },
  { key: "nina", label: "Niña", emoji: "👧" },
];

const SHIRTS: { key: ShirtKey; label: string; swatch: string }[] = [
  { key: "estrella", label: "Estrella", swatch: "var(--brand)" },
  { key: "rayas", label: "Rayas", swatch: "var(--surface)" },
  { key: "bolsillo", label: "Bolsillo", swatch: "var(--green)" },
];

const PANTS: { key: PantsKey; label: string; swatch: string }[] = [
  { key: "ink", label: "Ink", swatch: "var(--ink)" },
  { key: "mostaza", label: "Mostaza", swatch: "var(--amber)" },
  { key: "terracota", label: "Terracota", swatch: "var(--brand-deep)" },
];

const SHOES: { key: ShoesKey; label: string; swatch: string }[] = [
  { key: "blanco", label: "Blanco", swatch: "var(--surface)" },
  { key: "celeste", label: "Celeste", swatch: "var(--sky)" },
  { key: "verde", label: "Verde", swatch: "var(--green)" },
];

const CAPS: { key: CapKey; label: string; swatch: string }[] = [
  { key: "estrella", label: "Estrella", swatch: "var(--brand)" },
  { key: "celeste", label: "Celeste", swatch: "var(--sky)" },
  { key: "mostaza", label: "Mostaza", swatch: "var(--amber)" },
];

const THEMES: { key: ThemeKey; label: string; emoji: string }[] = [
  { key: "ninguno", label: "Sin tema", emoji: "✨" },
  { key: "superheroe", label: "Superhéroe", emoji: "🦸" },
  { key: "pirata", label: "Pirata", emoji: "🏴‍☠️" },
  { key: "astronauta", label: "Astronauta", emoji: "🚀" },
  { key: "mago", label: "Mago/Bruja", emoji: "🧙" },
];

// A theme with its own headwear hides the wardrobe cap option (it would be
// invisible under the helmet/hat, or clash visually).
const THEME_HIDES_CAP: Record<ThemeKey, boolean> = {
  ninguno: false,
  superheroe: false,
  pirata: true,
  astronauta: true,
  mago: true,
};

// ---------------------------------------------------------------------------
// Character illustration — ported from the print-ready sheets
// (checkpoint-menino.html / checkpoint-menina.html) and the 4 story-booklet
// theme illustrations, all sharing the same 400×640 doll geometry.
// ---------------------------------------------------------------------------

function ShirtShape({ shirt }: { shirt: ShirtKey }) {
  const fill = shirt === "estrella" ? "var(--brand)" : shirt === "bolsillo" ? "var(--green)" : "var(--surface)";
  const stroke =
    shirt === "estrella"
      ? "var(--brand-deep)"
      : shirt === "bolsillo"
        ? "color-mix(in oklab, var(--green) 60%, var(--ink))"
        : "var(--brand-deep)";
  return (
    <>
      <path
        d="M136 196 Q200 168 264 196 L272 350 Q200 378 128 350 Z"
        fill={fill}
        stroke={stroke}
        strokeWidth={2.5}
      />
      {shirt === "estrella" && (
        <path d="M178 240 L200 214 L222 240 L210 240 L210 292 L190 292 L190 240 Z" fill="var(--amber)" />
      )}
      {shirt === "rayas" && (
        <g stroke="var(--sky)" strokeWidth={10}>
          <line x1="150" y1="230" x2="250" y2="230" />
          <line x1="150" y1="260" x2="250" y2="260" />
          <line x1="150" y1="290" x2="250" y2="290" />
        </g>
      )}
      {shirt === "bolsillo" && (
        <rect
          x="178"
          y="248"
          width="44"
          height="34"
          rx="6"
          fill="none"
          stroke="color-mix(in oklab, var(--green) 40%, var(--ink))"
          strokeWidth={3}
        />
      )}
    </>
  );
}

function PantsShoesShape({ pants, shoes }: { pants: PantsKey; shoes: ShoesKey }) {
  const pantsFill =
    pants === "ink" ? "var(--ink)" : pants === "mostaza" ? "var(--amber)" : "var(--brand-deep)";
  const shoesFill = shoes === "blanco" ? "var(--surface)" : shoes === "celeste" ? "var(--sky)" : "var(--green)";
  return (
    <>
      <path d="M158 372 L242 372 L250 424 Q200 440 150 424 Z" fill={pantsFill} />
      <rect x="164" y="416" width="44" height="132" rx="18" fill={pantsFill} />
      <rect x="212" y="416" width="44" height="132" rx="18" fill={pantsFill} />
      <path
        d="M156 540 Q156 522 178 520 L214 518 Q230 518 238 534 L240 548 Q240 558 228 558 L166 558 Q156 558 156 548 Z"
        fill={shoesFill}
        stroke="var(--ink)"
        strokeWidth={2.5}
      />
      <path
        d="M204 540 Q204 522 226 520 L262 518 Q278 518 286 534 L288 548 Q288 558 276 558 L214 558 Q204 558 204 548 Z"
        fill={shoesFill}
        stroke="var(--ink)"
        strokeWidth={2.5}
      />
    </>
  );
}

function CapShape({ cap }: { cap: CapKey }) {
  const fill = cap === "estrella" ? "var(--brand)" : cap === "celeste" ? "var(--sky)" : "var(--amber)";
  const brim =
    cap === "estrella"
      ? "var(--brand-deep)"
      : cap === "celeste"
        ? "color-mix(in oklab, var(--sky) 60%, var(--ink))"
        : "color-mix(in oklab, var(--amber) 60%, var(--ink))";
  return (
    <>
      <path d="M116 92 Q120 30 200 28 Q280 30 284 92 Z" fill={fill} stroke={brim} strokeWidth={2.5} />
      <path d="M108 92 Q200 110 292 92 L289 106 Q200 124 111 106 Z" fill={brim} />
      {cap === "estrella" && (
        <path
          d="M172 50 L200 24 L212 58 L236 60 L214 76 L222 100 L200 84 L178 102 L182 74 L158 68 Z"
          fill="var(--amber)"
        />
      )}
    </>
  );
}

function SuperheroCape() {
  return (
    <>
      <path d="M150 190 Q55 250 5 380 Q-25 460 15 555 Q65 495 125 470 Q105 330 150 190 Z" fill="var(--brand-deep)" />
      <path d="M250 190 Q345 250 395 380 Q425 460 385 555 Q335 495 275 470 Q295 330 250 190 Z" fill="var(--brand-deep)" />
      <path
        d="M150 190 Q100 280 70 380"
        stroke="color-mix(in oklab, var(--brand-deep) 60%, black)"
        strokeWidth={4}
        fill="none"
        opacity={0.5}
      />
      <path
        d="M250 190 Q300 280 330 380"
        stroke="color-mix(in oklab, var(--brand-deep) 60%, black)"
        strokeWidth={4}
        fill="none"
        opacity={0.5}
      />
    </>
  );
}

/** Renders the full customizable doll for either character, at viewBox 0 0 400 640. */
function DollSVG({
  character,
  shirt,
  pants,
  shoes,
  cap,
  theme,
}: {
  character: Character;
  shirt: ShirtKey;
  pants: PantsKey;
  shoes: ShoesKey;
  cap: CapKey;
  theme: ThemeKey;
}) {
  const isNino = character === "nino";
  const hair = isNino ? "var(--hair-nino)" : "var(--hair-nina)";
  const showCap = !THEME_HIDES_CAP[theme];

  return (
    <svg viewBox="0 0 400 640" className="h-full w-full">
      {theme === "superheroe" && <SuperheroCape />}

      {/* back arm */}
      <rect x="278" y="196" width="46" height="150" rx="23" fill="var(--skin)" transform="rotate(12 278 196)" />

      <PantsShoesShape pants={pants} shoes={shoes} />

      <ShirtShape shirt={shirt} />
      {theme === "astronauta" && (
        <>
          <rect x="178" y="250" width="44" height="36" rx="8" fill="var(--sky)" stroke="var(--ink)" strokeWidth={2} />
          <circle cx="200" cy="268" r="6" fill="var(--surface)" />
        </>
      )}

      {/* front arm + hands */}
      <rect x="76" y="196" width="46" height="150" rx="23" fill="var(--skin)" transform="rotate(-12 76 196)" />
      <circle cx="66" cy="338" r="21" fill="var(--skin)" />
      <circle cx="334" cy="338" r="21" fill="var(--skin)" />

      {/* neck */}
      <rect x="178" y="156" width="44" height="30" rx="10" fill="var(--skin)" />

      {/* girl: hair behind the head */}
      {!isNino && (
        <>
          <path d="M112 100 Q104 220 130 300 Q150 320 150 280 L146 110 Z" fill={hair} />
          <path d="M288 100 Q296 220 270 300 Q250 320 250 280 L254 110 Z" fill={hair} />
        </>
      )}

      {/* head */}
      <circle cx="200" cy="112" r="74" fill="var(--skin)" />
      <circle cx="130" cy="114" r="14" fill="var(--skin-ear)" />
      <circle cx="270" cy="114" r="14" fill="var(--skin-ear)" />

      {/* front hair */}
      {isNino ? (
        <>
          <path d="M124 92 Q118 24 200 20 Q282 24 276 92 Q276 56 200 50 Q124 56 124 92 Z" fill={hair} />
          <path d="M122 84 Q168 66 200 68 Q232 66 278 84 Q276 60 200 54 Q124 60 122 84 Z" fill={hair} />
        </>
      ) : (
        <>
          <path d="M114 92 Q108 18 200 14 Q292 18 286 92 Q286 62 200 54 Q114 62 114 92 Z" fill={hair} />
          <path
            d="M200 16 Q198 40 200 56"
            stroke="color-mix(in oklab, var(--hair-nina) 60%, black)"
            strokeWidth={2.5}
            fill="none"
          />
        </>
      )}

      {/* theme headwear (mutually exclusive with the wardrobe cap) */}
      {theme === "astronauta" && (
        <>
          <circle cx="200" cy="112" r="82" fill="oklch(0.95 0.01 240)" opacity={0.55} stroke="var(--surface)" strokeWidth={6} />
          <circle cx="200" cy="112" r="66" fill="var(--skin)" />
        </>
      )}
      {theme === "pirata" && (
        <>
          <path d="M128 88 Q200 54 272 88 L272 110 Q200 82 128 110 Z" fill="var(--ink)" />
          <circle cx="200" cy="70" r="5" fill="var(--amber)" />
        </>
      )}
      {theme === "mago" && (
        <>
          <path d="M138 90 L200 -2 L262 90 Q200 74 138 90 Z" fill="var(--brand-deep)" stroke="color-mix(in oklab, var(--brand-deep) 60%, black)" strokeWidth={3} />
          <path d="M130 88 Q200 106 270 88 L268 100 Q200 118 132 100 Z" fill="var(--brand-deep)" />
          <circle cx="180" cy="40" r="4" fill="var(--amber)" />
          <circle cx="215" cy="10" r="3" fill="var(--amber)" />
        </>
      )}
      {showCap && <CapShape cap={cap} />}

      {theme === "superheroe" && <rect x="126" y="97" width="148" height="28" rx="12" fill="var(--brand-deep)" />}

      {/* cheeks */}
      <circle cx="146" cy="128" r="11" fill="var(--skin-shade)" opacity={0.5} />
      <circle cx="254" cy="128" r="11" fill="var(--skin-shade)" opacity={0.5} />

      {/* face */}
      <circle cx="164" cy="110" r="7" fill="var(--ink)" />
      <circle cx="236" cy="110" r="7" fill="var(--ink)" />
      <path d="M170 138 Q200 154 230 138" stroke="var(--ink)" strokeWidth={5.5} strokeLinecap="round" fill="none" />

      {theme === "pirata" && <rect x="222" y="99" width="34" height="22" rx="6" fill="var(--ink)" />}
      {theme === "astronauta" && (
        <path d="M150 60 Q200 36 250 60" stroke="var(--surface)" strokeWidth={6} fill="none" opacity={0.8} />
      )}

      {/* held theme props, anchored at the front hand — drawn last so they sit
          in open space and never get hidden by the body */}
      {theme === "pirata" && (
        <>
          <circle cx="66" cy="338" r="8" fill="var(--ink)" />
          <path d="M73.4 332.85 L10.1 249.14 L1.9 254.86 L58.6 343.15 Z" fill="#c9973f" stroke="var(--ink)" strokeWidth={2} strokeLinejoin="round" />
          <line x1="68" y1="326" x2="16" y2="257" stroke="#f0d9a0" strokeWidth={2.5} strokeLinecap="round" opacity={0.85} />
          <circle cx="6" cy="252" r="9" fill="var(--ink)" />
          <circle cx="6" cy="252" r="4" fill="#3a4a5a" />
        </>
      )}
      {theme === "mago" && (
        <>
          <line x1="66" y1="338" x2="28" y2="268" stroke="#5a3a24" strokeWidth={7} strokeLinecap="round" />
          <path d="M28 244 L33 258 L47 263 L33 268 L28 282 L23 268 L9 263 L23 258 Z" fill="var(--amber)" />
        </>
      )}
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

function OptionSwatches<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { key: T; label: string; swatch: string }[];
  value: T;
  onChange: (key: T) => void;
}) {
  return (
    <div className="flex gap-3">
      {options.map((opt) => (
        <button
          key={opt.key}
          type="button"
          onClick={() => onChange(opt.key)}
          className={`flex flex-col items-center gap-1.5 rounded-xl px-2 py-1.5 transition-colors ${
            value === opt.key ? "bg-mist" : "hover:bg-mist/60"
          }`}
        >
          <span
            className={`block size-8 rounded-full border-2 ${
              value === opt.key ? "border-brand ring-2 ring-brand/30" : "border-border"
            }`}
            style={{ background: opt.swatch }}
          />
          <span className="text-[11px] font-medium text-muted-foreground">{opt.label}</span>
        </button>
      ))}
    </div>
  );
}

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
  const [shirt, setShirt] = useState<ShirtKey>("estrella");
  const [pants, setPants] = useState<PantsKey>("ink");
  const [shoes, setShoes] = useState<ShoesKey>("celeste");
  const [cap, setCap] = useState<CapKey>("estrella");
  const [theme, setTheme] = useState<ThemeKey>("ninguno");

  const summary = useMemo(() => {
    const c = CHARACTERS.find((x) => x.key === character)!.label;
    const t = THEMES.find((x) => x.key === theme)!.label;
    return theme === "ninguno" ? c : `${c} · ${t}`;
  }, [character, theme]);

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
            Elegí el pelo, la ropa y el tema — y mirá tu héroe cobrar vida
          </h1>
          <p className="mt-3 leading-relaxed text-muted-foreground">
            Esto es una vista previa interactiva. Tu kit para imprimir incluye los 2 personajes base, todo el
            guardarropa y las 4 historias — no solo la combinación que armes aquí.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-[minmax(0,320px)_1fr] md:items-start">
          {/* Preview */}
          <div className="mx-auto w-full max-w-[280px] md:mx-0">
            <div className="flex aspect-[5/8] items-center justify-center rounded-3xl bg-surface p-4 shadow-lift">
              <DollSVG character={character} shirt={shirt} pants={pants} shoes={shoes} cap={cap} theme={theme} />
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
              {THEME_HIDES_CAP[theme] && (
                <p className="mt-2 text-xs text-muted-foreground">Este tema trae su propio gorro/casco.</p>
              )}
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <p className="mb-2 text-sm font-semibold text-foreground">Camiseta</p>
                <OptionSwatches options={SHIRTS} value={shirt} onChange={setShirt} />
              </div>
              <div>
                <p className="mb-2 text-sm font-semibold text-foreground">Pantalón</p>
                <OptionSwatches options={PANTS} value={pants} onChange={setPants} />
              </div>
              <div>
                <p className="mb-2 text-sm font-semibold text-foreground">Zapatillas</p>
                <OptionSwatches options={SHOES} value={shoes} onChange={setShoes} />
              </div>
              {!THEME_HIDES_CAP[theme] && (
                <div>
                  <p className="mb-2 text-sm font-semibold text-foreground">Gorra</p>
                  <OptionSwatches options={CAPS} value={cap} onChange={setCap} />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Download */}
        <div className="mt-10 rounded-3xl border border-brand/25 bg-mist/60 p-6">
          <div className="flex items-start gap-3">
            <Sparkles className="mt-0.5 size-5 shrink-0 text-brand" />
            <div>
              <p className="font-semibold text-foreground">Tu kit completo para imprimir</p>
              <p className="text-sm text-muted-foreground">
                3 PDF listos para imprimir: los 2 muñecos base con todo el guardarropa (a color y para colorear) y
                las 4 historias.
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
