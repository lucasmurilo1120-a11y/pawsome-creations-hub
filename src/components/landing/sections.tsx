import { useState } from "react";

import finalImg from "@/assets/final-cta.jpg";
import emocionImg from "@/assets/emocion.jpg";
import { cn } from "@/lib/utils";
import { Cta, Reveal, SectionLabel } from "./primitives";
import { CATEGORY_GRID, FAQS } from "./data";
import {
  BRAND_SIGNATURE,
  CHECKOUT_URL,
  CTA_TEXT,
  RECIPE_COUNT,
  REGULAR_PRICE,
  REVIEWS,
  track,
} from "@/lib/site-config";

/** Puente emocional: por qué preparar algo con tus manos importa. */
export function PuenteEmocional() {
  return (
    <section className="border-y border-border bg-cream">
      <div className="mx-auto grid max-w-6xl gap-8 px-5 py-16 md:grid-cols-2 md:items-center md:px-8 md:py-24">
        <Reveal>
          <img
            src={emocionImg}
            alt="Manos sirviendo galletas caseras a un perro en la cocina"
            width={1200}
            height={900}
            loading="lazy"
            decoding="async"
            className="aspect-[4/3] w-full rounded-3xl object-cover shadow-[var(--shadow-lift)]"
          />
        </Reveal>
        <Reveal delay={80}>
          <SectionLabel>Por qué importa</SectionLabel>
          <h2 className="text-balance-tight mt-4 text-2xl leading-snug sm:text-4xl">
            Él no entiende de recetas. Entiende que te tomaste el tiempo.
          </h2>
          <p className="mt-5 leading-relaxed text-muted-foreground">
            Te sigue a la cocina, se sienta y espera. No sabe qué estás preparando, pero sabe que
            es para él. Ese momento no se compra hecho: se prepara.
          </p>
          <p className="mt-4 font-medium">{BRAND_SIGNATURE}</p>
        </Reveal>
      </div>
    </section>
  );
}

