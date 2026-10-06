import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { z } from "zod";
import { Download, Mail, Printer, Scissors, ShieldCheck, Sparkles } from "lucide-react";
import pasoCelular from "@/assets/paso-celular.jpg.asset.json";
import pasoRecortar from "@/assets/paso-recortar.jpg.asset.json";
import heroNino from "@/assets/hero-nino.jpg.asset.json";
import { supabase } from "@/integrations/supabase/client";

// ---------------------------------------------------------------------------
// Configuración de la oferta: todo lo que cambia la venta está acá arriba.
// Cuando tengas los links de Hotmart/Kiwify, pégalos en CHECKOUT_URLS y los
// botones pasan solos de "Avísame" a "Comprar".
// ---------------------------------------------------------------------------
const BRAND = "Papelitos";
const CHECKOUT_URLS: Record<PlanKey, string> = { basic: "", premium: "" };
const SUPPORT_EMAIL = "lucasmurilo1120@gmail.com";
const IMG = "/marketing";

type PlanKey = "basic" | "premium";

const PLANS: {
  key: PlanKey;
  name: string;
  price: string;
  note: string;
  description: string;
  features: string[];
  featured?: boolean;
}[] = [
  {
    key: "basic",
    name: "Básico",
    price: "US$13,51",
    note: "Pago único · Sale a menos de US$0,50 por página",
    description: "El kit completo para empezar a jugar hoy.",
    features: [
      "4 personajes para elegir",
      "7 looks por personaje: normal, superhéroe, pirata, astronauta, mago/bruja, guerrero y realeza",
      "Cada look también en versión para colorear",
      "12 historias donde tu hijo es el protagonista, con su nombre",
      "Certificado de héroe con su nombre",
      "Crea un kit para cada hijo, sin límite",
    ],
  },
  {
    key: "premium",
    name: "Premium",
    price: "US$19,45",
    note: "Pago único · Solo US$5,94 más que el Básico",
    description: "Todo el Básico y un mundo que sigue creciendo.",
    features: [
      "Todo lo del plan Básico",
      "Personajes nuevos a medida que se lanzan, sin pagar de nuevo",
      "3 historias nuevas cada 18 días",
      "Acceso a todas las actualizaciones del kit",
    ],
    featured: true,
  },
];

const CHARACTERS = [
  { key: "nino", label: "Niño" },
  { key: "nina", label: "Niña" },
  { key: "nino2", label: "Niño 2" },
  { key: "nina2", label: "Niña 2" },
] as const;

const THEMES = [
  { key: "ninguno", label: "Normal" },
  { key: "superheroe", label: "Superhéroe" },
  { key: "pirata", label: "Pirata" },
  { key: "astronauta", label: "Astronauta" },
  { key: "mago", label: "Mago/Bruja" },
  { key: "guerreiro", label: "Guerrero" },
  { key: "realeza", label: "Realeza" },
] as const;

