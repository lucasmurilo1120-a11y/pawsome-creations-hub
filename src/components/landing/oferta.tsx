import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";
import { Cta, Reveal, SectionLabel } from "./primitives";
import { useInView } from "@/hooks/use-reveal";
import {
  ACTIVE_CTA,
  CHECKOUT_URL,
  CTA_VARIANTS,
  GUARANTEE_DAYS,
  INSTALLMENT_TEXT,
  PER_RECIPE_PRICE,
  PROMO_ACTIVE,
  PROMO_PRICE,
  RECIPE_COUNT,
  REGULAR_PRICE,
  track,
} from "@/lib/site-config";

const INCLUDED = [
  "100 recetas caseras organizadas por categoría",
  "Galletas, snacks, cupcakes, pasteles y especiales de cumpleaños",
  "Ingredientes y cantidades exactas en cada receta",
  "Preparación paso a paso, sin términos técnicos",
  "Indicaciones de conservación y avisos cuando corresponde",
  "Acceso digital inmediato desde el celular, tablet o computadora",
];

export function Oferta() {
  const { ref, inView } = useInView<HTMLDivElement>(0.35);
  const [glow, setGlow] = useState(false);
  const fired = useRef(false);

  useEffect(() => {
    if (!inView || fired.current) return;
    fired.current = true;
    track("pricing_viewed");
    setGlow(true);
    const t = setTimeout(() => setGlow(false), 1400);
    return () => clearTimeout(t);
  }, [inView]);

  const price = PROMO_ACTIVE && PROMO_PRICE ? PROMO_PRICE : REGULAR_PRICE;

  return (
    <section id="oferta" className="border-y border-border bg-cream">
      <div ref={ref} className="mx-auto max-w-3xl px-5 py-16 md:px-8 md:py-24">
        <Reveal>
          <SectionLabel>La oferta</SectionLabel>
          <h2 className="text-balance-tight mt-4 text-2xl sm:text-4xl">
            {RECIPE_COUNT} recetas por el precio de un capricho cualquiera.
          </h2>
        </Reveal>

        <Reveal delay={80}>
          <div className="surface mt-8 overflow-hidden rounded-3xl">
            <div className="p-6 md:p-8">
              <ul className="space-y-3">
                {INCLUDED.map((i) => (
                  <li key={i} className="flex gap-3 text-sm leading-relaxed">
                    <span className="text-primary">✓</span>
                    <span>{i}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-7 rounded-2xl bg-muted/60 p-5 text-center">
                <p className="text-sm text-muted-foreground">
                  {RECIPE_COUNT} recetas × {PER_RECIPE_PRICE} =
                </p>
                <p className="mt-1 flex items-baseline justify-center gap-3">
                  {PROMO_ACTIVE && PROMO_PRICE && (
                    <span className="text-lg text-muted-foreground line-through">
                      {REGULAR_PRICE}
                    </span>
                  )}
                  <span className="font-display text-5xl">{price}</span>
                </p>
                <p className="mt-1 text-sm font-semibold">Pago único · Acceso inmediato</p>
                {INSTALLMENT_TEXT && (
                  <p className="mt-1 text-xs text-muted-foreground">{INSTALLMENT_TEXT}</p>
                )}
              </div>

              <Cta
                asChild
                size="lg"
                className={cn("mt-6 w-full", glow && "cta-sheen cta-sheen-play")}
                onClick={() => track("checkout_clicked", { location: "oferta" })}
              >
                <a href={CHECKOUT_URL}>{CTA_VARIANTS[ACTIVE_CTA]}</a>
              </Cta>

              {GUARANTEE_DAYS > 0 && (
                <p className="mt-3 text-center text-xs text-muted-foreground">
                  Garantía de {GUARANTEE_DAYS} días.
                </p>
              )}
              <p className="mt-3 text-center text-xs text-muted-foreground">
                Recetas pensadas como premios y preparaciones complementarias.
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
