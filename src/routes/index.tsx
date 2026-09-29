import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { Download, Mail, ShieldCheck, Sparkles, Star, User } from "lucide-react";

import heroNino from "@/assets/hero-nino.webp";
import problemaPantalla from "@/assets/problema-pantalla.webp";
import pasoCelular from "@/assets/paso-celular.webp";
import pasoRecortar from "@/assets/paso-recortar.webp";
import appCelular from "@/assets/app-celular.webp";
import { supabase } from "@/integrations/supabase/client";

const CHECKOUT_URLS: Record<"basic" | "premium", string> = {
  basic: "",
  premium: "",
} as const;

const UTM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
] as const;

type PlanKey = keyof typeof CHECKOUT_URLS;

const plans = [
  {
    key: "basic" as const,
    name: "Básico",
    price: "US$13,51",
    description: "Una primera aventura completa para empezar hoy.",
    features: [
      "2 personajes: 1 niño y 1 niña",
      "3 opciones de cada prenda: pantalón, zapatillas, gorra y más",
      "Personaje montado o base con piezas separadas para vestir",
      "Versión a color y versión para colorear",
      "4 historias de aventura",
    ],
  },
  {
    key: "premium" as const,
    name: "Premium",
    price: "US$19,45",
    description: "Más personajes, más mundos y nuevas aventuras con frecuencia.",
    features: [
      "4 personajes: 2 niños y 2 niñas (el doble del Básico)",
      "Los 8 temas completos, en versión niño y niña",
      "Superhéroe, Príncipe/Princesa, Guerrero/a y Mago/Bruja",
      "Astronauta, Pirata, Normal y Cachorro/Gato",
      "Versión a color y versión para colorear",
      "6 historias de aventura",
      "3 historias nuevas cada 18 días",
    ],
    featured: true,
  },
];

const testimonials = [
  {
    name: "Camila R.",
    quote:
      "Pensé que sería una actividad más que usaría una vez y olvidaría. Pero poder elegir la ropa y armar el personaje hizo que todo fuera mucho más interesante. Ya imprimió combinaciones distintas varias veces.",
  },
  {
    name: "Renata M.",
    quote:
      "Mi mayor temor era que ni le importara, porque está muy acostumbrado a la tablet. Me sorprendió cuando empezó a elegir los personajes e inventar historias solo. Fue una de las pocas actividades fuera de la pantalla que realmente le llamaron la atención.",
  },
  {
    name: "Juliana A.",
    quote:
      "Cuando vi que había que imprimir, pensé que todo el trabajo terminaría siendo mío. Pero fue mucho más simple de lo que imaginaba. Lo imprimí, se lo di y listo. Después de eso, ella misma se quedó eligiendo, armando y jugando.",
  },
  {
    name: "Mariana S.",
    quote:
      "Ya estaba cansada de recurrir al celular cada vez que necesitaba entretener a mi hijo. Me gustó tener ahora una alternativa simple que él realmente acepta. Verlo crear y jugar sin pedir una pantalla todo el tiempo me dejó mucho más tranquila.",
  },
  {
    name: "Fernanda L.",
    quote:
      "Mi duda era si al imprimir en casa quedaría lindo o con cara de actividad demasiado simple. Quedó mucho mejor de lo que esperaba, incluso usando mi impresora común. Cuando vi la cantidad de opciones que podía usar, tuvo mucho más sentido para mí.",
  },
];

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Héroes de Papel — Menos pantalla, más imaginación" },
      {
        name: "description",
        content:
          "Personajes de papel personalizables para imprimir en casa. Una actividad lista para crear, recortar y jugar lejos de la pantalla.",
      },
      { property: "og:title", content: "Héroes de Papel — Una actividad lista para compartir" },
      {
        property: "og:description",
        content:
          "Elige un personaje, imprímelo en casa y convierte una tarde cualquiera en una aventura creada por tu hijo.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LandingPage,
});

function getUtmParams(): Partial<Record<(typeof UTM_KEYS)[number], string>> {
  if (typeof window === "undefined") return {};
  const params = new URLSearchParams(window.location.search);
  const result: Partial<Record<(typeof UTM_KEYS)[number], string>> = {};
  for (const key of UTM_KEYS) {
    const value = params.get(key);
    if (value) result[key] = value;
  }
  return result;
}

function useCheckoutUrl(plan: PlanKey) {
  const baseUrl = CHECKOUT_URLS[plan];
  const [url, setUrl] = useState(baseUrl);

  useEffect(() => {
    if (!baseUrl) return;
    const params = new URLSearchParams(window.location.search);
    const utms = UTM_KEYS.filter((key) => params.get(key)).map(
      (key) => `${key}=${encodeURIComponent(params.get(key) as string)}`,
    );
    setUrl(utms.length ? `${baseUrl}${baseUrl.includes("?") ? "&" : "?"}${utms.join("&")}` : baseUrl);
  }, [baseUrl]);

  return url;
}

