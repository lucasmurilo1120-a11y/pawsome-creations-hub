import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Camera, Download, Printer, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  buildStories,
  CHARACTERS,
  imagen,
  isGirl,
  LOOKS,
  mini,
  STORY_COUNT,
  TOTAL_PAGES,
  type Character,
  type Look,
  type LookKey,
} from "@/lib/kit";
import { CodigoBoton } from "@/components/papelitos/CodigoBoton";
import { PersonajesCarita } from "@/components/papelitos/PersonajesCarita";
import { useCarita } from "@/lib/carita.client";
import type { PersonajeCarita } from "@/lib/carita.functions";

// Nombre de la marca en un solo lugar: cambiarlo acá lo cambia en toda la app.
const BRAND = "Papelitos";
const TAGLINE = "Tu hijo, el héroe de papel";

// "  mateo   josé " -> "Mateo José": así el nombre siempre se ve bien impreso.
function formatName(raw: string): string {
  return raw
    .trim()
    .replace(/\s+/g, " ")
    .split(" ")
    .map((word) => (word ? word.charAt(0).toLocaleUpperCase("es") + word.slice(1) : word))
    .join(" ");
}

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: `${BRAND}: ${TAGLINE.charAt(0).toLowerCase()}${TAGLINE.slice(1)}` },
      {
        name: "description",
        content:
          "Elige el personaje y el tema, escribe el nombre de tu hijo y descarga su kit de héroe de papel con historias y certificado, listo para imprimir.",
      },
      { property: "og:title", content: `${BRAND}: ${TAGLINE.charAt(0).toLowerCase()}${TAGLINE.slice(1)}` },
      {
        property: "og:description",
        content: "Su nombre en cada historia y en su certificado de héroe. Imprímelo en casa y a jugar.",
      },
    ],
  }),
  component: CreatorApp,
});

// ---------------------------------------------------------------------------
// Héroes: los 4 personajes ilustrados (7 looks propios y 12 historias cada uno,
// ver src/lib/kit.ts) + "Con su carita" (creado con la foto). Un personaje con
// carita usa los looks y las historias del estilo elegido: Niño o Niña.
// ---------------------------------------------------------------------------

type HeroKey = Character | `carita-${number}`;
type Hero = {
  key: HeroKey;
  label: string;
  estilo: Character;
  looks: Look[];
  images: Partial<Record<LookKey, string>>;
  thumbs: Partial<Record<LookKey, string>>;
};

const STANDARD_HEROES: Hero[] = CHARACTERS.map((c) => {
  const looks = LOOKS[c.key];
  return {
    key: c.key,
    label: c.label,
    estilo: c.key,
    looks,
    images: Object.fromEntries(looks.map((l) => [l.key, imagen(c.key, l.key)])),
    thumbs: Object.fromEntries(looks.map((l) => [l.key, mini(imagen(c.key, l.key))])),
  };
});

// Cada personaje con su carita aparece solo cuando sus 7 looks están listos.
function heroesCarita(lista: PersonajeCarita[]): Hero[] {
  return lista.flatMap((p) => {
    const estilo: Character = p.genero === "nina" ? "nina" : "nino";
    const looks = LOOKS[estilo];
    if (!looks.every((l) => p.imagenes[l.key])) return [];
    const images = Object.fromEntries(looks.map((l) => [l.key, p.imagenes[l.key]!]));
    return [
      {
        key: `carita-${p.slot}` as const,
        label: p.nombre || (lista.length > 1 ? `Carita ${p.slot + 1}` : "Su carita"),
        estilo,
        looks,
        images,
        thumbs: images,
      },
    ];
  });
}

const img = (hero: Hero, k: LookKey) => hero.images[k] ?? hero.images.ninguno ?? "";
const thumb = (hero: Hero, k: LookKey) => hero.thumbs[k] ?? hero.thumbs.ninguno ?? "";
const girlDe = (hero: Hero) => isGirl(hero.estilo);

// ---------------------------------------------------------------------------
// Kit imprimible — se arma en el momento con el nombre elegido. Solo se ve al
// imprimir ("Guardar como PDF" en el diálogo de impresión).
// ---------------------------------------------------------------------------

const PAGE_BREAK = { breakAfter: "page", pageBreakAfter: "always" } as const;

