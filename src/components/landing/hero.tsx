import { useEffect, useRef, useState } from "react";

import heroImg from "@/assets/hero.jpg";
import { cn } from "@/lib/utils";
import { Cta, Reveal } from "./primitives";
import { HERO_CATEGORIES, type CategoryKey } from "./data";
import {
  ACTIVE_CTA,
  ACTIVE_HEADLINE,
  CHECKOUT_URL,
  CTA_VARIANTS,
  HEADLINE_VARIANTS,
  REGULAR_PRICE,
  track,
} from "@/lib/site-config";

function useCountUp(target: number, run: boolean) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!run) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setN(target);
      return;
    }
    const start = performance.now();
    const dur = 1100;
    let raf = 0;
    const step = (t: number) => {
      const p = Math.min(1, (t - start) / dur);
      setN(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, run]);
  return n;
}

export function Hero() {
  const count = useCountUp(100, true);
  const [active, setActive] = useState<CategoryKey>("galletas");
  const imgWrap = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = imgWrap.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const y = Math.min(60, window.scrollY * 0.06);
        el.style.transform = `translate3d(0, ${y}px, 0)`;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const current = HERO_CATEGORIES.find((c) => c.key === active)!;

  return (
    <>
      <section id="hero" className="gradient-warm relative overflow-hidden">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 pt-14 pb-16 md:grid-cols-2 md:items-center md:gap-14 md:px-8 md:pt-20 md:pb-24">
          <div>
            <Reveal>
              <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/80 px-3.5 py-1.5 text-xs font-medium text-muted-foreground">
                <span className="size-1.5 rounded-full bg-primary" />
                Recetario digital · {count} recetas caseras
              </span>
            </Reveal>

            <Reveal delay={80}>
              <h1 className="text-balance-tight mt-5 text-[2.1rem] leading-[1.08] sm:text-5xl md:text-[3.4rem]">
                {HEADLINE_VARIANTS[ACTIVE_HEADLINE]}
              </h1>
            </Reveal>

            <Reveal delay={140}>
              <p className="mt-5 max-w-xl text-[1.02rem] leading-relaxed text-muted-foreground">
                Galletas, snacks, cupcakes, pasteles y premios caseros con ingredientes claros,
                cantidades exactas y preparación paso a paso.
              </p>
            </Reveal>

            <Reveal delay={200}>
              <ul className="mt-6 grid grid-cols-2 gap-x-4 gap-y-2.5 text-sm">
                {[
                  "Fácil de seguir",
                  "Ingredientes claros",
                  "Desde tu celular",
                  "Acceso inmediato",
                ].map((t) => (
                  <li key={t} className="flex items-center gap-2">
                    <span className="text-primary">✓</span>
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </Reveal>

            <Reveal delay={260}>
              <div className="mt-8">
                <Cta
                  asChild
                  size="lg"
                  className="w-full sm:w-auto"
                  onClick={() => {
                    track("hero_cta_clicked");
                    track("checkout_clicked", { location: "hero" });
                  }}
                >
                  <a href={CHECKOUT_URL}>{CTA_VARIANTS[ACTIVE_CTA]}</a>
                </Cta>
                <p className="mt-3 text-xs text-muted-foreground">Acceso completo · Pago único</p>
                <p className="mt-4 font-display text-3xl">{REGULAR_PRICE}</p>
              </div>
            </Reveal>
          </div>

          <Reveal delay={120} className="relative">
            <div ref={imgWrap} className="will-change-transform">
              <img
                src={heroImg}
                width={1408}
                height={1200}
                alt="Persona preparando galletas caseras para su perro en la cocina"
                fetchPriority="high"
                decoding="async"
                className="aspect-[7/6] w-full rounded-[2rem] object-cover shadow-[var(--shadow-lift)]"
              />
            </div>
            <div className="surface absolute -bottom-5 left-4 rounded-2xl px-4 py-3 md:left-8">
              <p className="font-display text-sm">Hecho por ti. Para él.</p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Elemento interactivo del hero */}
      <section className="mx-auto max-w-6xl px-5 py-14 md:px-8 md:py-20">
        <Reveal>
          <h2 className="text-center text-2xl sm:text-3xl">¿Qué prepararías primero?</h2>
        </Reveal>

        <Reveal delay={80}>
          <div className="mt-7 flex snap-x gap-3 overflow-x-auto pb-2 md:justify-center">
            {HERO_CATEGORIES.map((c) => (
              <button
                key={c.key}
                onClick={() => {
                  setActive(c.key);
                  track("category_selected", { category: c.key });
                }}
                className={cn(
                  "flex min-w-[7.5rem] snap-start flex-col items-center gap-1.5 rounded-2xl border px-4 py-3.5 transition-all duration-300 ease-out",
                  "hover:-translate-y-1 hover:shadow-[var(--shadow-soft)] motion-reduce:hover:translate-y-0",
                  active === c.key
                    ? "border-primary/60 bg-card shadow-[var(--shadow-soft)]"
                    : "border-border bg-card/50",
                )}
              >
                <span className="text-xl">{c.emoji}</span>
                <span className="text-sm font-semibold">{c.label}</span>
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
                  className="surface overflow-hidden rounded-2xl transition-transform duration-300 ease-out hover:-translate-y-1 motion-reduce:hover:translate-y-0"
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
    </>
  );
}
