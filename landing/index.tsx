import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { z } from "zod";
import { Download, Mail, Printer, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import heroFamilia from "@/assets/marketing/hero-familia.webp.asset.json";
import pasoApp from "@/assets/marketing/paso-app.webp.asset.json";
import pasoRecortar from "@/assets/paso-recortar.jpg.asset.json";
import pasoJuego from "@/assets/marketing/paso-juego.webp.asset.json";
import personajes4 from "@/assets/marketing/personajes-4.webp.asset.json";
import looks7 from "@/assets/marketing/looks-7.webp.asset.json";
import historia from "@/assets/marketing/historia.webp.asset.json";
import certificado from "@/assets/marketing/certificado.webp.asset.json";
import kitPaginas from "@/assets/marketing/kit-paginas-v2.webp.asset.json";
import demoSprite from "@/assets/marketing/demo-sprite.webp.asset.json";

// ---------------------------------------------------------------------------
// Configuración de la oferta: todo lo que cambia la venta está acá arriba.
// Cuando tengas los links de Hotmart/Kiwify, pégalos en CHECKOUT_URLS y los
// botones pasan solos de "Avísame" a "Quiero el plan".
// META_PIXEL_ID: pega el ID numérico de tu píxel de Meta y se activa solo
// (PageView al entrar, Lead al dejar el e-mail, InitiateCheckout al ir a pagar).
// ---------------------------------------------------------------------------
const BRAND = "Papelitos";
const CHECKOUT_URLS: Record<PlanKey, string> = { basic: "", premium: "" };
const SUPPORT_EMAIL = "lucasmurilo1120@gmail.com";
const META_PIXEL_ID = "";
const SITE_URL = ""; // URL pública del sitio, sin barra final (para la imagen al compartir)

const TOTAL_PAGES = 21; // portada + 7 looks + 12 historias + certificado

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
    note: "Pago único · Imprímelo las veces que quieras",
    description: "El kit completo para empezar a jugar hoy.",
    features: [
      "4 personajes para elegir",
      "7 looks por personaje: normal, superhéroe, pirata, astronauta, mago o bruja, guerrero y realeza",
      "12 historias donde tu hijo es el protagonista, con su nombre",
      "Portada y certificado de héroe con su nombre",
      "Un kit para cada hijo, sin pagar de nuevo",
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

// Datos con fuente. No agregar números sin fuente verificable.
const DATOS = [
  {
    n: "1 hora",
    t: "al día como máximo frente a pantallas para niños de 2 a 4 años. Y menos es mejor.",
    f: "Organización Mundial de la Salud, 2019",
  },
  {
    n: "2 de 3",
    t: "niños de 1 a 4 años en América Latina ya usan el celular.",
    f: "Estudio en 19 países de América Latina, PLOS One, 2025",
  },
  {
    n: "1 de 5",
    t: "padres logra cumplir siempre sus reglas de pantalla, aunque el 86% dice que es una prioridad diaria.",
    f: "Pew Research Center, padres de EE. UU., 2025",
  },
];

const FAQ = [
  {
    q: "¿Qué recibo exactamente?",
    a: `Acceso a la app de Papelitos. Escribes el nombre de tu hijo, eliges su personaje y descargas su kit en PDF: ${TOTAL_PAGES} páginas con portada, 7 looks, 12 historias con su nombre y su certificado de héroe.`,
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
    a: "Para niños de 3 a 8 años. Los más pequeños recortan con ayuda de un adulto y los más grandes pueden leer las historias por su cuenta.",
  },
  {
    q: "Tengo más de un hijo. ¿Tengo que comprar dos veces?",
    a: "No. Puedes crear un kit con el nombre de cada hijo, las veces que quieras.",
  },
  {
    q: "¿Puedo imprimirlo más de una vez?",
    a: "Sí. Descarga el PDF cuando quieras e imprime de nuevo los personajes cuando se gasten de tanto jugar.",
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

const META_DESCRIPTION = `Escribe su nombre e imprime su kit de héroe: su personaje en 7 looks, 12 historias donde es el protagonista y su certificado. Para niños de 3 a 8 años.`;

export const Route = createFileRoute("/")({
  head: () => {
    const ogImage = SITE_URL ? [{ property: "og:image", content: `${SITE_URL}${heroFamilia.url}` }, { name: "twitter:image", content: `${SITE_URL}${heroFamilia.url}` }] : [];
    return {
      meta: [
        { title: `${BRAND}: una tarde sin pantallas donde tu hijo es el héroe` },
        { name: "description", content: META_DESCRIPTION },
        { property: "og:title", content: `${BRAND}: tu hijo, el héroe de su propia historia` },
        { property: "og:description", content: "Un kit de héroe con su nombre para imprimir en casa y jugar en familia, lejos de la pantalla." },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
        ...ogImage,
      ],
    };
  },
  component: LandingPage,
});

// ---------------------------------------------------------------------------
// Medición (Meta Pixel). No hace nada mientras META_PIXEL_ID esté vacío.
// ---------------------------------------------------------------------------

type Fbq = (...args: unknown[]) => void;

function track(event: string, params?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  const fbq = (window as unknown as { fbq?: Fbq }).fbq;
  if (fbq) fbq("track", event, params);
}

function useMetaPixel() {
  useEffect(() => {
    if (!/^\d+$/.test(META_PIXEL_ID)) return;
    if ((window as unknown as { fbq?: Fbq }).fbq) return;
    const s = document.createElement("script");
    s.text = `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${META_PIXEL_ID}');fbq('track','PageView');`;
    document.head.appendChild(s);
  }, []);
}

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

const CTA_LABEL = "Quiero el kit de mi hijo";

function PrimaryCta({ label = CTA_LABEL, className = "", id }: { label?: string; className?: string; id?: string }) {
  return (
    <a
      id={id}
      href="#planes"
      className={`inline-flex min-h-14 items-center justify-center rounded-full bg-brand px-7 py-4 text-base font-bold text-primary-foreground shadow-cta transition-[transform,background-color] duration-150 ease-out hover:bg-brand-deep active:scale-[0.97] ${className}`}
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
      track("Lead", { content_name: `Plan ${planName}` });
      setStatus("success");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No pudimos guardar tu e-mail. Inténtalo de nuevo.");
      setStatus("idle");
    }
  }

  if (status === "success") {
    return (
      <p role="status" className="rounded-2xl bg-mist p-4 text-base font-semibold">
        ¡Listo! Te escribimos apenas abran las compras del plan {planName}.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-3">
      <p className="text-[15px] leading-relaxed text-muted-foreground">
        Las compras abren muy pronto. Déjanos tu e-mail y te avisamos primero.
      </p>
      <label htmlFor={`email-${plan}`} className="block text-sm font-bold">
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
        className="flex h-13 min-h-12 w-full items-center justify-center rounded-full bg-brand px-6 text-base font-bold text-primary-foreground shadow-cta transition-[transform,background-color] duration-150 ease-out hover:bg-brand-deep active:scale-[0.97] disabled:opacity-70"
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

function PlanAction({ plan, planName, price }: { plan: PlanKey; planName: string; price: string }) {
  const url = CHECKOUT_URLS[plan];
  if (!url) return <LeadForm plan={plan} planName={planName} />;
  return (
    <a
      href={withUtms(url)}
      onClick={() => track("InitiateCheckout", { content_name: `Plan ${planName}`, value: Number(price.replace(/[^\d,]/g, "").replace(",", ".")), currency: "USD" })}
      className="flex min-h-14 w-full items-center justify-center rounded-full bg-brand px-6 text-base font-bold text-primary-foreground shadow-cta transition-[transform,background-color] duration-150 ease-out hover:bg-brand-deep active:scale-[0.97]"
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
        src={demoSprite.url}
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
  const themeLabel = (THEMES[theme] ?? THEMES[1]).label;

  return (
    <section id="pruebalo" className="scroll-mt-4 bg-mist py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-5">
        <h2 className="max-w-2xl font-display text-3xl font-semibold text-balance sm:text-4xl">
          Pruébalo ahora: escribe su nombre y elige su héroe.
        </h2>
        <p className="mt-3 max-w-xl text-base text-muted-foreground">Así empieza su kit. Gratis y sin registrarte.</p>

        <div className="mt-10 grid items-start gap-8 md:grid-cols-[minmax(0,360px)_1fr]">
          <div className="mx-auto w-full max-w-[360px] rounded-3xl bg-surface p-6 text-center shadow-lift md:mx-0">
            <p className="text-xs font-bold text-brand">{BRAND}</p>
            <p className="mt-1 font-display text-2xl leading-tight font-semibold">El kit de héroe de {shown}</p>
            <div className="mt-4 flex justify-center">
              <SpriteCell row={character} col={theme} scale={1.1} alt={`${(CHARACTERS[character] ?? CHARACTERS[0]).label}, look ${themeLabel}`} />
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              Look {themeLabel} · 1 de las {TOTAL_PAGES} páginas de su kit
            </p>
          </div>

          <div className="space-y-7">
            <div>
              <label htmlFor="demo-name" className="mb-2 block text-base font-bold">
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
                autoCapitalize="words"
                className="h-12 w-full max-w-sm rounded-xl border border-border bg-surface px-4 text-base outline-none transition-colors focus:border-brand"
              />
            </div>

            <div>
              <p className="mb-3 text-base font-bold">Elige su personaje</p>
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
              <p className="mb-3 text-base font-bold">Elige su look</p>
              <div className="flex flex-wrap gap-2">
                {THEMES.map((t, i) => (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => setTheme(i)}
                    aria-pressed={theme === i}
                    className={`min-h-11 rounded-full border px-4 text-[15px] font-semibold transition-[transform,background-color] duration-150 ease-out active:scale-[0.97] ${
                      theme === i ? "border-brand bg-brand text-primary-foreground" : "border-border bg-surface hover:bg-paper"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-surface p-5">
              <p className="text-base font-bold">{name ? `El kit de ${name} trae:` : "Su kit completo trae:"}</p>
              <p className="mt-1 text-[15px] leading-relaxed text-muted-foreground">
                Su portada, los 7 looks de su personaje, 12 historias donde {shown} es el protagonista y su certificado de héroe.
              </p>
              <PrimaryCta label={name ? `Quiero el kit de ${name}` : CTA_LABEL} className="mt-5 w-full sm:w-auto" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Botón fijo del celular: aparece cuando el botón del inicio sale de pantalla
// y se esconde en la sección de planes (ahí ya están los botones de compra).
function useStickyCta() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const hero = document.getElementById("hero-cta");
    const planes = document.getElementById("planes");
    if (!hero || !("IntersectionObserver" in window)) {
      setShow(true);
      return;
    }
    const visible = new Map<Element, boolean>();
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) visible.set(e.target, e.isIntersecting);
      setShow(!visible.get(hero) && !(planes && visible.get(planes)));
    });
    io.observe(hero);
    if (planes) io.observe(planes);
    return () => io.disconnect();
  }, []);
  return show;
}

function LandingPage() {
  useMetaPixel();
  const showSticky = useStickyCta();

  return (
    <main className="min-h-screen overflow-x-hidden bg-paper pb-24 font-body text-ink sm:pb-0">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-2 sm:py-4">
        <a href="#inicio" className="flex min-h-11 items-center gap-2" aria-label={`${BRAND}, inicio`}>
          <span className="grid size-9 place-items-center rounded-lg bg-brand font-display text-lg font-semibold text-primary-foreground">P</span>
          <span className="font-display text-lg font-semibold">{BRAND}</span>
        </a>
        <a href="#planes" className="inline-flex min-h-11 items-center text-sm font-bold text-brand hover:text-brand-deep">
          Ver precios
        </a>
      </header>

      {/* HERO: en el celular la imagen va primero, visible al abrir */}
      <section id="inicio" className="mx-auto grid max-w-6xl items-center gap-5 px-5 pb-12 md:grid-cols-[1fr_1.05fr] md:gap-10 md:pt-6 md:pb-20">
        <img
          src={heroFamilia.url}
          alt="Mamá, papá y su hijo recortando juntos los personajes de papel del kit, con la portada El kit de héroe de Mateo"
          width={1200}
          height={1080}
          fetchPriority="high"
          decoding="async"
          className="mx-auto w-full max-w-[340px] sm:max-w-[460px] md:order-2 md:max-w-[580px]"
        />
        <div className="md:order-1">
          <p className="text-sm font-bold text-brand">Para niños de 3 a 8 años</p>
          <h1 className="mt-2 font-display text-[2.05rem] leading-[1.06] font-semibold text-balance sm:text-5xl lg:text-6xl">
            Una tarde sin pantallas donde tu hijo es el héroe.
          </h1>
          <p className="mt-3 max-w-xl text-[17px] leading-[1.55] text-muted-foreground sm:mt-5 sm:text-lg sm:leading-relaxed">
            Escribe su nombre, imprime su kit y recórtenlo juntos. Su héroe en 7 looks, 12 historias con su nombre y su certificado.
          </p>
          <div className="mt-5 flex flex-col gap-2 sm:mt-7 sm:flex-row sm:items-center sm:gap-3">
            <PrimaryCta id="hero-cta" className="w-full sm:w-auto" />
            <a href="#pruebalo" className="inline-flex min-h-11 items-center justify-center px-2 text-[15px] font-bold text-brand hover:text-brand-deep">
              Pruébalo gratis con su nombre
            </a>
          </div>
          <p className="mt-2 text-sm text-muted-foreground sm:mt-4">Pago único · Acceso inmediato · Garantía de 7 días</p>
        </div>
      </section>

      {/* LO QUE TRAE, DE UN VISTAZO */}
      <section aria-label="Lo que trae el kit" className="mx-auto max-w-6xl px-5 pb-14 sm:pb-20">
        <ul className="grid grid-cols-4 divide-x divide-border rounded-3xl bg-surface py-5 text-center shadow-soft sm:py-7">
          {[
            { n: "4", t: "personajes" },
            { n: "7", t: "looks" },
            { n: "12", t: "historias" },
            { n: "1", t: "certificado" },
          ].map((s) => (
            <li key={s.t} className="px-1">
              <p className="font-display text-3xl font-semibold text-brand-deep sm:text-5xl">{s.n}</p>
              <p className="mt-1 text-[13px] font-semibold text-muted-foreground sm:text-base">{s.t}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* DOLOR + DATOS */}
      <section className="bg-ink py-16 text-paper sm:py-20">
        <div className="mx-auto max-w-6xl px-5">
          <div className="grid gap-8 md:grid-cols-[.9fr_1.1fr] md:items-center md:gap-10">
            <h2 className="font-display text-3xl font-semibold text-balance sm:text-4xl">
              Estás cansado. Tu hijo está aburrido. Y la pantalla siempre está lista.
            </h2>
            <div className="space-y-4 text-base leading-relaxed text-paper/80 sm:text-lg">
              <p>
                Después de un día largo, inventar un juego, buscar materiales y lograr que le interese se siente como otra tarea más. Entonces aparecen esos “15 minutos más” que se estiran, y después llega la culpa.
              </p>
              <p className="font-semibold text-paper">
                No es falta de ganas. Te faltaba un plan que ya estuviera listo y que a tu hijo le importe de verdad: uno donde el héroe tiene su nombre.
              </p>
            </div>
          </div>
          <ul className="mt-12 grid gap-6 border-t border-paper/15 pt-10 md:grid-cols-3 md:gap-10">
            {DATOS.map((d) => (
              <li key={d.n}>
                <p className="font-display text-4xl font-semibold text-amber sm:text-5xl">{d.n}</p>
                <p className="mt-2 text-base leading-relaxed text-paper/90">{d.t}</p>
                <p className="mt-2 text-xs text-paper/60">{d.f}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <Demo />

      {/* QUÉ TRAE */}
      <section className="mx-auto max-w-6xl px-5 py-16 sm:py-20">
        <h2 className="max-w-2xl font-display text-3xl font-semibold text-balance sm:text-4xl">
          Todo lo que trae su kit, listo para imprimir.
        </h2>

        <div className="mt-10 grid items-center gap-8 md:grid-cols-[1.2fr_.8fr]">
          <img src={personajes4.url} alt="Los 4 personajes de Papelitos" loading="lazy" decoding="async" width={1200} height={600} className="w-full" />
          <div>
            <h3 className="font-display text-2xl font-semibold">4 personajes para elegir</h3>
            <p className="mt-2 text-base leading-relaxed text-muted-foreground">
              Distintos tonos de piel, peinados y estilos, para que tu hijo elija el que más se le parece. Ilustraciones originales de Papelitos, revisadas una por una.
            </p>
          </div>
        </div>

        <div className="mt-14">
          <h3 className="font-display text-2xl font-semibold">7 looks por personaje</h3>
          <p className="mt-2 max-w-2xl text-base leading-relaxed text-muted-foreground">
            Normal, superhéroe, pirata, astronauta, mago o bruja, guerrero y realeza. Una aventura distinta para cada tarde, y cada look listo para recortar.
          </p>
          <img src={looks7.url} alt="Los 7 looks de un personaje de Papelitos" loading="lazy" decoding="async" width={1600} height={455} className="mt-6 w-full" />
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          <article className="grid items-center gap-6 rounded-3xl bg-surface p-6 shadow-soft sm:grid-cols-[.8fr_1.2fr] md:col-span-2 md:p-8">
            <img src={historia.url} alt="Página de historia con el nombre del niño como protagonista" loading="lazy" decoding="async" width={600} height={822} className="mx-auto w-full max-w-[240px]" />
            <div>
              <h3 className="font-display text-2xl font-semibold">12 historias donde tu hijo es el protagonista</h3>
              <p className="mt-2 text-base leading-relaxed text-muted-foreground">
                Su nombre aparece en cada aventura: salva el parque, encuentra un tesoro pirata, camina sobre la luna. Cuentos cortos para leer juntos y después jugarlos con su personaje.
              </p>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                Leer juntos fortalece el vínculo y el lenguaje, según la Academia Americana de Pediatría.
              </p>
            </div>
          </article>
          <article className="rounded-3xl bg-surface p-6 shadow-soft">
            <img src={certificado.url} alt="Certificado de héroe con el nombre del niño" loading="lazy" decoding="async" width={600} height={819} className="mx-auto w-full max-w-[220px]" />
            <h3 className="mt-4 font-display text-xl font-semibold">Su certificado de héroe</h3>
            <p className="mt-1 text-base leading-relaxed text-muted-foreground">Con su nombre, para colgar en la puerta de su cuarto.</p>
          </article>
        </div>
      </section>

      {/* CÓMO FUNCIONA */}
      <section className="bg-surface py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-5">
          <h2 className="font-display text-3xl font-semibold sm:text-4xl">Listo en 3 pasos.</h2>
          <p className="mt-3 max-w-xl text-base text-muted-foreground">Sin materiales raros: una impresora común, tijeras y ganas de jugar.</p>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {[
              { title: "Escribe su nombre", copy: "Elige su personaje desde el celular. Toma menos de un minuto.", img: pasoApp.url, w: 960, h: 720, alt: "La app de Papelitos en un celular con el nombre Mateo escrito y su personaje elegido" },
              { title: "Imprime y recorta", copy: "Descarga su PDF y usa tu impresora de siempre. En cartulina, los personajes duran más.", img: pasoRecortar.url, w: 816, h: 816, alt: "Manos recortando un personaje impreso" },
              { title: "Jueguen juntos", copy: "Lean su historia, armen la escena y dejen que la aventura siga.", img: pasoJuego.url, w: 960, h: 720, alt: "Familia sentada en el piso jugando con los personajes de papel" },
            ].map((s) => (
              <article key={s.title} className="overflow-hidden rounded-3xl bg-paper">
                <img src={s.img} alt={s.alt} loading="lazy" decoding="async" width={s.w} height={s.h} className="aspect-[4/3] w-full object-cover" />
                <div className="p-6">
                  <h3 className="font-display text-xl font-semibold">{s.title}</h3>
                  <p className="mt-1 text-base leading-relaxed text-muted-foreground">{s.copy}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* POR DENTRO */}
      <section className="mx-auto max-w-6xl px-5 py-16 sm:py-20">
        <h2 className="font-display text-3xl font-semibold text-balance sm:text-4xl">Así se ve su kit por dentro.</h2>
        <p className="mt-3 max-w-xl text-base text-muted-foreground">
          {TOTAL_PAGES} páginas: portada, looks, historias y certificado. Todo con su nombre.
        </p>
        <div className="-mx-5 mt-8 snap-x overflow-x-auto px-5 pb-2">
          <img
            src={kitPaginas.url}
            alt="Páginas del kit: portada, dos looks, una historia y el certificado, con el nombre Valentina"
            loading="lazy"
            decoding="async"
            width={1600}
            height={538}
            className="w-[880px] max-w-none md:w-full"
          />
        </div>
        <p className="mt-2 text-sm text-muted-foreground md:hidden">Desliza para ver todas las páginas →</p>
      </section>

      {/* PLANES */}
      <section id="planes" className="scroll-mt-4 bg-mist py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-5">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-semibold text-balance sm:text-5xl">Elige su kit.</h2>
            <p className="mt-3 text-base text-muted-foreground">Pago único. Sin suscripción. Acceso inmediato.</p>
            <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-muted-foreground">
              Un libro personalizado impreso suele costar entre US$30 y US$40, y llega una sola vez. Su kit trae 12 historias con su nombre, 7 looks y su certificado, y lo imprimes cuando quieras.
            </p>
          </div>
          <div className="mx-auto mt-10 grid max-w-4xl gap-5 md:grid-cols-2 md:items-start">
            {PLANS.map((plan) => (
              <article
                key={plan.key}
                className={`rounded-3xl border bg-surface p-6 sm:p-7 ${plan.featured ? "border-brand shadow-lift" : "border-border shadow-soft"}`}
              >
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-display text-2xl font-semibold">{plan.name}</h3>
                  {plan.featured && <span className="rounded-full bg-brand/10 px-3 py-1 text-xs font-bold text-brand-deep">Más contenido</span>}
                </div>
                <p className="mt-2 text-[15px] text-muted-foreground">{plan.description}</p>
                <p className="mt-5 font-display text-5xl font-semibold">{plan.price}</p>
                <p className="mt-1 text-sm text-muted-foreground">{plan.note}</p>
                <ul className="mt-6 space-y-3 border-t border-border pt-6 text-[15px]">
                  {plan.features.map((f) => (
                    <li key={f} className="flex gap-3 leading-relaxed">
                      <span className="shrink-0 font-bold text-brand" aria-hidden="true">✓</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-7">
                  <PlanAction plan={plan.key} planName={plan.name} price={plan.price} />
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
              <p className="mt-1 text-[15px] leading-relaxed text-muted-foreground">
                Imprímelo, juega con tu hijo y decide. Si no te convence, te devolvemos el 100% de tu dinero.
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
              <p className="mt-3 text-base font-bold">{d.title}</p>
              <p className="mt-1 text-base leading-relaxed text-muted-foreground">{d.copy}</p>
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
              <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-4 text-left text-base font-bold">
                {item.q}
                <span className="text-xl text-brand transition-transform duration-200 ease-out group-open:rotate-45" aria-hidden="true">+</span>
              </summary>
              <p className="max-w-2xl pb-5 text-base leading-relaxed text-muted-foreground">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* CIERRE */}
      <section className="bg-brand py-16 text-primary-foreground sm:py-20">
        <div className="mx-auto max-w-3xl px-5 text-center">
          <h2 className="font-display text-3xl font-semibold text-balance sm:text-5xl">Esta tarde puede ser distinta.</h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-primary-foreground/90 sm:text-lg">
            Escribe su nombre, imprime su kit y mira su cara cuando descubra que el héroe de la historia tiene su nombre.
          </p>
          <a
            href="#planes"
            className="mt-8 inline-flex min-h-14 items-center justify-center rounded-full bg-surface px-8 py-4 text-base font-bold text-ink shadow-soft transition-transform duration-150 ease-out active:scale-[0.97]"
          >
            {CTA_LABEL}
          </a>
        </div>
      </section>

      <footer className="mx-auto max-w-6xl px-5 py-8 text-center text-sm text-muted-foreground">
        {BRAND} · Producto digital · Soporte:{" "}
        <a href={`mailto:${SUPPORT_EMAIL}`} className="inline-block py-3 underline hover:text-brand">
          {SUPPORT_EMAIL}
        </a>{" "}
        · © 2026
      </footer>

      {/* CTA fijo en celular: solo cuando el botón del inicio ya no se ve */}
      <div
        inert={!showSticky}
        aria-hidden={!showSticky}
        className={`fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/95 p-3 backdrop-blur-md transition-transform duration-200 ease-out motion-reduce:transition-none sm:hidden ${
          showSticky ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <a
          href="#planes"
          className="flex h-13 min-h-12 w-full items-center justify-center rounded-full bg-brand text-base font-bold text-primary-foreground shadow-cta transition-transform duration-150 ease-out active:scale-[0.97]"
        >
          {CTA_LABEL} · desde US$13,51
        </a>
      </div>
    </main>
  );
}
