import { useRef, useState } from "react";

import { cn } from "@/lib/utils";
import { Cta, Reveal, SectionLabel } from "./primitives";
import { IMG } from "./data";
import { CTA_TEXT, getCheckoutUrl, track } from "@/lib/site-config";

type Portion = { label: string; factor: number };
type DemoRecipe = {
  title: string;
  image: string;
  time: string;
  level: string;
  yieldFor: (p: Portion) => string;
  portions: Portion[];
  defaultPortion: number;
  ingredients: { q: number; unit: string; name: string }[];
  steps: string[];
  storage: string;
};

const UNITS: Portion[] = [
  { label: "10 unidades", factor: 0.5 },
  { label: "20 unidades", factor: 1 },
  { label: "40 unidades", factor: 2 },
];
const CAKES: Portion[] = [
  { label: "½ pastel", factor: 0.5 },
  { label: "1 pastel", factor: 1 },
  { label: "2 pasteles", factor: 2 },
];

/** Recetas reales de la plataforma, en el mismo formato que verá el cliente. */
const DEMO_RECIPES: DemoRecipe[] = [
  {
    title: "Galletas de Calabaza y Avena",
    image: IMG.galletas,
    time: "25 min",
    level: "Fácil",
    portions: UNITS,
    defaultPortion: 1,
    yieldFor: (p) => `Aprox. ${20 * p.factor} galletas`,
    ingredients: [
      { q: 120, unit: "g", name: "puré de calabaza cocida" },
      { q: 150, unit: "g", name: "avena molida" },
      { q: 1, unit: "u", name: "huevo" },
      { q: 15, unit: "g", name: "aceite de coco" },
    ],
    steps: [
      "Precalienta el horno a 180 °C y forra una bandeja.",
      "Mezcla la calabaza con el huevo y el aceite hasta integrar.",
      "Agrega la avena poco a poco hasta formar una masa manejable.",
      "Estira, corta las figuras y hornea 20-25 min hasta que estén firmes.",
    ],
    storage: "Hasta 5 días en recipiente hermético en la nevera. Congela hasta 2 meses.",
  },
  {
    title: "Mini Cupcakes de Banana",
    image: IMG.cupcakes,
    time: "35 min",
    level: "Fácil",
    portions: UNITS,
    defaultPortion: 1,
    yieldFor: (p) => `Aprox. ${20 * p.factor} mini cupcakes`,
    ingredients: [
      { q: 2, unit: "u", name: "bananas maduras" },
      { q: 180, unit: "g", name: "harina de avena" },
      { q: 1, unit: "u", name: "huevo" },
      { q: 60, unit: "g", name: "yogur natural sin azúcar" },
    ],
    steps: [
      "Precalienta el horno a 180 °C y prepara los moldes.",
      "Machaca las bananas y mezcla con el huevo y el yogur.",
      "Incorpora la harina de avena hasta lograr una mezcla homogénea.",
      "Rellena los moldes y hornea 18-22 min. Deja enfriar antes de servir.",
    ],
    storage: "Hasta 3 días en recipiente hermético en la nevera. Congela hasta 1 mes.",
  },
  {
    title: "Pastel de Cumpleaños",
    image: IMG.cumple,
    time: "50 min",
    level: "Intermedio",
    portions: CAKES,
    defaultPortion: 1,
    yieldFor: (p) => (p.factor === 2 ? "2 pasteles de 8 porciones" : `${p.factor === 0.5 ? "½" : "1"} pastel · 8 porciones`),
    ingredients: [
      { q: 200, unit: "g", name: "carne magra molida cocida" },
      { q: 150, unit: "g", name: "harina de avena" },
      { q: 2, unit: "u", name: "huevos" },
      { q: 100, unit: "g", name: "zanahoria rallada" },
      { q: 120, unit: "g", name: "yogur natural para cubrir" },
    ],
    steps: [
      "Precalienta el horno a 180 °C y engrasa un molde pequeño.",
      "Mezcla la carne, los huevos y la zanahoria.",
      "Agrega la harina hasta integrar y vierte en el molde.",
      "Hornea 30-35 min, deja enfriar y cubre con el yogur.",
    ],
    storage: "Hasta 3 días en la nevera, cubierto. No congelar con la cobertura de yogur.",
  },
];