async function hashIp(): Promise<string> {
  try {
    const response = await fetch("https://api.ipify.org?format=json");
    const data = (await response.json()) as { ip?: string };
    const seed = data.ip && data.ip.length > 0 ? data.ip : crypto.randomUUID();
    const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(seed));
    return Array.from(new Uint8Array(digest))
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("");
  } catch {
    return crypto.randomUUID().replace(/-/g, "");
  }
}

type LeadStatus = "idle" | "loading" | "success" | "duplicate" | "error";

function LeadCaptureForm({ plan }: { plan: PlanKey }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<LeadStatus>("idle");
  const inputId = `lead-email-${plan}`;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "loading") return;
    setStatus("loading");

    const normalizedEmail = email.trim().toLowerCase();
    const ipHash = await hashIp();
    const utm = getUtmParams();
    const { error } = await supabase
      .from("lead_signups")
      .insert({
        email: normalizedEmail,
        plan,
        ip_hash: ipHash,
        utm_source: utm.utm_source ?? null,
        utm_medium: utm.utm_medium ?? null,
        utm_campaign: utm.utm_campaign ?? null,
        utm_content: utm.utm_content ?? null,
        utm_term: utm.utm_term ?? null,
      });

    if (!error) {
      setStatus("success");
      return;
    }
    setStatus(error.code === "23505" ? "duplicate" : "error");
  }

  if (status === "success" || status === "duplicate") {
    return (
      <p className="flex w-full items-center justify-center rounded-full bg-brand/10 px-6 py-3.5 text-center text-sm font-semibold text-brand">
        {status === "duplicate"
          ? "Ya estás en la lista — te avisamos apenas abramos."
          : "¡Listo! Te avisamos por correo apenas abramos las compras."}
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <label htmlFor={inputId} className="sr-only">Correo electrónico</label>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          id={inputId}
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Tu correo electrónico"
          className="w-full rounded-full border border-border bg-background px-5 py-3.5 text-sm text-ink placeholder:text-muted-foreground focus:border-brand focus:outline-none"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="flex shrink-0 items-center justify-center rounded-full bg-brand px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-cta transition-colors hover:bg-brand-deep disabled:opacity-70"
        >
          {status === "loading" ? "Enviando…" : "Avisarme"}
        </button>
      </div>
      {status === "error" && (
        <p className="mt-2 text-center text-xs text-destructive">
          Hubo un problema al guardar tu correo. Intenta de nuevo en un momento.
        </p>
      )}
      <p className="mt-2 text-center text-xs text-muted-foreground">
        Sin spam. Te avisamos por correo apenas se habilite la compra, con un beneficio especial para quienes se anoten antes del lanzamiento.
      </p>
    </form>
  );
}

function PlanButton({ plan }: { plan: PlanKey }) {
  const href = useCheckoutUrl(plan);
  const label = plan === "premium" ? "Elegir Premium" : "Elegir Básico";

  if (!href) {
    return <LeadCaptureForm plan={plan} />;
  }

  return (
    <a
      href={href}
      className="flex w-full items-center justify-center rounded-full bg-brand px-6 py-3.5 font-semibold text-primary-foreground shadow-cta transition-colors hover:bg-brand-deep"
    >
      {label}
    </a>
  );
}

function PrimaryCta({ label = "Quiero mi Héroe de Papel" }: { label?: string }) {
  return (
    <a
      href="#planes"
      className="inline-flex items-center justify-center rounded-full bg-brand px-7 py-4 font-semibold text-primary-foreground shadow-cta transition-colors hover:bg-brand-deep"
    >
      {label}
    </a>
  );
}

function StickyMobileCta() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/95 p-3 shadow-lift backdrop-blur-md sm:hidden">
      <a
        href="#planes"
        className="flex w-full items-center justify-center rounded-full bg-brand px-6 py-3 text-sm font-semibold text-primary-foreground shadow-cta transition-colors hover:bg-brand-deep"
      >
        Quiero mi Héroe de Papel
      </a>
    </div>
  );
}

function LandingPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-paper pb-20 font-body text-ink sm:pb-0">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-6">
        <a href="#inicio" className="flex items-center gap-2" aria-label="Héroes de Papel, inicio">
          <span className="grid size-9 place-items-center rounded-lg bg-brand font-display text-lg font-semibold text-primary-foreground">
            H
          </span>
          <span className="font-display text-lg font-semibold">Héroes de Papel</span>
        </a>
        <a href="#planes" className="hidden text-sm font-semibold text-brand hover:text-brand-deep sm:block">
          Ver planes
        </a>
      </header>

      <section id="inicio" className="mx-auto grid max-w-6xl items-center gap-10 px-5 pt-5 pb-16 md:grid-cols-[1.05fr_.95fr] md:pt-12">
        <div>
          <p className="text-sm font-semibold text-brand">Una alternativa simple a “solo 15 minutos más”</p>
          <h1 className="mt-4 max-w-2xl font-display text-4xl leading-[1.04] font-semibold text-balance sm:text-6xl">
            Cuando no sabes qué inventar, la pantalla gana. Ahora tienes otra opción lista.
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground">
            Tu hijo crea su propio personaje, lo imprimen en casa y empieza a jugar con algo que
            eligió él. Sin preparar una actividad desde cero. Sin comprar materiales especiales.
          </p>
          <div className="mt-7">
            <PrimaryCta />
            <p className="mt-3 text-xs text-muted-foreground">
              Desde US$13,51 · Descarga instantánea · Garantía de 7 días
            </p>
          </div>
          <ul className="mt-6 grid gap-2 text-sm text-muted-foreground sm:grid-cols-3">
            <li className="flex items-center gap-2"><span className="text-brand">✓</span> Personaliza</li>
            <li className="flex items-center gap-2"><span className="text-brand">✓</span> Imprime en casa</li>
            <li className="flex items-center gap-2"><span className="text-brand">✓</span> Juega sin pantalla</li>
          </ul>
        </div>
        <div className="relative">
          <img
            src={heroNino}
            alt="Niño jugando con un héroe de papel que creó en casa"
            width={1024}
            height={1024}
            fetchPriority="high"
            className="aspect-square w-full rounded-3xl object-cover shadow-lift"
          />
          <div className="absolute right-4 bottom-4 left-4 rounded-2xl bg-surface/90 p-4 shadow-soft backdrop-blur-md">
            <p className="font-display text-lg font-semibold">De una elección en el celular a una historia en sus manos.</p>
          </div>
        </div>
      </section>

      <section className="bg-ink py-16 text-paper">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 md:grid-cols-[.8fr_1.2fr] md:items-center">
          <div>
            <p className="text-sm font-semibold text-amber">No es falta de ganas</p>
            <h2 className="mt-3 font-display text-3xl font-semibold text-balance sm:text-4xl">
              Estás cansado. Tu hijo está aburrido. Y la pantalla siempre está lista.
            </h2>
          </div>
          <div className="space-y-4 text-base leading-relaxed text-paper/75">
            <p>
              Después de un día largo, pensar una actividad, buscar materiales y conseguir que se
              interese se siente como otra tarea más. Entonces aparecen esos “15 minutos” que se
              estiran, y después llega la culpa.
            </p>
            <p className="font-semibold text-paper">
              El problema no es que no te importe. Es que necesitabas una alternativa que también
              estuviera lista cuando ya no tienes energía para improvisar.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold text-brand">Lo que cambia para ustedes</p>
          <h2 className="mt-3 font-display text-3xl font-semibold text-balance sm:text-4xl">
            No es solo un archivo para imprimir. Es una actividad que ya viene pensada.
          </h2>
        </div>
        <div className="mt-8 grid gap-px overflow-hidden rounded-2xl bg-border sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Menos carga mental", "No tienes que buscar ideas, reglas o materiales difíciles."],
            ["Más participación", "Tu hijo decide cómo se ve su personaje y siente que es suyo."],
            ["No se agota en un solo uso", "Cambia la ropa, repite con nuevas historias y vuelve a jugar otro día."],
            ["Un momento compartido", "Elegir, recortar y armar también forman parte de la experiencia."],
          ].map(([title, copy]) => (
            <article key={title} className="bg-surface p-6">
              <h3 className="font-display text-xl font-semibold">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="como-funciona" className="bg-mist py-16">
        <div className="mx-auto max-w-6xl px-5">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold text-brand">De la idea al juego</p>
            <h2 className="mt-3 font-display text-3xl font-semibold sm:text-4xl">Así empieza la aventura</h2>
          </div>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {[
              { n: "01", title: "Elige", copy: "Tu hijo combina personaje, ropa, accesorios y tema.", image: pasoCelular, alt: "Padre e hijo personalizando un personaje en el celular" },
              { n: "02", title: "Imprime y recorta", copy: "Usa una impresora común y papel que ya tengas en casa.", image: pasoRecortar, alt: "Manos recortando un personaje de papel impreso" },
              { n: "03", title: "Crea su historia", copy: "El personaje sale de la pantalla y entra en una aventura inventada por él.", image: heroNino, alt: "Niño jugando con su personaje de papel" },
            ].map((step) => (
              <article key={step.n} className="overflow-hidden rounded-2xl bg-surface shadow-soft">
                <img src={step.image} alt={step.alt} loading="lazy" width={816} height={816} className="aspect-[4/3] w-full object-cover" />
                <div className="p-6">
                  <span className="text-xs font-bold text-brand">{step.n}</span>
                  <h3 className="mt-2 font-display text-xl font-semibold">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.copy}</p>
                </div>
              </article>
            ))}
          </div>
          <p className="mt-6 text-sm text-muted-foreground">
            Producto 100% digital. Al confirmar el pago, te llega por correo electrónico el enlace de acceso a la plataforma — nada físico, nada que esperar.
          </p>
        </div>
      </section>

      <section id="como-recibes" className="mx-auto max-w-6xl px-5 py-16">
        <div className="grid items-center gap-10 md:grid-cols-[.85fr_1.15fr]">
          <div className="mx-auto w-full max-w-sm">
            <img
              src={appCelular}
              alt="Celular mostrando la plataforma de Héroes de Papel: pantalla para elegir cabello, ropa y gorro, con botón para descargar el personaje"
              loading="lazy"
              width={1200}
              height={1500}
              className="aspect-[4/5] w-full rounded-3xl object-cover shadow-lift"
            />
          </div>
          <div>
            <p className="text-sm font-semibold text-brand">Así se ve lo que recibes</p>
            <h2 className="mt-3 font-display text-3xl font-semibold text-balance sm:text-4xl">
              Un enlace por correo. Una pantalla simple. Tu hijo elige y descarga.
            </h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              Apenas confirmas el pago, te llega el acceso a la plataforma. Ahí tu hijo elige
              cabello, ropa y gorro, ve a su personaje tomar forma al instante y lo descarga listo
              para imprimir. Funciona desde el celular, la tablet o la computadora — no hay que
              instalar nada.
            </p>
            <ul className="mt-6 space-y-4">
              <li className="flex items-start gap-3">
                <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-full bg-brand/10 text-brand">
                  <Mail className="size-4" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-sm font-semibold">Acceso instantáneo por correo</p>
                  <p className="text-sm text-muted-foreground">Llega apenas confirmas el pago, sin esperar nada.</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-full bg-brand/10 text-brand">
                  <Sparkles className="size-4" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-sm font-semibold">Personalización 100% online</p>
                  <p className="text-sm text-muted-foreground">Cambia cabello, ropa y gorro y ve el resultado al instante.</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-full bg-brand/10 text-brand">
                  <Download className="size-4" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-sm font-semibold">Descarga lista para imprimir</p>
                  <p className="text-sm text-muted-foreground">Un PDF en segundos, sin apps que instalar.</p>
                </div>
              </li>
            </ul>
            <div className="mt-7"><PrimaryCta label="Quiero crear mi Héroe" /></div>
          </div>
        </div>
      </section>

      <section id="planes" className="mx-auto max-w-6xl px-5 py-16">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold text-brand">Elige cuánto mundo quieres abrir</p>
          <h2 className="mt-3 font-display text-3xl font-semibold text-balance sm:text-5xl">Dos planes. La misma idea: menos improvisación y más juego.</h2>
          <p className="mt-4 text-muted-foreground">Premium duplica los personajes y desbloquea los 8 temas completos, por solo US$5,94 más.</p>
        </div>
        <div className="mx-auto mt-10 grid max-w-4xl gap-5 md:grid-cols-2 md:items-start">
          {plans.map((plan) => (
            <article key={plan.key} className={`rounded-2xl border p-7 ${plan.featured ? "border-brand bg-surface shadow-lift" : "border-border bg-surface"}`}>
              {plan.featured && <p className="mb-4 inline-flex rounded-full bg-brand/10 px-3 py-1 text-xs font-bold text-brand">Más variedad por US$5,94 más</p>}
              <h3 className="font-display text-2xl font-semibold">{plan.name}</h3>
              <p className="mt-2 min-h-12 text-sm leading-relaxed text-muted-foreground">{plan.description}</p>
              <p className="mt-5 font-display text-4xl font-semibold">{plan.price}</p>
              <p className="mt-1 text-sm text-muted-foreground">Pago único</p>
              <ul className="mt-6 space-y-3 border-t border-border pt-6 text-sm">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex gap-3 leading-relaxed"><span className="shrink-0 font-bold text-brand">✓</span><span>{feature}</span></li>
                ))}
              </ul>
              <div className="mt-7"><PlanButton plan={plan.key} /></div>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-5 py-4">
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-brand/20 bg-brand/5 p-7 text-center sm:flex-row sm:text-left">
          <span className="grid size-12 shrink-0 place-items-center rounded-full bg-brand/10">
            <ShieldCheck className="size-6 text-brand" aria-hidden="true" />
          </span>
          <div>
            <p className="font-display text-lg font-semibold">Garantía de 7 días, sin preguntas.</p>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              Si no te sirve, te devolvemos el 100% de tu dinero. Así de simple.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold text-brand">Lo que dicen las familias</p>
          <h2 className="mt-3 font-display text-3xl font-semibold text-balance sm:text-4xl">Familias que ya probaron Héroes de Papel</h2>
        </div>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial) => (
            <article key={testimonial.name} className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-6 shadow-soft">
              <div className="flex items-center gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-brand/10 text-brand">
                  <User className="size-5" aria-hidden="true" />
                </span>
                <p className="text-sm font-semibold">{testimonial.name}</p>
              </div>
              <div className="flex gap-0.5 text-amber" aria-hidden="true">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="size-4" fill="currentColor" />
                ))}
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">“{testimonial.quote}”</p>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-surface py-16">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 md:grid-cols-2">
          <img src={problemaPantalla} alt="Niña mirando una pantalla en una sala oscura" loading="lazy" width={1024} height={768} className="aspect-[4/3] w-full rounded-2xl object-cover" />
          <div>
            <p className="text-sm font-semibold text-brand">Una alternativa posible, no una promesa perfecta</p>
            <h2 className="mt-3 font-display text-3xl font-semibold text-balance sm:text-4xl">No tienes que eliminar todas las pantallas para cambiar una tarde.</h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              Héroes de Papel no promete resolver cada momento de aburrimiento. Te da algo más realista: una opción concreta, fácil de preparar y lo bastante personal para invitar a tu hijo a crear.
            </p>
            <div className="mt-7"><PrimaryCta label="Comparar los planes" /></div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-5 py-16">
        <h2 className="text-center font-display text-3xl font-semibold sm:text-4xl">Preguntas antes de elegir</h2>
        <div className="mt-8 space-y-3">
          {[
            { q: "¿Necesito una impresora especial?", a: "No. Puedes usar una impresora común y el papel que tengas en casa." },
            { q: "¿Para qué edades está pensado?", a: "Está pensado para niños de 3 a 8 años. Los más pequeños pueden necesitar ayuda para recortar y armar." },
            { q: "¿Cuál es la diferencia principal entre los planes?", a: "Básico trae 2 personajes y 4 historias. Premium trae 4 personajes, los 8 temas completos, 6 historias y 3 historias nuevas cada 18 días." },
            { q: "¿Se puede usar más de una vez?", a: "Sí. Puedes volver a imprimir, cambiar prendas, colorear otras versiones y crear aventuras diferentes." },
            { q: "¿Cómo voy a recibir el producto?", a: "Completas tus datos en el checkout y confirmas el pago. Al instante, te llega por correo electrónico (el mismo que usaste en el checkout) el enlace de acceso a la plataforma para crear y descargar tu Héroe de Papel. No se envía nada físico. ¿No te llegó? Escríbenos a lucasmurilo1120@gmail.com." },
          ].map((item) => (
            <details key={item.q} className="group border-b border-border py-1">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-left font-semibold">
                {item.q}<span className="text-brand transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="max-w-2xl pb-5 text-sm leading-relaxed text-muted-foreground">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="bg-brand py-16 text-primary-foreground">
        <div className="mx-auto max-w-3xl px-5 text-center">
          <p className="text-sm font-semibold text-primary-foreground/75">No hace falta preparar una tarde perfecta</p>
          <h2 className="mt-3 font-display text-3xl font-semibold text-balance sm:text-5xl">Hace falta una alternativa simple que esté lista cuando la necesites.</h2>
          <a href="#planes" className="mt-7 inline-flex items-center justify-center rounded-full bg-surface px-7 py-4 font-semibold text-ink shadow-soft">Ver Básico y Premium</a>
        </div>
      </section>

      <footer className="mx-auto max-w-6xl px-5 py-8 text-center text-xs text-muted-foreground">
        Héroes de Papel · Producto digital · Soporte:{" "}
        <a href="mailto:lucasmurilo1120@gmail.com" className="underline hover:text-brand">
          lucasmurilo1120@gmail.com
        </a>{" "}
        · © 2026
      </footer>
      <StickyMobileCta />
    </main>
  );
}