const FAQ = [
  {
    q: "¿Qué recibo exactamente?",
    a: "Un acceso a la plataforma de Papelitos. Ahí escribes el nombre de tu hijo, eliges su personaje y descargas su kit en PDF: 28 páginas con portada, 7 looks, 7 páginas para colorear, 12 historias con su nombre y su certificado de héroe.",
  },
  {
    q: "¿Cómo y cuándo lo recibo?",
    a: "Apenas se confirma el pago, te llega por e-mail (el mismo que usaste en la compra) el enlace de acceso. Es 100% digital: no se envía nada físico y no hay que esperar.",
  },
  {
    q: "¿Necesito una impresora especial?",
    a: "No. Funciona con cualquier impresora común. Si usas cartulina o papel grueso, los personajes duran mucho más y se mantienen de pie mejor.",
  },
  {
    q: "¿Para qué edades es?",
    a: "Para niños de 3 a 8 años. Los más pequeños pueden necesitar ayuda de un adulto para recortar.",
  },
  {
    q: "Tengo más de un hijo. ¿Tengo que comprar dos veces?",
    a: "No. Puedes crear un kit con el nombre de cada hijo, las veces que quieras.",
  },
  {
    q: "¿Necesito instalar algo?",
    a: "No. Se usa desde el navegador del celular, la tablet o la computadora.",
  },
  {
    q: "¿Cuál es la diferencia entre los planes?",
    a: "El Básico trae el kit completo de hoy. El Premium suma los personajes nuevos que lancemos y 3 historias nuevas cada 18 días, sin volver a pagar.",
  },
  {
    q: "¿Y si no me gusta?",
    a: "Tienes 7 días de garantía. Si no te convence, te devolvemos el 100% de tu dinero, sin preguntas.",
  },
];

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: `${BRAND}: el kit de héroe con el nombre de tu hijo` },
      {
        name: "description",
        content:
          "Escribe su nombre y descarga su kit de 28 páginas para imprimir: 7 looks, 12 historias donde es el protagonista y su certificado de héroe.",
      },
      { property: "og:title", content: `${BRAND}: su nombre en cada historia` },
      {
        property: "og:description",
        content: "Un kit de héroe personalizado para imprimir en casa y jugar lejos de la pantalla.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LandingPage,
});

// ---------------------------------------------------------------------------
// Componentes
// ---------------------------------------------------------------------------

const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"] as const;
const emailSchema = z.string().trim().toLowerCase().email("Escribe un e-mail válido.").max(255);

function withUtms(url: string) {
  if (typeof window === "undefined" || !url) return url;
  const params = new URLSearchParams(window.location.search);
  const utms = UTM_KEYS.filter((k) => params.get(k)).map((k) => `${k}=${encodeURIComponent(params.get(k) as string)}`);
  return utms.length ? `${url}${url.includes("?") ? "&" : "?"}${utms.join("&")}` : url;
}

async function hashIp(): Promise<string> {
  try {
    const response = await fetch("https://api.ipify.org?format=json");
    const data = (await response.json()) as { ip?: string };
    const seed = data.ip && data.ip.length > 0 ? data.ip : crypto.randomUUID();
    const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(seed));
    return Array.from(new Uint8Array(digest))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  } catch {
    return crypto.randomUUID().replace(/-/g, "");
  }
}

function PrimaryCta({ label = "Quiero el kit de mi hijo", className = "" }: { label?: string; className?: string }) {
  return (
    <a
      href="#planes"
      className={`inline-flex items-center justify-center rounded-full bg-brand px-7 py-4 text-base font-semibold text-primary-foreground shadow-cta transition-[transform,background-color] duration-150 ease-out hover:bg-brand-deep active:scale-[0.97] ${className}`}
    >
      {label}
    </a>
  );
}