/** Demostración funcional de la plataforma con datos reales del producto. */
export function RecetaDemo() {
  const [recipeIdx, setRecipeIdx] = useState(0);
  const [tab, setTab] = useState<"ingredientes" | "preparacion" | "conservacion">("ingredientes");
  const [portion, setPortion] = useState(1);
  const opened = useRef(false);

  const recipe = DEMO_RECIPES[recipeIdx]!;
  const currentPortion = recipe.portions.find((p) => p.factor === portion) ?? recipe.portions[1]!;

  const fmt = (q: number) => {
    const v = q * portion;
    return Number.isInteger(v) ? String(v) : v.toFixed(1).replace(".", ",");
  };

  const selectRecipe = (i: number) => {
    setRecipeIdx(i);
    setPortion(1);
    setTab("ingredientes");
    track("recipe_demo_interacted", { recipe: DEMO_RECIPES[i]!.title });
  };

  return (
    <section id="demo" className="border-y border-border bg-card">
      <div className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-24">
        <Reveal>
          <SectionLabel>Demostración</SectionLabel>
          <h2 className="text-balance-tight mt-4 text-[1.9rem] sm:text-4xl">
            No te lo vamos a explicar solamente. Pruébalo.
          </h2>
          <p className="mt-3 max-w-xl text-muted-foreground">
            Esto no es una ilustración de lo que podrías recibir. Es una receta real de la
            plataforma, con sus cantidades, pasos y conservación.
          </p>
        </Reveal>

        <Reveal delay={60}>
          <div className="mt-7 flex snap-x gap-2.5 overflow-x-auto pb-1">
            {DEMO_RECIPES.map((r, i) => (
              <button
                key={r.title}
                onClick={() => selectRecipe(i)}
                aria-pressed={recipeIdx === i}
                className={cn(
                  "shrink-0 snap-start rounded-full border px-4 py-2 text-sm font-semibold transition-all duration-300",
                  recipeIdx === i
                    ? "border-primary/60 bg-forest text-primary-foreground"
                    : "border-border bg-background text-muted-foreground hover:text-foreground",
                )}
              >
                {r.title}
              </button>
            ))}
          </div>
        </Reveal>

        <div key={recipe.title} className="mt-6 grid animate-in fade-in gap-6 duration-500 md:grid-cols-[0.9fr_1.1fr] md:items-start">
          <Reveal>
            <div className="surface overflow-hidden rounded-3xl">
              <img
                src={recipe.image}
                alt={recipe.title}
                width={800}
                height={800}
                loading="lazy"
                decoding="async"
                className="aspect-[4/3] w-full object-cover"
              />
              <div className="p-5">
                <h3 className="font-display text-xl">{recipe.title}</h3>
                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                  {[recipe.time, recipe.level, recipe.yieldFor(currentPortion)].map((m) => (
                    <span key={m} className="rounded-full bg-muted px-3 py-1 text-muted-foreground">
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal delay={90}>
            <div className="surface rounded-3xl p-5 md:p-6">
              <div className="flex gap-1.5 rounded-full bg-muted p-1.5">
                {(["ingredientes", "preparacion", "conservacion"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => {
                      setTab(t);
                      if (!opened.current) {
                        opened.current = true;
                        track("tool_demo_opened", { widget: "receta_demo" });
                      }
                    }}
                    className={cn(
                      "flex-1 rounded-full px-3 py-2 text-[0.8rem] font-semibold transition-all duration-300",
                      tab === t ? "bg-card shadow-[var(--shadow-soft)]" : "text-muted-foreground",
                    )}
                  >
                    {t === "preparacion"
                      ? "Preparación"
                      : t === "conservacion"
                        ? "Conservación"
                        : "Ingredientes"}
                  </button>
                ))}
              </div>

              <div className="mt-5 min-h-[16rem]">
                {tab === "ingredientes" && (
                  <div className="animate-in fade-in duration-300">
                    <p className="text-[0.7rem] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
                      ¿Cuánto quieres preparar?
                    </p>
                    <div className="mt-2.5 flex flex-wrap gap-2">
                      {recipe.portions.map((p) => (
                        <button
                          key={p.label}
                          onClick={() => {
                            setPortion(p.factor);
                            track("recipe_quantity_demo_changed", {
                              recipe: recipe.title,
                              portion: p.label,
                            });
                          }}
                          className={cn(
                            "rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-all duration-300",
                            portion === p.factor
                              ? "border-primary/60 bg-accent/60 text-foreground"
                              : "border-border text-muted-foreground",
                          )}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                    <ul className="mt-4 divide-y divide-border">
                      {recipe.ingredients.map((i) => (
                        <li key={i.name} className="flex items-baseline justify-between gap-4 py-3">
                          <span className="text-sm">{i.name}</span>
                          <span
                            key={`${i.name}-${portion}`}
                            className="animate-in fade-in text-sm font-semibold tabular-nums duration-300"
                          >
                            {fmt(i.q)}
                            {i.unit === "u" ? "" : ` ${i.unit}`}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <p className="mt-3 text-xs text-muted-foreground">
                      Tú eliges cuánto preparar. La plataforma recalcula las cantidades por ti.
                    </p>
                  </div>
                )}

                {tab === "preparacion" && (
                  <ol className="animate-in fade-in space-y-3 duration-300">
                    {recipe.steps.map((s, i) => (
                      <li key={s} className="flex gap-3">
                        <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-accent/70 text-xs font-bold text-primary">
                          {i + 1}
                        </span>
                        <span className="text-sm leading-relaxed">{s}</span>
                      </li>
                    ))}
                  </ol>
                )}

                {tab === "conservacion" && (
                  <div className="animate-in fade-in duration-300">
                    <p className="text-sm leading-relaxed">{recipe.storage}</p>
                    <p className="mt-4 rounded-2xl border border-border bg-muted/50 p-4 text-xs leading-relaxed text-muted-foreground">
                      Cada receta incluye su propia nota de conservación y avisos cuando
                      corresponde.
                    </p>
                  </div>
                )}
              </div>

              <Cta
                asChild
                size="md"
                className="mt-5 w-full"
                onClick={() => track("checkout_clicked", { location: "demo" })}
              >
                <a href={getCheckoutUrl()}>{CTA_TEXT}</a>
              </Cta>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
