import { useState } from "react";

import heroImg from "@/assets/hero.jpg";
import { cn } from "@/lib/utils";
import { Cta, Reveal } from "./primitives";
import { CATEGORIES, type CategoryKey } from "./data";
import {
  BRAND_SIGNATURE,
  CTA_TEXT,
  RECIPE_COUNT,
  getCheckoutUrl,
  track,
} from "@/lib/site-config";

const BENEFITS = [
  `${RECIPE_COUNT} recetas completas`,
  "Paso a paso claro",
  "Ajustador de cantidades",
  "Plataforma desde tu celular",
];

const HERO_TAGS = [`${RECIPE_COUNT} recetas`, "Paso a paso", "Ajusta cantidades"];


export function Hero() {
  return (
    <section id="hero" className="gradient-warm relative overflow-hidden">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 pt-10 pb-14 md:grid-cols-2 md:items-center md:gap-14 md:px-8 md:pt-16 md:pb-20">
        <div>
          <Reveal>
            <p className="font-display text-[0.78rem] font-semibold tracking-[0.22em] text-primary uppercase">
              {BRAND_SIGNATURE}
            </p>
          </Reveal>

          <Reveal delay={70}>
            <h1 className="text-balance-tight mt-4 text-[2.35rem] leading-[1.1] sm:text-5xl md:text-[3.5rem]">
              {RECIPE_COUNT} recetas caseras para consentir a tu perro, sin improvisar ingredientes,
              cantidades ni pasos.
            </h1>
          </Reveal>

          <Reveal delay={130}>
            <p className="mt-5 max-w-xl text-[1.05rem] leading-relaxed text-muted-foreground">
              Elige entre galletas, snacks, cupcakes, pasteles y preparaciones especiales. Ajusta
              cuánto quieres preparar y sigue ingredientes, utensilios, preparación y conservación
              directamente desde tu celular.
            </p>
          </Reveal>

          <Reveal delay={190}>
            <ul className="mt-6 grid grid-cols-2 gap-x-4 gap-y-2.5 text-[0.95rem]">
              {BENEFITS.map((t) => (
                <li key={t} className="flex items-center gap-2">
                  <span className="text-primary">✓</span>
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={250}>
            <div className="mt-8">
              <div className="flex items-end gap-3">
                <p className="font-display text-4xl leading-none">{REGULAR_PRICE}</p>
                <p className="pb-0.5 text-sm text-muted-foreground">Pago único · Sin mensualidad</p>
              </div>
              <Cta
                asChild
                size="lg"
                className="mt-5 w-full sm:w-auto"
                onClick={() => {
                  track("hero_cta_clicked");
                  track("checkout_clicked", { location: "hero" });
                }}
              >
                <a href={getCheckoutUrl()}>{CTA_TEXT}</a>
              </Cta>
              <p className="mt-3 text-xs text-muted-foreground">
                Pago seguro · Acceso digital después de la confirmación
              </p>
            </div>
          </Reveal>
        </div>

        <Reveal delay={120} className="relative">
          <img
            src={heroImg}
            width={1408}
            height={1216}
            alt="Celular con la plataforma de recetas junto a galletas caseras y un perro esperando su premio"
            fetchPriority="high"
            decoding="async"
            className="aspect-[7/6] w-full rounded-[1.75rem] object-cover shadow-[var(--shadow-lift)]"
          />
          <div className="absolute bottom-4 left-4 flex flex-wrap gap-2">
            {HERO_TAGS.map((t) => (
              <span
                key={t}
                className="rounded-full bg-card/90 px-3.5 py-1.5 text-xs font-semibold shadow-[var(--shadow-soft)] backdrop-blur-sm"
              >
                {t}
              </span>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/** Faixa discreta com apenas afirmações verdadeiras. */
export function TrustStrip() {
  const items = ["Pago único", "Acceso digital", "Celular · Tablet · Computadora"];
  return (
    <div className="border-b border-border bg-card">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-10 gap-y-2 px-5 py-4 md:px-8">
        {items.map((t) => (
          <span
            key={t}
            className="flex items-center gap-2 text-[0.72rem] font-semibold tracking-[0.14em] text-muted-foreground uppercase"
          >
            <span className="size-1 rounded-full bg-gold" />
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}

/** Microcompromiso: galería fotográfica de categorías con ejemplos reales. */
export function ExplorarCategorias() {
  const [active, setActive] = useState<CategoryKey>("galletas");
  const current = HERO_CATEGORIES.find((c) => c.key === active)!;

  return (
    <section className="mx-auto max-w-6xl px-5 py-14 md:px-8 md:py-24">
      <Reveal>
        <h2 className="text-center text-[1.9rem] sm:text-4xl">
          ¿Qué te gustaría preparar primero?
        </h2>
      </Reveal>

      <Reveal delay={80}>
        <div className="mt-8 flex snap-x gap-3 overflow-x-auto pb-2 md:grid md:grid-cols-5 md:overflow-visible">
          {HERO_CATEGORIES.map((c) => (
            <button
              key={c.key}
              onClick={() => {
                setActive(c.key);
                track("category_selected", { category: c.key });
              }}
              aria-pressed={active === c.key}
              className={cn(
                "group w-40 shrink-0 snap-start overflow-hidden rounded-3xl border text-left transition-all duration-300 ease-out md:w-auto",
                "hover:-translate-y-1 hover:shadow-[var(--shadow-lift)] motion-reduce:hover:translate-y-0",
                active === c.key
                  ? "border-primary/50 bg-card shadow-[var(--shadow-soft)]"
                  : "border-border bg-card/60",
              )}
            >
              <div className="overflow-hidden">
                <img
                  src={c.image}
                  width={800}
                  height={800}
                  loading="lazy"
                  decoding="async"
                  alt={c.label}
                  className="aspect-[4/3] w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04] motion-reduce:group-hover:scale-100"
                />
              </div>
              <span className="block px-4 py-3 text-sm font-semibold">{c.label}</span>
            </button>
          ))}
        </div>
      </Reveal>

      <Reveal delay={120}>
        <div key={active} className="mt-8 animate-in fade-in duration-500">
          <p className="text-[0.7rem] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
            {current.label}
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            {current.examples.map((ex) => (
              <figure
                key={ex}
                className="surface overflow-hidden rounded-3xl transition-transform duration-300 ease-out hover:-translate-y-1 motion-reduce:hover:translate-y-0"
              >
                <img
                  src={current.image}
                  width={800}
                  height={800}
                  loading="lazy"
                  decoding="async"
                  alt={ex}
                  className="aspect-[4/3] w-full object-cover"
                />
                <figcaption className="px-4 py-3 text-sm font-medium">{ex}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </Reveal>
    </section>
  );
}