function LeadForm({ plan, planName }: { plan: PlanKey; planName: string }) {
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "loading") return;
    const parsed = emailSchema.safeParse(email);
    if (!parsed.success) {
      setMessage(parsed.error.issues[0]?.message ?? "Escribe un e-mail válido.");
      return;
    }
    setMessage("");
    setStatus("loading");
    if (website) {
      setStatus("success");
      return;
    }
    try {
      const params = new URLSearchParams(window.location.search);
      const utm = Object.fromEntries(UTM_KEYS.map((k) => [k, params.get(k)]));
      const { error } = await supabase
        .from("lead_signups")
        .insert({ email: parsed.data, plan, ip_hash: await hashIp(), ...utm });
      if (error && error.code !== "23505") throw new Error("No pudimos guardar tu e-mail. Inténtalo de nuevo.");
      setStatus("success");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No pudimos guardar tu e-mail. Inténtalo de nuevo.");
      setStatus("idle");
    }
  }

  if (status === "success") {
    return (
      <p role="status" className="rounded-2xl bg-mist p-4 text-sm font-medium">
        ¡Listo! Te avisamos por e-mail apenas abramos las compras del plan {planName}.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-3">
      <p className="text-sm leading-relaxed text-muted-foreground">
        Las compras abren muy pronto. Déjanos tu e-mail y te avisamos primero, con el precio de lanzamiento.
      </p>
      <label htmlFor={`email-${plan}`} className="block text-xs font-semibold">
        Tu e-mail
      </label>
      <input
        id={`email-${plan}`}
        type="email"
        name="email"
        autoComplete="email"
        inputMode="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        maxLength={255}
        placeholder="tu@email.com"
        aria-invalid={!!message}
        aria-describedby={message ? `error-${plan}` : undefined}
        className="h-12 w-full rounded-xl border border-border bg-paper px-4 text-base outline-none transition-colors focus:border-brand"
      />
      <div className="absolute -left-[9999px]" aria-hidden="true">
        <label htmlFor={`website-${plan}`}>Sitio web</label>
        <input id={`website-${plan}`} tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
      </div>
      <button
        type="submit"
        disabled={status === "loading"}
        className="flex h-12 w-full items-center justify-center rounded-full bg-brand px-6 font-semibold text-primary-foreground shadow-cta transition-[transform,background-color] duration-150 ease-out hover:bg-brand-deep active:scale-[0.97] disabled:opacity-70"
      >
        {status === "loading" ? "Guardando…" : `Avísame del plan ${planName}`}
      </button>
      {message && (
        <p id={`error-${plan}`} role="alert" className="text-sm text-destructive">
          {message}
        </p>
      )}
    </form>
  );
}

function PlanAction({ plan, planName }: { plan: PlanKey; planName: string }) {
  const url = CHECKOUT_URLS[plan];
  if (!url) return <LeadForm plan={plan} planName={planName} />;
  return (
    <a
      href={withUtms(url)}
      className="flex h-12 w-full items-center justify-center rounded-full bg-brand px-6 font-semibold text-primary-foreground shadow-cta transition-[transform,background-color] duration-150 ease-out hover:bg-brand-deep active:scale-[0.97]"
    >
      Quiero el plan {planName}
    </a>
  );
}

// Sprite: 7 columnas (looks) x 4 filas (personajes), celdas de 200x330 px.
const CELL_W = 200;
const CELL_H = 330;

function SpriteCell({ row, col, scale = 1, alt }: { row: number; col: number; scale?: number; alt: string }) {
  const w = CELL_W * scale;
  const h = CELL_H * scale;
  return (
    <div className="relative overflow-hidden" style={{ width: w, height: h }}>
      <img
        src={`${IMG}/demo-sprite.webp`}
        alt={alt}
        loading="lazy"
        decoding="async"
        width={CELL_W * 7}
        height={CELL_H * 4}
        className="absolute max-w-none"
        style={{ width: CELL_W * 7 * scale, height: CELL_H * 4 * scale, left: -col * w, top: -row * h }}
      />
    </div>
  );
}