/** Problema real del tráfico frío. */
export function Problema() {
  const cards = [
    {
      t: "Recetas sueltas por todos lados",
      d: "Guardadas en redes, imposibles de encontrar cuando de verdad quieres preparar algo.",
    },
    {
      t: "Cantidades que no cuadran",
      d: "Una dice tazas, otra gramos, y ninguna explica cuánto rinde realmente.",
    },
    {
      t: "Dudas que frenan",
      d: "¿Puede comer esto? ¿Cuánto dura? ¿Cómo lo guardo? Sin respuesta, no se prepara nada.",
    },
  ];
  return (
    <section className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-24">
      <Reveal>
        <SectionLabel>El problema</SectionLabel>
        <h2 className="text-balance-tight mt-4 text-2xl sm:text-4xl">
          El problema nunca fue la falta de recetas.
        </h2>
        <p className="mt-3 text-muted-foreground">Fue la falta de claridad.</p>
      </Reveal>
      <div className="mt-9 grid gap-4 sm:grid-cols-3">
        {cards.map((c, i) => (
          <Reveal key={c.t} delay={i * 70}>
            <div className="surface h-full rounded-2xl p-5">
              <h3 className="text-base">{c.t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{c.d}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/** Reveal verde profundo: no es otro libro de recetas. */
export function PlataformaReveal() {
  const acciones = [
    "Elegir por categoría o por lo que tienes en casa",
    "Ajustar cuánto quieres preparar y ver las cantidades cambiar",
    "Seguir la preparación paso a paso desde el celular",
    "Guardar tus recetas favoritas",
    "Armar tu lista de compras automáticamente",
    "Calcular cuánto te cuesta cada preparación",
  ];
  return (
    <section className="bg-forest text-cream">
      <div className="mx-auto max-w-5xl px-5 py-20 md:px-8 md:py-28">
        <Reveal>
          <p className="text-xs tracking-[0.18em] text-cream/60 uppercase">La diferencia</p>
          <h2 className="text-balance-tight mt-4 text-2xl leading-snug sm:text-4xl">
            No creamos otro libro de recetas. Creamos el lugar donde preparar deja de ser
            complicado.
          </h2>
          <p className="mt-5 max-w-2xl leading-relaxed text-cream/80">
            No es un PDF que abres una vez y olvidas. Es una plataforma que usas cada vez que
            quieres prepararle algo.
          </p>
        </Reveal>
        <div className="mt-10 grid gap-3 sm:grid-cols-2">
          {acciones.map((a, i) => (
            <Reveal key={a} delay={i * 50}>
              <div className="flex gap-3 rounded-2xl border border-cream/15 bg-cream/5 p-4 text-sm leading-relaxed">
                <span className="text-honey">✓</span>
                <span>{a}</span>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/** Mecanismo simple en 3 pasos. */
export function ComoFunciona() {
  const steps = [
    { n: "01", t: "Elige", d: "Entra, filtra por categoría y abre la receta que quieras hacer." },
    { n: "02", t: "Ajusta", d: "Define cuánto quieres preparar y las cantidades se recalculan." },
    { n: "03", t: "Prepara", d: "Sigue el paso a paso desde el celular, sin adivinar nada." },
  ];
  return (
    <section className="mx-auto max-w-5xl px-5 py-16 md:px-8 md:py-24">
      <Reveal>
        <SectionLabel>Cómo funciona</SectionLabel>
        <h2 className="text-balance-tight mt-4 text-2xl sm:text-4xl">Elige. Ajusta. Prepara.</h2>
      </Reveal>
      <div className="mt-9 grid gap-4 sm:grid-cols-3">
        {steps.map((s, i) => (
          <Reveal key={s.n} delay={i * 70}>
            <div className="surface h-full rounded-2xl p-6">
              <span className="font-display text-honey text-3xl">{s.n}</span>
              <h3 className="mt-3 text-base">{s.t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.d}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/** Herramientas incluidas dentro de la plataforma. */
export function Herramientas() {
  const tools = [
    { t: "Ajustador de cantidades", d: "Cambia el rendimiento y los ingredientes se recalculan." },
    { t: "Favoritas", d: "Marca lo que quieres volver a preparar." },
    { t: "Lista de compras", d: "Agrupa los ingredientes de las recetas que elegiste." },
    { t: "Calculadora de costos", d: "Registra precios y estima cuánto cuesta cada preparación." },
    { t: "Búsqueda por categoría", d: "Galletas, snacks, cupcakes, pasteles y cumpleaños." },
  ];
  return (
    <section className="border-y border-border bg-cream">
      <div className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-24">
        <Reveal>
          <SectionLabel>Herramientas</SectionLabel>
          <h2 className="text-balance-tight mt-4 text-2xl sm:text-4xl">
            Todo lo que necesitas, dentro de la misma plataforma.
          </h2>
        </Reveal>
        <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tools.map((t, i) => (
            <Reveal key={t.t} delay={i * 60}>
              <div className="surface h-full rounded-2xl p-5">
                <h3 className="text-base">{t.t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t.d}</p>
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

/** Comparación honesta frente a buscar gratis en internet. */
export function Comparacion() {
  const rows = [
    ["Encontrar la receta", "Buscar entre decenas de páginas", "Categorías organizadas"],
    ["Cantidades", "Medidas confusas o incompletas", "Ingredientes y cantidades exactas"],
    ["Cuánto preparar", "Cálculos a mano", "Ajustador automático"],
    ["Conservación", "Casi nunca aparece", "Incluida en cada receta"],
    ["Organización", "Capturas y links perdidos", "Favoritas y lista de compras"],
  ];
  return (
    <section className="border-y border-border bg-cream">
      <div className="mx-auto max-w-4xl px-5 py-16 md:px-8 md:py-24">
        <Reveal>
          <SectionLabel>Comparación</SectionLabel>
          <h2 className="text-balance-tight mt-4 text-2xl sm:text-4xl">
            Sí, puedes buscar gratis. La pregunta es cuánto tiempo te toma.
          </h2>
        </Reveal>
        <Reveal delay={80}>
          <div className="surface mt-8 overflow-hidden rounded-3xl">
            <div className="grid grid-cols-3 gap-3 border-b border-border bg-muted/50 px-5 py-3 text-xs font-semibold tracking-wide uppercase">
              <span />
              <span className="text-muted-foreground">Buscar por tu cuenta</span>
              <span className="text-primary">Con la plataforma</span>
            </div>
            {rows.map(([label, a, b]) => (
              <div
                key={label}
                className="grid grid-cols-3 gap-3 border-b border-border px-5 py-4 text-sm last:border-b-0"
              >
                <span className="font-medium">{label}</span>
                <span className="text-muted-foreground">{a}</span>
                <span>{b}</span>
              </div>
            ))}
          </div>
        </Reveal>
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

/** Encaje positivo. */
export function ParaQuien() {
  const si = [
    "Amas a tu perro y quieres prepararle algo con tus propias manos",
    "Quieres saber exactamente qué ingredientes le estás dando",
    "Buscas ideas para su cumpleaños o momentos especiales",
    "Prefieres recetas simples, con ingredientes de supermercado",
    "Quieres todo organizado en un solo lugar, desde el celular",
  ];
  return (
    <section className="border-y border-border bg-cream">
      <div className="mx-auto max-w-4xl px-5 py-16 md:px-8 md:py-24">
        <Reveal>
          <SectionLabel>Para ti</SectionLabel>
          <h2 className="text-balance-tight mt-4 text-2xl sm:text-4xl">Esto es para ti si…</h2>
        </Reveal>
        <Reveal delay={80}>
          <ul className="surface mt-8 space-y-3.5 rounded-3xl p-6 text-sm leading-relaxed">
            {si.map((t) => (
              <li key={t} className="flex gap-3">
                <span className="text-primary">✓</span>
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}

export function PruebaSocial() {
  if (!REVIEWS.enabled || REVIEWS.items.length === 0) return null;
  return (
    <section className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-24">
      <Reveal>
        <SectionLabel>Personas reales</SectionLabel>
        <h2 className="text-balance-tight mt-4 text-2xl sm:text-4xl">
          Lo que dicen quienes ya están preparando.
        </h2>
      </Reveal>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {REVIEWS.items.map((r, i) => (
          <Reveal key={r.name + r.country} delay={(i % 3) * 60}>
            <figure className="surface h-full rounded-2xl p-5 text-sm leading-relaxed">
              <p>{r.comment}</p>
              <figcaption className="mt-3 text-xs text-muted-foreground">
                {r.name} · {r.country}
              </figcaption>
            </figure>
          </Reveal>
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
      <div className="absolute inset-0 bg-[linear-gradient(100deg,oklch(0.32_0.06_155/0.94)_0%,oklch(0.32_0.06_155/0.78)_55%,oklch(0.32_0.06_155/0.4)_100%)]" />
      <div className="relative mx-auto max-w-3xl px-5 py-24 md:px-8 md:py-32">
        <Reveal>
          <h2 className="text-balance-tight max-w-xl text-3xl leading-tight text-cream sm:text-4xl">
            Él no sabe que estás a un clic de preparar algo especial.
          </h2>
          <p className="mt-3 text-lg font-medium text-cream/85">{BRAND_SIGNATURE}</p>
          <Cta
            asChild
            size="lg"
            className="mt-8 w-full sm:w-auto"
            onClick={() => {
              track("final_cta_clicked");
              track("checkout_clicked", { location: "final" });
            }}
          >
            <a href={CHECKOUT_URL}>{CTA_TEXT}</a>
          </Cta>
          <p className="mt-4 text-sm text-cream/85">
            {REGULAR_PRICE} · Pago único · {RECIPE_COUNT} recetas
          </p>
          <p className="text-xs text-cream/70">Acceso inmediato</p>
        </Reveal>
      </div>
    </section>
  );
}
