import { useState } from "react";

import finalImg from "@/assets/final-cta.jpg";
import { cn } from "@/lib/utils";
import { Cta, Reveal, SectionLabel } from "./primitives";
import { CATEGORY_GRID, FAQS, HERO_CATEGORIES } from "./data";
import { CHECKOUT_URL, REGULAR_PRICE, REVIEWS, track } from "@/lib/site-config";

export function Identificacion() {
  const cards = [
    { t: "Sabes qué necesitas", d: "Ingredientes y cantidades claras." },
    { t: "Sabes qué hacer", d: "Preparación organizada paso a paso." },
    { t: "Sabes cómo guardarlo", d: "Información de conservación dentro de cada receta." },
  ];
  return (
    <section className="border-y border-border bg-cream">
      <div className="mx-auto max-w-4xl px-5 py-16 md:px-8 md:py-24">
        <Reveal>
          <h2 className="text-balance-tight text-2xl leading-snug sm:text-4xl">
            Si es parte de tu familia, sabes que a veces quieres darle algo más que “lo de
            siempre”.
          </h2>
        </Reveal>
        <Reveal delay={80}>
          <p className="mt-6 leading-relaxed text-muted-foreground">
            Tal vez ya buscaste recetas para perros en internet. Una dice una cantidad, otra no
            explica cómo conservarla y otra te hace preguntarte si realmente puedes utilizar ese
            ingrediente.
          </p>
        </Reveal>
        <Reveal delay={120}>
          <p className="mt-4 font-medium">Por eso reunimos todo de una forma mucho más simple.</p>
        </Reveal>
        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {cards.map((c, i) => (
            <Reveal key={c.t} delay={140 + i * 70}>
              <div className="surface h-full rounded-2xl p-5">
                <h3 className="text-base">{c.t}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{c.d}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Categorias() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-24">
      <Reveal>
        <h2 className="text-balance-tight text-2xl sm:text-4xl">
          No importa qué momento tengas en mente.
        </h2>
        <p className="mt-3 text-muted-foreground">Hay una receta para explorar.</p>
      </Reveal>
      <div className="mt-9 grid grid-cols-2 gap-4 md:grid-cols-4">
        {CATEGORY_GRID.map((c, i) => (
          <Reveal key={c.name} delay={i * 50}>
            <article className="group surface h-full overflow-hidden rounded-2xl transition-all duration-300 ease-out hover:-translate-y-1.5 hover:shadow-[var(--shadow-lift)] motion-reduce:hover:translate-y-0">
              <div className="overflow-hidden">
                <img
                  src={c.image}
                  alt={c.name}
                  width={800}
                  height={800}
                  loading="lazy"
                  decoding="async"
                  className="aspect-square w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.05] motion-reduce:group-hover:scale-100"
                />
              </div>
              <div className="px-4 py-3.5">
                <h3 className="text-[0.98rem]">{c.name}</h3>
                <p className="mt-1 text-xs leading-snug text-muted-foreground">{c.hint}</p>
              </div>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/** Microcompromiso: elige una receta que harías hoy. */
export function EligeReceta() {
  const options = HERO_CATEGORIES.slice(0, 3).map((c) => ({
    label: c.examples[0]!,
    image: c.image,
  }));
  const [chosen, setChosen] = useState<string | null>(null);

  return (
    <section className="border-y border-border bg-cream">
      <div className="mx-auto max-w-4xl px-5 py-16 md:px-8 md:py-20">
        <Reveal>
          <h2 className="text-center text-2xl sm:text-3xl">Elige una receta que harías hoy</h2>
        </Reveal>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {options.map((o, i) => (
            <Reveal key={o.label} delay={i * 60}>
              <button
                onClick={() => {
                  setChosen(o.label);
                  track("recipe_demo_interacted", { recipe: o.label, widget: "elige_receta" });
                }}
                className={cn(
                  "surface relative w-full overflow-hidden rounded-2xl text-left transition-all duration-300 ease-out hover:-translate-y-1 motion-reduce:hover:translate-y-0",
                  chosen === o.label && "ring-2 ring-primary",
                )}
              >
                <img
                  src={o.image}
                  alt={o.label}
                  width={800}
                  height={800}
                  loading="lazy"
                  decoding="async"
                  className="aspect-[4/3] w-full object-cover"
                />
                <span className="block px-4 py-3 text-sm font-medium">{o.label}</span>
                {chosen === o.label && (
                  <span className="absolute top-3 right-3 rounded-full bg-card/90 px-2 py-1 text-sm">
                    ❤️
                  </span>
                )}
              </button>
            </Reveal>
          ))}
        </div>
        <div
          className={cn(
            "mt-7 text-center transition-all duration-500",
            chosen ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-2 opacity-0",
          )}
        >
          <p className="text-sm font-medium">
            Buena elección. Esta está incluida dentro de las 100 recetas.
          </p>
          <Cta
            asChild
            size="md"
            className="mt-4"
            onClick={() => track("checkout_clicked", { location: "elige_receta" })}
          >
            <a href={CHECKOUT_URL}>Desbloquear las 100</a>
          </Cta>
        </div>
      </div>
    </section>
  );
}

export function Confianza() {
  const items = [
    "Ingredientes claros",
    "Cantidades específicas",
    "Preparación completa",
    "Conservación",
    "Avisos cuando corresponde",
  ];
  return (
    <section className="mx-auto max-w-4xl px-5 py-16 md:px-8 md:py-24">
      <Reveal>
        <SectionLabel>Cuidado</SectionLabel>
        <h2 className="text-balance-tight mt-4 text-2xl sm:text-4xl">
          Porque preparar para él también significa hacerlo con cuidado.
        </h2>
      </Reveal>
      <div className="mt-8 flex flex-wrap gap-2.5">
        {items.map((i, idx) => (
          <Reveal key={i} delay={idx * 50} as="span">
            <span className="surface inline-flex rounded-full px-4 py-2 text-sm">{i}</span>
          </Reveal>
        ))}
      </div>
      <Reveal delay={120}>
        <p className="mt-8 leading-relaxed text-muted-foreground">
          Las recetas están planteadas como premios y preparaciones complementarias para perros
          adultos sanos.
        </p>
        <div className="mt-5 rounded-2xl border border-border bg-muted/50 p-5 text-sm leading-relaxed text-muted-foreground">
          Si tu perro tiene alergias, intolerancias, alguna enfermedad o sigue una dieta
          veterinaria, consulta con su veterinario antes de introducir nuevos alimentos.
        </div>
      </Reveal>
    </section>
  );
}

/** Solo se renderiza si existen reseñas reales del producto. */
export function PruebaSocial() {
  if (!REVIEWS.enabled || REVIEWS.items.length === 0) return null;
  return (
    <section className="mx-auto max-w-6xl px-5 py-16 md:px-8">
      <Reveal>
        <h2 className="text-2xl sm:text-4xl">Mira lo que están preparando</h2>
        {REVIEWS.average !== null && REVIEWS.count !== null && (
          <p className="mt-2 text-sm text-muted-foreground">
            {REVIEWS.average} ★ · {REVIEWS.count} opiniones verificadas
          </p>
        )}
      </Reveal>
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {REVIEWS.items.map((r) => (
          <figure key={r.name + r.comment} className="surface overflow-hidden rounded-2xl">
            {r.image && (
              <img
                src={r.image}
                alt=""
                loading="lazy"
                decoding="async"
                className="aspect-[4/3] w-full object-cover"
              />
            )}
            <figcaption className="p-4 text-sm">
              <p>{r.comment}</p>
              <p className="mt-2 text-xs text-muted-foreground">
                {r.name} · {r.country}
              </p>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

export function Faq() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <section className="mx-auto max-w-3xl px-5 py-16 md:px-8 md:py-24">
      <Reveal>
        <h2 className="text-2xl sm:text-4xl">Preguntas frecuentes</h2>
      </Reveal>
      <div className="mt-8 divide-y divide-border border-y border-border">
        {FAQS.map((f, i) => {
          const isOpen = open === i;
          return (
            <div key={f.q}>
              <button
                className="flex w-full items-center justify-between gap-4 py-4 text-left"
                aria-expanded={isOpen}
                onClick={() => {
                  setOpen(isOpen ? null : i);
                  if (!isOpen) track("faq_opened", { question: f.q });
                }}
              >
                <span className="text-[0.98rem] font-semibold">{f.q}</span>
                <span
                  className={cn(
                    "text-primary transition-transform duration-300",
                    isOpen && "rotate-45",
                  )}
                >
                  +
                </span>
              </button>
              <div
                className="grid transition-all duration-400 ease-out"
                style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
              >
                <div className="overflow-hidden">
                  <p className="pb-5 text-sm leading-relaxed text-muted-foreground">{f.a}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export function FinalCta() {
  return (
    <section id="final" className="relative overflow-hidden border-t border-border">
      <img
        src={finalImg}
        alt="Perro esperando en la cocina mientras su familia prepara algo especial"
        width={1408}
        height={1008}
        loading="lazy"
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-[linear-gradient(100deg,oklch(0.26_0.031_55/0.92)_0%,oklch(0.26_0.031_55/0.72)_55%,oklch(0.26_0.031_55/0.35)_100%)]" />
      <div className="relative mx-auto max-w-3xl px-5 py-24 md:px-8 md:py-32">
        <Reveal>
          <h2 className="text-balance-tight max-w-xl text-3xl leading-tight text-cream sm:text-4xl">
            Él no sabe que estás a un clic de preparar algo especial.
          </h2>
          <p className="mt-3 text-lg font-medium text-cream/85">Pero tú sí.</p>
          <Cta
            asChild
            size="lg"
            className="mt-8 w-full sm:w-auto"
            onClick={() => {
              track("final_cta_clicked");
              track("checkout_clicked", { location: "final" });
            }}
          >
            <a href={CHECKOUT_URL}>QUIERO LAS 100 RECETAS</a>
          </Cta>
          <p className="mt-4 text-sm text-cream/85">{REGULAR_PRICE} · Pago único</p>
          <p className="text-xs text-cream/70">Acceso inmediato</p>
        </Reveal>
      </div>
    </section>
  );
}