function Demo() {
  const [rawName, setRawName] = useState("");
  const [character, setCharacter] = useState(0);
  const [theme, setTheme] = useState(1);
  const name = rawName.trim();
  const shown = name || "tu hijo";
  const themeLabel = THEMES[theme].label;

  return (
    <section id="pruebalo" className="bg-mist py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-5">
        <h2 className="max-w-2xl font-display text-3xl font-semibold text-balance sm:text-4xl">
          Pruébalo ahora: escribe su nombre y elige su héroe.
        </h2>
        <p className="mt-3 max-w-xl text-muted-foreground">Así empieza su kit. Sin registrarte y sin pagar nada.</p>

        <div className="mt-10 grid items-start gap-8 md:grid-cols-[minmax(0,360px)_1fr]">
          <div className="mx-auto w-full max-w-[360px] rounded-3xl bg-surface p-6 text-center shadow-lift md:mx-0">
            <p className="text-xs font-semibold text-brand">{BRAND}</p>
            <p className="mt-1 font-display text-2xl leading-tight font-semibold">El kit de héroe de {shown}</p>
            <div className="mt-4 flex justify-center">
              <SpriteCell row={character} col={theme} scale={1.1} alt={`${CHARACTERS[character].label}, look ${themeLabel}`} />
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              Look {themeLabel} · 1 de las 28 páginas de su kit
            </p>
          </div>

          <div className="space-y-7">
            <div>
              <label htmlFor="demo-name" className="mb-2 block text-sm font-semibold">
                ¿Cómo se llama tu hijo?
              </label>
              <input
                id="demo-name"
                type="text"
                value={rawName}
                maxLength={18}
                onChange={(e) => setRawName(e.target.value)}
                placeholder="Ej.: Mateo"
                autoComplete="off"
                className="h-12 w-full max-w-sm rounded-xl border border-border bg-surface px-4 text-base outline-none transition-colors focus:border-brand"
              />
            </div>

            <div>
              <p className="mb-3 text-sm font-semibold">Elige su personaje</p>
              <div className="flex flex-wrap gap-3">
                {CHARACTERS.map((c, i) => (
                  <button
                    key={c.key}
                    type="button"
                    onClick={() => setCharacter(i)}
                    aria-pressed={character === i}
                    aria-label={c.label}
                    className={`overflow-hidden rounded-2xl border-2 bg-surface transition-[transform,border-color] duration-150 ease-out active:scale-[0.97] ${
                      character === i ? "border-brand" : "border-transparent hover:border-border"
                    }`}
                  >
                    <SpriteCell row={i} col={0} scale={0.3} alt="" />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-3 text-sm font-semibold">Elige su look</p>
              <div className="flex flex-wrap gap-2">
                {THEMES.map((t, i) => (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => setTheme(i)}
                    aria-pressed={theme === i}
                    className={`min-h-11 rounded-full border px-4 text-sm font-medium transition-[transform,background-color] duration-150 ease-out active:scale-[0.97] ${
                      theme === i ? "border-brand bg-brand text-primary-foreground" : "border-border bg-surface hover:bg-paper"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-surface p-5">
              <p className="font-semibold">
                {name ? `El kit de ${name} trae:` : "Su kit completo trae:"}
              </p>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                Los 7 looks de su personaje, sus 7 versiones para colorear, 12 historias donde {shown} es el protagonista y su certificado de héroe.
              </p>
              <PrimaryCta label={name ? `Quiero el kit de ${name}` : "Quiero el kit de mi hijo"} className="mt-5 w-full sm:w-auto" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function LandingPage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-paper pb-24 font-body text-ink sm:pb-0">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
        <a href="#inicio" className="flex items-center gap-2" aria-label={`${BRAND}, inicio`}>
          <span className="grid size-9 place-items-center rounded-lg bg-brand font-display text-lg font-semibold text-primary-foreground">P</span>
          <span className="font-display text-lg font-semibold">{BRAND}</span>
        </a>
        <a href="#planes" className="hidden text-sm font-semibold text-brand hover:text-brand-deep sm:block">
          Ver planes
        </a>
      </header>

      {/* HERO */}
      <section id="inicio" className="mx-auto grid max-w-6xl items-center gap-8 px-5 pt-2 pb-14 md:grid-cols-[1fr_1fr] md:pt-8 md:pb-20">
        <div>
          <p className="text-sm font-semibold text-brand">Para niños de 3 a 8 años</p>
          <h1 className="mt-3 font-display text-4xl leading-[1.05] font-semibold text-balance sm:text-5xl lg:text-6xl">
            Su nombre en cada historia. Su héroe en sus manos.
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground">
            Un kit de 28 páginas para imprimir en casa: su héroe en 7 looks, 12 historias con su nombre y su certificado.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
            <PrimaryCta />
            <a href="#pruebalo" className="inline-flex min-h-11 items-center justify-center px-2 text-sm font-semibold text-brand hover:text-brand-deep">
              Pruébalo con su nombre
            </a>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">Pago único. Acceso inmediato por e-mail. Garantía de 7 días.</p>
        </div>
        <img
          src={`${IMG}/hero-kit.webp`}
          alt="Kit de Papelitos con portada personalizada, página para colorear, historia y personajes recortados"
          width={1200}
          height={1069}
          fetchPriority="high"
          className="mx-auto w-full max-w-[560px]"
        />
      </section>

      {/* DOLOR */}
      <section className="bg-ink py-16 text-paper sm:py-20">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 md:grid-cols-[.9fr_1.1fr] md:items-center">
          <h2 className="font-display text-3xl font-semibold text-balance sm:text-4xl">
            Estás cansado. Tu hijo está aburrido. Y la pantalla siempre está lista.
          </h2>
          <div className="space-y-4 text-base leading-relaxed text-paper/75">
            <p>
              Después de un día largo, pensar una actividad, buscar materiales y conseguir que se interese se siente como otra tarea más. Entonces aparecen esos “15 minutos más” que se estiran, y después llega la culpa.
            </p>
            <p className="font-semibold text-paper">
              No es falta de ganas. Te faltaba una actividad que ya estuviera lista y que a tu hijo le importe de verdad: una donde el héroe es él.
            </p>
          </div>
        </div>
      </section>

      <Demo />

      {/* QUÉ TRAE */}
      <section className="mx-auto max-w-6xl px-5 py-16 sm:py-20">
        <h2 className="max-w-2xl font-display text-3xl font-semibold text-balance sm:text-4xl">
          Todo lo que trae su kit, listo para imprimir.
        </h2>

        <div className="mt-10 grid items-center gap-8 md:grid-cols-[1.2fr_.8fr]">
          <img src={`${IMG}/personajes-4.webp`} alt="Los 4 personajes de Papelitos" loading="lazy" width={1200} height={600} className="w-full" />
          <div>
            <h3 className="font-display text-2xl font-semibold">4 personajes para elegir</h3>
            <p className="mt-2 leading-relaxed text-muted-foreground">
              Distintos tonos de piel, peinados y estilos, para que tu hijo elija el que más se le parece. Ilustraciones originales de Papelitos, revisadas una por una.
            </p>
          </div>
        </div>

        <div className="mt-14">
          <h3 className="font-display text-2xl font-semibold">7 looks por personaje</h3>
          <p className="mt-2 max-w-2xl leading-relaxed text-muted-foreground">
            Normal, superhéroe, pirata, astronauta, mago o bruja, guerrero y realeza. Una aventura distinta para cada tarde.
          </p>
          <img src={`${IMG}/looks-7.webp`} alt="Los 7 looks de un personaje de Papelitos" loading="lazy" width={1600} height={455} className="mt-6 w-full" />
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          <article className="rounded-3xl bg-surface p-6 shadow-soft md:col-span-2">
            <img src={`${IMG}/color-colorear.webp`} alt="Un look a color y su versión para colorear" loading="lazy" width={1000} height={774} className="mx-auto w-full max-w-md" />
            <h3 className="mt-4 font-display text-xl font-semibold">A color y para colorear</h3>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              Cada look viene listo para recortar y también en líneas, para que lo pinte a su manera.
            </p>
          </article>
          <article className="rounded-3xl bg-surface p-6 shadow-soft">
            <img src={`${IMG}/certificado.webp`} alt="Certificado de héroe con el nombre del niño" loading="lazy" width={600} height={819} className="mx-auto w-full max-w-[220px]" />
            <h3 className="mt-4 font-display text-xl font-semibold">Su certificado de héroe</h3>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">Con su nombre, para colgar en la pared.</p>
          </article>
        </div>

        <div className="mt-6 grid items-center gap-8 rounded-3xl bg-surface p-6 shadow-soft md:grid-cols-[.7fr_1.3fr] md:p-10">
          <img src={`${IMG}/historia.webp`} alt="Página de historia con el nombre del niño como protagonista" loading="lazy" width={600} height={822} className="mx-auto w-full max-w-[260px]" />
          <div>
            <h3 className="font-display text-2xl font-semibold">12 historias donde tu hijo es el protagonista</h3>
            <p className="mt-2 leading-relaxed text-muted-foreground">
              Su nombre aparece en cada aventura: salva el parque, encuentra un tesoro pirata, pisa una luna de papel. Historias cortas para leer juntos y después jugarlas con su personaje.
            </p>
            <p className="mt-5 font-semibold">28 páginas personalizadas por menos de US$0,50 cada una.</p>
          </div>
        </div>
      </section>

      {/* CÓMO FUNCIONA */}
      <section className="bg-surface py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-5">
          <h2 className="font-display text-3xl font-semibold sm:text-4xl">Así de simple.</h2>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {[
              { icon: Sparkles, title: "Escribe su nombre", copy: "Elige su personaje desde el celular o la computadora.", img: pasoCelular.url, alt: "Familia eligiendo el personaje en el celular" },
              { icon: Printer, title: "Imprime en casa", copy: "Descarga su PDF y usa tu impresora de siempre.", img: pasoRecortar.url, alt: "Manos recortando un personaje impreso" },
              { icon: Scissors, title: "Recorta y a jugar", copy: "Su héroe sale del papel y la aventura empieza.", img: heroNino.url, alt: "Niño jugando con su héroe de papel" },
            ].map((s) => (
              <article key={s.title} className="overflow-hidden rounded-3xl bg-paper">
                <img src={s.img} alt={s.alt} loading="lazy" width={816} height={612} className="aspect-[4/3] w-full object-cover" />
                <div className="p-6">
                  <s.icon className="size-5 text-brand" aria-hidden="true" />
                  <h3 className="mt-3 font-display text-xl font-semibold">{s.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{s.copy}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* POR DENTRO */}
      <section className="mx-auto max-w-6xl px-5 py-16 sm:py-20">
        <h2 className="font-display text-3xl font-semibold text-balance sm:text-4xl">Así se ve su kit por dentro.</h2>
        <p className="mt-3 max-w-xl text-muted-foreground">Portada, looks, páginas para colorear, historias y certificado. Todo con su nombre.</p>
        <div className="-mx-5 mt-8 overflow-x-auto px-5 pb-2">
          <img src={`${IMG}/kit-paginas.webp`} alt="Páginas del kit: portada, look, página para colorear, historia y certificado" loading="lazy" width={1600} height={530} className="w-[900px] max-w-none md:w-full" />
        </div>
      </section>

      {/* PLANES */}
      <section id="planes" className="scroll-mt-4 bg-mist py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-5">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-semibold text-balance sm:text-5xl">Elige su kit.</h2>
            <p className="mt-3 text-muted-foreground">Pago único. Sin suscripción. Acceso inmediato.</p>
          </div>
          <div className="mx-auto mt-10 grid max-w-4xl gap-5 md:grid-cols-2 md:items-start">
            {PLANS.map((plan) => (
              <article
                key={plan.key}
                className={`rounded-3xl border bg-surface p-7 ${plan.featured ? "border-brand shadow-lift" : "border-border shadow-soft"}`}
              >
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-display text-2xl font-semibold">{plan.name}</h3>
                  {plan.featured && <span className="rounded-full bg-brand/10 px-3 py-1 text-xs font-bold text-brand">Más contenido</span>}
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{plan.description}</p>
                <p className="mt-5 font-display text-5xl font-semibold">{plan.price}</p>
                <p className="mt-1 text-sm text-muted-foreground">{plan.note}</p>
                <ul className="mt-6 space-y-3 border-t border-border pt-6 text-sm">
                  {plan.features.map((f) => (
                    <li key={f} className="flex gap-3 leading-relaxed">
                      <span className="shrink-0 font-bold text-brand" aria-hidden="true">✓</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-7">
                  <PlanAction plan={plan.key} planName={plan.name} />
                </div>
              </article>
            ))}
          </div>

          <div className="mx-auto mt-8 flex max-w-4xl flex-col items-center gap-4 rounded-3xl border border-brand/20 bg-surface p-7 text-center sm:flex-row sm:text-left">
            <span className="grid size-12 shrink-0 place-items-center rounded-full bg-brand/10">
              <ShieldCheck className="size-6 text-brand" aria-hidden="true" />
            </span>
            <div>
              <p className="font-display text-lg font-semibold">Garantía de 7 días, sin preguntas.</p>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                Imprímelo, juega y decide. Si no te convence, te devolvemos el 100% de tu dinero.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ENTREGA */}
      <section className="mx-auto max-w-6xl px-5 py-16 sm:py-20">
        <h2 className="font-display text-3xl font-semibold sm:text-4xl">Cómo lo recibes.</h2>
        <ul className="mt-8 grid gap-6 sm:grid-cols-3">
          {[
            { icon: Mail, title: "Al instante, por e-mail", copy: "Apenas se confirma el pago te llega el enlace de acceso, al mismo e-mail de la compra." },
            { icon: Download, title: "Descarga cuando quieras", copy: "Entra desde cualquier dispositivo y descarga sus kits las veces que necesites." },
            { icon: Printer, title: "100% digital", copy: "No se envía nada físico. Imprimes en casa, sin esperar ni pagar envío." },
          ].map((d) => (
            <li key={d.title} className="border-t border-border pt-5">
              <d.icon className="size-5 text-brand" aria-hidden="true" />
              <p className="mt-3 font-semibold">{d.title}</p>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{d.copy}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-5 pb-16 sm:pb-20">
        <h2 className="text-center font-display text-3xl font-semibold sm:text-4xl">Preguntas frecuentes</h2>
        <div className="mt-8">
          {FAQ.map((item) => (
            <details key={item.q} className="group border-b border-border">
              <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-4 text-left font-semibold">
                {item.q}
                <span className="text-xl text-brand transition-transform duration-200 ease-out group-open:rotate-45" aria-hidden="true">+</span>
              </summary>
              <p className="max-w-2xl pb-5 text-sm leading-relaxed text-muted-foreground">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* CIERRE */}
      <section className="bg-brand py-16 text-primary-foreground sm:py-20">
        <div className="mx-auto max-w-3xl px-5 text-center">
          <h2 className="font-display text-3xl font-semibold text-balance sm:text-5xl">Esta tarde puede ser distinta.</h2>
          <p className="mx-auto mt-4 max-w-xl text-primary-foreground/80">
            Escribe su nombre, imprime su kit y mira cómo se convierte en el héroe de su propia historia.
          </p>
          <a
            href="#planes"
            className="mt-8 inline-flex items-center justify-center rounded-full bg-surface px-8 py-4 font-semibold text-ink shadow-soft transition-transform duration-150 ease-out active:scale-[0.97]"
          >
            Quiero el kit de mi hijo
          </a>
        </div>
      </section>

      <footer className="mx-auto max-w-6xl px-5 py-8 text-center text-xs text-muted-foreground">
        {BRAND} · Producto digital · Soporte:{" "}
        <a href={`mailto:${SUPPORT_EMAIL}`} className="underline hover:text-brand">
          {SUPPORT_EMAIL}
        </a>{" "}
        · © 2026
      </footer>

      {/* CTA fijo en celular */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/95 p-3 backdrop-blur-md sm:hidden">
        <a
          href="#planes"
          className="flex h-12 w-full items-center justify-center rounded-full bg-brand font-semibold text-primary-foreground shadow-cta transition-transform duration-150 ease-out active:scale-[0.97]"
        >
          Quiero el kit de mi hijo · desde US$13,51
        </a>
      </div>
    </main>
  );
}