function PrintKit({ name, hero }: { name: string; hero: Hero }) {
  const stories = buildStories(name, hero.estilo);

  return (
    <div className="print-kit hidden print:block" aria-hidden>
      {/* Portada */}
      <section style={PAGE_BREAK} className="flex min-h-[250mm] flex-col items-center justify-center gap-6 text-center">
        <p className="text-lg font-semibold tracking-wide text-brand">{BRAND}</p>
        <h1 className="font-display text-5xl font-semibold text-foreground">El kit de héroe de {name}</h1>
        <img src={img(hero, "superheroe")} alt="" className="max-h-[160mm] object-contain" />
        <p className="text-base text-muted-foreground">
          Recorta, juega y vive las aventuras de {name}.
        </p>
        <p className="text-sm font-semibold text-brand-deep">
          7 looks · {STORY_COUNT} historias · Certificado de héroe
        </p>
      </section>

      {/* Looks */}
      {hero.looks.map((t) => (
        <section
          key={t.key}
          style={PAGE_BREAK}
          className="flex min-h-[250mm] flex-col items-center justify-center gap-5 text-center"
        >
          <p className="text-sm font-semibold tracking-wide text-brand">
            {t.key === "ninguno" ? "LOOK NORMAL" : t.label.toUpperCase()}
          </p>
          <h2 className="font-display text-3xl font-semibold text-foreground">{name}</h2>
          <img src={img(hero, t.key)} alt="" className="max-h-[200mm] object-contain" />
          <p className="text-sm text-muted-foreground">Recorta siguiendo el borde del dibujo.</p>
        </section>
      ))}

      {/* Historias */}
      {stories.map((s, i) => (
        <section key={`${s.look}-${i}`} style={PAGE_BREAK} className="flex min-h-[250mm] flex-col gap-5">
          <p className="text-sm font-semibold tracking-wide text-brand">
            HISTORIA {i + 1} DE {stories.length} · {s.label.toUpperCase()}
          </p>
          <h2 className="font-display text-4xl font-semibold text-foreground">{s.title}</h2>
          <div className="flex items-start gap-8">
            <div className="flex-1 space-y-4 text-lg leading-relaxed text-foreground">
              {s.paragraphs.map((p, j) => (
                <p key={j}>{p}</p>
              ))}
            </div>
            <img src={img(hero, s.look)} alt="" className="max-h-[140mm] w-[55mm] shrink-0 object-contain" />
          </div>
          <p className="mt-auto text-center text-sm text-muted-foreground">
            {BRAND} · Recorta, arma y sigue la aventura
          </p>
        </section>
      ))}

      {/* Certificado */}
      <section className="flex min-h-[250mm] flex-col items-center justify-center gap-6 text-center">
        <div className="flex w-full flex-col items-center gap-5 rounded-3xl border-4 border-dashed border-brand p-10">
          <p className="text-lg font-semibold tracking-wide text-brand">{BRAND}</p>
          <h2 className="font-display text-5xl font-semibold text-foreground">Certificado de Héroe</h2>
          <p className="text-lg text-muted-foreground">Se otorga con orgullo a</p>
          <p className="font-display text-6xl font-semibold text-brand-deep">{name}</p>
          <img src={img(hero, "superheroe")} alt="" className="max-h-[110mm] object-contain" />
          <p className="max-w-md text-lg text-foreground">
            por su valentía, su imaginación y por jugar siempre a lo grande.
          </p>
          <p className="mt-4 text-sm text-muted-foreground">Fecha: ____ / ____ / ________</p>
        </div>
      </section>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Página
// ---------------------------------------------------------------------------

function ThemePicker({
  hero,
  value,
  onChange,
}: {
  hero: Hero;
  value: LookKey;
  onChange: (key: LookKey) => void;
}) {
  return (
    <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
      {hero.looks.map((t) => {
        const active = value === t.key;
        return (
          <button
            key={t.key}
            type="button"
            onClick={() => onChange(t.key)}
            aria-pressed={active}
            className={`flex flex-col items-center gap-1 rounded-2xl border-2 bg-surface p-1.5 pb-2 text-xs font-medium transition-[transform,border-color] duration-150 ease-out active:scale-[0.97] ${
              active ? "border-brand text-brand-deep" : "border-transparent text-foreground hover:border-border"
            }`}
          >
            <img
              src={thumb(hero, t.key)}
              alt=""
              width={72}
              height={120}
              loading="lazy"
              className="h-[84px] w-full object-contain"
            />
            <span className="leading-tight">{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function StepTitle({ n, children }: { n: number; children: ReactNode }) {
  return (
    <span className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
      <span className="grid size-6 shrink-0 place-items-center rounded-full bg-brand text-xs font-bold text-primary-foreground">
        {n}
      </span>
      {children}
    </span>
  );
}

// Vista previa en pantalla de algunas páginas del kit, con el nombre en vivo.
function KitPreview({ name, hero }: { name: string; hero: Hero }) {
  const vitrina = hero.looks[4] ?? hero.looks[0]!; // un look propio del personaje
  // Sin nombre todavía: mostramos un nombre de ejemplo para que se entienda el resultado.
  const who = name || (girlDe(hero) ? "Sofía" : "Mateo");
  const firstStory = buildStories(who, hero.estilo)[0]!;
  return (
    <div className="-mx-5 overflow-x-auto px-5 pb-2">
      <div className="flex w-max gap-4">
        <div className="flex w-40 flex-col items-center gap-2 rounded-xl bg-surface p-3 text-center shadow-soft">
          <p className="text-[10px] font-semibold text-brand">{BRAND}</p>
          <p className="font-display text-sm leading-tight font-semibold">El kit de héroe de {who}</p>
          <img src={thumb(hero, "superheroe")} alt="" className="h-28 object-contain" />
          <p className="text-[10px] text-muted-foreground">Portada</p>
        </div>
        <div className="flex w-40 flex-col items-center gap-2 rounded-xl bg-surface p-3 text-center shadow-soft">
          <p className="text-[10px] font-semibold text-brand">LOOK {vitrina.label.toUpperCase()}</p>
          <p className="font-display text-sm leading-tight font-semibold">{who}</p>
          <img src={thumb(hero, vitrina.key)} alt="" loading="lazy" className="h-28 object-contain" />
          <p className="text-[10px] text-muted-foreground">7 looks para recortar</p>
        </div>
        <div className="flex w-56 flex-col gap-2 rounded-xl bg-surface p-3 shadow-soft">
          <p className="text-[10px] font-semibold text-brand">HISTORIA 1 DE {STORY_COUNT}</p>
          <p className="font-display text-sm leading-tight font-semibold">{firstStory.title}</p>
          <p className="line-clamp-5 text-[11px] leading-snug text-muted-foreground">{firstStory.paragraphs[0]}</p>
          <p className="mt-auto text-[10px] text-muted-foreground">{STORY_COUNT} historias con su nombre</p>
        </div>
        <div className="flex w-40 flex-col items-center gap-1.5 rounded-xl border-2 border-dashed border-brand bg-surface p-3 text-center shadow-soft">
          <p className="font-display text-sm leading-tight font-semibold">Certificado de Héroe</p>
          <p className="text-[10px] text-muted-foreground">Se otorga con orgullo a</p>
          <p className="font-display text-base font-semibold text-brand-deep">{who}</p>
          <img src={thumb(hero, "superheroe")} alt="" className="h-16 object-contain" />
        </div>
      </div>
    </div>
  );
}

function CreatorApp() {
  const [heroKey, setHeroKey] = useState<HeroKey>("nino");
  const [lookElegido, setTheme] = useState<LookKey>("ninguno");
  const [rawName, setRawName] = useState("");
  const carita = useCarita();
  const caritas: PersonajeCarita[] = carita.personajes;

  const caritaHeroes = heroesCarita(caritas);
  const heroes = [...caritaHeroes, ...STANDARD_HEROES];
  const hero = heroes.find((h) => h.key === heroKey) ?? STANDARD_HEROES[0]!;

  // Cuando el primer personaje con carita queda listo, lo elegimos (los de la familia se eligen a mano).
  const primeraCarita = caritaHeroes[0]?.key ?? null;
  useEffect(() => {
    if (primeraCarita) setHeroKey(primeraCarita);
  }, [primeraCarita]);

  const name = formatName(rawName);
  // Si el personaje nuevo no tiene el look elegido, se muestra su look normal.
  const theme: LookKey = hero.looks.some((l) => l.key === lookElegido) ? lookElegido : "ninguno";

  const summary = useMemo(() => {
    const t = hero.looks.find((x) => x.key === theme)?.label ?? "";
    const who = name || hero.label;
    return theme === "ninguno" ? who : `${who} · ${t}`;
  }, [hero.label, hero.looks, theme, name]);

  const downloadLabel = name ? `Descargar el kit de ${name} (PDF)` : "Descargar mi kit (PDF)";

  function irAFoto() {
    window.setTimeout(() => document.getElementById("carita")?.scrollIntoView({ behavior: "smooth", block: "start" }), 60);
  }

  function imprimir() {
    window.setTimeout(() => window.print(), 60);
  }

  return (
    <>
      <main className="min-h-screen bg-background pb-28 print:hidden sm:pb-0">
        <header className="border-b border-border/60 bg-surface/70">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-5 py-3">
            <span className="font-display text-lg font-semibold text-foreground">{BRAND}</span>
            <CodigoBoton token={carita.token} fotos={carita.fotos} onActivado={carita.activar} onIrAFoto={irAFoto} />
          </div>
        </header>

        <section className="mx-auto max-w-6xl px-5 py-8 sm:py-10">
          <div className="mb-8 max-w-2xl">
            <h1 className="font-display text-3xl font-semibold text-balance text-foreground sm:text-4xl">
              {name ? `Vamos a crear el kit de ${name}` : "Crea el héroe de tu hijo y descarga su kit personalizado"}
            </h1>
            <p className="mt-3 leading-relaxed text-muted-foreground">
              Son 3 pasos y menos de un minuto. Su kit para imprimir trae su portada, los 7 looks de su personaje,{" "}
              {STORY_COUNT} historias con su nombre y su certificado de héroe: {TOTAL_PAGES} páginas en total.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-[minmax(0,360px)_1fr] md:items-start">
            {/* Vista previa */}
            <div className="mx-auto w-full max-w-[320px] md:sticky md:top-6 md:mx-0">
              <div className="flex aspect-[5/8] items-center justify-center rounded-3xl bg-surface p-4 shadow-lift">
                <img
                  src={img(hero, theme)}
                  alt={`Ilustración de ${summary}`}
                  className="max-h-full max-w-full object-contain"
                />
              </div>
              <p className="mt-3 text-center text-sm font-semibold text-brand-deep">{summary}</p>
            </div>

            {/* Controles */}
            <div className="flex flex-col gap-7 rounded-3xl border border-border bg-surface p-5 shadow-soft sm:p-6">
              <div>
                <label htmlFor="hero-name">
                  <StepTitle n={1}>¿Cómo se llama tu héroe?</StepTitle>
                </label>
                <input
                  id="hero-name"
                  type="text"
                  value={rawName}
                  maxLength={18}
                  onChange={(e) => setRawName(e.target.value)}
                  placeholder="Ej.: Mateo"
                  autoComplete="off"
                  autoCapitalize="words"
                  className="h-12 w-full rounded-xl border border-border bg-background px-4 text-base text-foreground outline-none transition-colors focus:border-brand"
                />
                <p className="mt-1.5 text-xs text-muted-foreground">
                  Aparecerá en la portada, en cada historia y en su certificado.
                </p>
              </div>

              <div>
                <StepTitle n={2}>Elige su personaje</StepTitle>
                <div className={heroes.length > 4 ? "-mx-1 flex gap-2 overflow-x-auto px-1 pb-1" : "grid grid-cols-4 gap-2"}>
                  {heroes.map((h) => {
                    const active = hero.key === h.key;
                    return (
                      <button
                        key={h.key}
                        type="button"
                        onClick={() => setHeroKey(h.key)}
                        aria-pressed={active}
                        className={`flex flex-col items-center gap-1 rounded-2xl border-2 bg-surface p-1.5 pb-2 text-xs font-medium transition-[transform,border-color] duration-150 ease-out active:scale-[0.97] ${
                          heroes.length > 4 ? "w-[76px] shrink-0" : ""
                        } ${active ? "border-brand text-brand-deep" : "border-transparent text-foreground hover:border-border"}`}
                      >
                        <img src={thumb(h, "ninguno")} alt="" width={72} height={120} className="h-[96px] w-full object-contain" />
                        <span className="w-full truncate text-center leading-tight">{h.label}</span>
                      </button>
                    );
                  })}
                </div>
                {caritaHeroes.length === 0 && (
                  <button
                    type="button"
                    onClick={irAFoto}
                    className="mt-3 inline-flex min-h-11 items-center text-sm font-semibold text-brand"
                  >
                    ¿Y si el héroe tiene su carita? Créalo con una foto
                  </button>
                )}
              </div>

              <div>
                <StepTitle n={3}>Mira sus looks</StepTitle>
                <ThemePicker hero={hero} value={theme} onChange={setTheme} />
                <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                  Los 7 looks vienen todos en su kit. Cada uno es una ilustración completa, lista para imprimir y recortar.
                </p>
              </div>
            </div>
          </div>

          {/* Vista previa del kit */}
          <div className="mt-10">
            <p className="mb-3 font-semibold text-foreground">
              {name ? `Así se verá el kit de ${name}` : "Así se verá su kit"}
            </p>
            <KitPreview name={name} hero={hero} />
          </div>

          {/* Descarga */}
          <div className="mt-8 rounded-3xl border border-brand/25 bg-mist/60 p-6">
            <div className="flex items-start gap-3">
              <Sparkles className="mt-0.5 size-5 shrink-0 text-brand" />
              <div>
                <p className="font-semibold text-foreground">
                  {name ? `El kit de ${name}, listo para imprimir` : "Tu kit completo para imprimir"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {TOTAL_PAGES} páginas: portada, 7 looks, {STORY_COUNT} historias con su nombre y el certificado de héroe.
                </p>
              </div>
            </div>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <Button size="lg" className="shadow-cta" disabled={!name} onClick={imprimir}>
                <Download className="size-4" />
                {downloadLabel}
              </Button>
              <p className="text-sm text-muted-foreground">
                {name
                  ? "En la ventana que se abre, elige “Guardar como PDF” o imprime directo."
                  : "Escribe el nombre de tu héroe para activar la descarga."}
              </p>
            </div>

            <div className="mt-6 border-t border-brand/15 pt-5">
              <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Printer className="size-4 text-brand" />
                Para que quede perfecto al imprimir
              </p>
              <ul className="mt-2 space-y-1.5 text-sm leading-relaxed text-muted-foreground">
                <li>Usa cartulina o papel grueso (180 g o más): los personajes duran más y se paran mejor.</li>
                <li>Deja la escala en 100% o “Ajustar a la página”, y activa “Gráficos de fondo” si aparece la opción.</li>
                <li>En iPhone o iPad: toca Compartir, luego Imprimir, y desde ahí puedes guardar el PDF.</li>
                <li>¿Tienes más de un hijo? Cambia el nombre y descarga otro kit, las veces que quieras.</li>
              </ul>
            </div>
          </div>

          {/* Con su carita: se desbloquea con el código de la página de códigos */}
          <div id="carita" className="mt-10 scroll-mt-4">
            {carita.token && carita.fotos > 0 ? (
              <PersonajesCarita token={carita.token} fotos={carita.fotos} personajes={caritas} onCambio={carita.recargar} />
            ) : (
              <div className="flex flex-col gap-4 rounded-3xl border border-border bg-surface p-5 shadow-soft sm:flex-row sm:items-center sm:p-6">
                <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-brand/10">
                  <Camera className="size-6 text-brand" aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-display text-xl font-semibold text-foreground">¿Y si el héroe tiene su carita?</p>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    Con “Con su carita” subes o tomas una foto y lo dibujamos como un personaje más del kit, con sus 7 looks.
                    Si lo compraste, copia el código de tu página de códigos y pégalo en <b>Tengo un código</b>, arriba a la derecha.
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Botón fijo en el celular */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/95 p-3 backdrop-blur-md print:hidden sm:hidden">
        <Button size="lg" className="h-12 w-full shadow-cta" disabled={!name} onClick={imprimir}>
          <Download className="size-4" />
          {name ? downloadLabel : "Escribe su nombre para descargar"}
        </Button>
      </div>

      {name ? <PrintKit name={name} hero={hero} /> : null}
    </>
  );
}
