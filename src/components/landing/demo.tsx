import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";
import { Cta, Reveal, SectionLabel } from "./primitives";
import { IMG } from "./data";
import { CHECKOUT_URL, track } from "@/lib/site-config";

/** Receta de muestra, real y completa: el visitante ve exactamente el formato. */
const SAMPLE = {
  title: "Galletas de Calabaza y Avena",
  image: IMG.galletas,
  time: "25 min",
  level: "Fácil",
  yield: "Aprox. 20 galletas",
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
};

const PORTIONS = [
  { label: "Media tanda", factor: 0.5 },
  { label: "Tanda completa", factor: 1 },
  { label: "Tanda doble", factor: 2 },
];

/** Demostración del producto: tabs de receta + ajuste de cantidades. */
export function RecetaDemo() {
  const [tab, setTab] = useState<"ingredientes" | "preparacion" | "conservacion">("ingredientes");
  const [portion, setPortion] = useState(1);
  const opened = useRef(false);

  const fmt = (q: number) => {
    const v = q * portion;
    return Number.isInteger(v) ? String(v) : v.toFixed(1).replace(".", ",");
  };

  return (
    <section id="demo" className="border-y border-border bg-cream">
      <div className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-24">
        <Reveal>
          <SectionLabel>Así se ve por dentro</SectionLabel>
          <h2 className="text-balance-tight mt-4 text-2xl sm:text-4xl">
            Toca la receta. Así la vas a usar en tu cocina.
          </h2>
        </Reveal>

        <div className="mt-9 grid gap-6 md:grid-cols-[0.9fr_1.1fr] md:items-start">
          <Reveal>
            <div className="surface overflow-hidden rounded-3xl">
              <img
                src={SAMPLE.image}
                alt={SAMPLE.title}
                width={800}
                height={800}
                loading="lazy"
                decoding="async"
                className="aspect-[4/3] w-full object-cover"
              />
              <div className="p-5">
                <h3 className="font-display text-xl">{SAMPLE.title}</h3>
                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                  {[SAMPLE.time, SAMPLE.level, SAMPLE.yield].map((m) => (
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
                      track("recipe_demo_interacted", { recipe: SAMPLE.title, tab: t });
                    }}
                    className={cn(
                      "flex-1 rounded-full px-3 py-2 text-[0.8rem] font-semibold capitalize transition-all duration-300",
                      tab === t ? "bg-card shadow-[var(--shadow-soft)]" : "text-muted-foreground",
                    )}
                  >
                    {t === "preparacion" ? "Preparación" : t === "conservacion" ? "Conservación" : t}
                  </button>
                ))}
              </div>

              <div className="mt-5 min-h-[16rem]">
                {tab === "ingredientes" && (
                  <div className="animate-in fade-in duration-300">
                    <div className="flex flex-wrap gap-2">
                      {PORTIONS.map((p) => (
                        <button
                          key={p.label}
                          onClick={() => {
                            setPortion(p.factor);
                            track("recipe_quantity_demo_changed", { portion: p.label });
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
                      {SAMPLE.ingredients.map((i) => (
                        <li key={i.name} className="flex items-baseline justify-between gap-4 py-3">
                          <span className="text-sm">{i.name}</span>
                          <span className="text-sm font-semibold tabular-nums">
                            {fmt(i.q)}
                            {i.unit === "u" ? "" : ` ${i.unit}`}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <p className="mt-3 text-xs text-muted-foreground">
                      Cambia la tanda y las cantidades se recalculan solas.
                    </p>
                  </div>
                )}

                {tab === "preparacion" && (
                  <ol className="animate-in fade-in space-y-3 duration-300">
                    {SAMPLE.steps.map((s, i) => (
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
                    <p className="text-sm leading-relaxed">{SAMPLE.storage}</p>
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
                <a href={CHECKOUT_URL}>Quiero las 100 recetas</a>
              </Cta>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

const STEPS = [
  { n: "01", t: "Eliges la ocasión", d: "Un premio de todos los días o algo para su cumpleaños." },
  { n: "02", t: "Sigues la receta", d: "Ingredientes, cantidades y pasos, sin adivinar nada." },
  { n: "03", t: "Se lo das", d: "Guardas lo que sobra con las indicaciones de la receta." },
];

export function ComoFunciona() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => setActive((a) => (a + 1) % STEPS.length), 3600);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="mx-auto max-w-5xl px-5 py-16 md:px-8 md:py-24">
      <Reveal>
        <SectionLabel>Simple</SectionLabel>
        <h2 className="text-balance-tight mt-4 text-2xl sm:text-4xl">
          Preparar algo para él toma menos de lo que imaginas.
        </h2>
      </Reveal>
      <div className="mt-9 grid gap-4 md:grid-cols-3">
        {STEPS.map((s, i) => (
          <Reveal key={s.n} delay={i * 70}>
            <button
              onMouseEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
              onClick={() => setActive(i)}
              className={cn(
                "surface h-full w-full rounded-2xl p-5 text-left transition-all duration-400 ease-out",
                active === i ? "-translate-y-1.5 shadow-[var(--shadow-lift)]" : "opacity-80",
              )}
            >
              <span className="font-display text-2xl text-primary">{s.n}</span>
              <h3 className="mt-2 text-base">{s.t}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{s.d}</p>
            </button>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
