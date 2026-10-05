import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Download, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";

// Nombre de la marca en un solo lugar: cambiarlo acá lo cambia en toda la app.
const BRAND = "Papelitos";
const TAGLINE = "Tu hijo, el héroe de papel";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: `${BRAND} — ${TAGLINE}` },
      {
        name: "description",
        content:
          "Elige el personaje y el tema, escribe el nombre de tu hijo y descarga su kit de héroe de papel con historias y certificado, listo para imprimir.",
      },
      { property: "og:title", content: `${BRAND} — ${TAGLINE}` },
      {
        property: "og:description",
        content: "Su nombre en cada historia y en su certificado de héroe. Imprímelo en casa y a jugar.",
      },
    ],
  }),
  component: CreatorApp,
});

// ---------------------------------------------------------------------------
// Datos — 2 personajes x 7 looks ilustrados. Cada look es una ilustración
// completa (pelo, ropa y accesorios ya combinados), lista para recortar.
// ---------------------------------------------------------------------------

type Character = "nino" | "nina";
type ThemeKey = "ninguno" | "superheroe" | "pirata" | "astronauta" | "mago" | "guerreiro" | "realeza";

const CHARACTERS: { key: Character; label: string; emoji: string }[] = [
  { key: "nino", label: "Niño", emoji: "👦" },
  { key: "nina", label: "Niña", emoji: "👧" },
];

const THEMES: { key: ThemeKey; label: string; emoji: string }[] = [
  { key: "ninguno", label: "Sin tema", emoji: "✨" },
  { key: "superheroe", label: "Superhéroe", emoji: "🦸" },
  { key: "pirata", label: "Pirata", emoji: "🏴‍☠️" },
  { key: "astronauta", label: "Astronauta", emoji: "🚀" },
  { key: "mago", label: "Mago/Bruja", emoji: "🧙" },
  { key: "guerreiro", label: "Guerrero", emoji: "🛡️" },
  { key: "realeza", label: "Realeza", emoji: "👑" },
];

const CHARACTER_IMAGES: Record<Character, Record<ThemeKey, string>> = {
  nino: {
    ninguno: "/personajes/nino-base.webp",
    superheroe: "/personajes/nino-superheroe.webp",
    pirata: "/personajes/nino-pirata.webp",
    astronauta: "/personajes/nino-astronauta.webp",
    mago: "/personajes/nino-mago.webp",
    guerreiro: "/personajes/nino-guerreiro.webp",
    realeza: "/personajes/nino-realeza.webp",
  },
  nina: {
    ninguno: "/personajes/nina-base.webp",
    superheroe: "/personajes/nina-superheroe.webp",
    pirata: "/personajes/nina-pirata.webp",
    astronauta: "/personajes/nina-astronauta.webp",
    mago: "/personajes/nina-mago.webp",
    guerreiro: "/personajes/nina-guerreiro.webp",
    realeza: "/personajes/nina-realeza.webp",
  },
};

// ---------------------------------------------------------------------------
// Historias — el nombre del niño entra en el texto.
// ---------------------------------------------------------------------------

type Story = { theme: ThemeKey; label: string; title: string; paragraphs: string[] };

function buildStories(name: string, character: Character): Story[] {
  const girl = character === "nina";
  const capitan = girl ? "la capitana" : "el capitán";
  const explorador = girl ? "la primera exploradora" : "el primer explorador";
  const mago = girl ? "la maga" : "el mago";

  return [
    {
      theme: "superheroe",
      label: "Superhéroe",
      title: "El día que salvó el parque",
      paragraphs: [
        `Esa tarde, el gato del señor Antonio se había subido al árbol más alto del parque y no quería bajar. Todos miraban hacia arriba sin saber qué hacer, hasta que llegó ${name}.`,
        `No hicieron falta poderes mágicos: bastaron unos brazos fuertes, una capa que ondeaba con el viento y muchas ganas de ayudar. ${name} subió rama por rama, con cuidado, hablándole despacito al gato asustado.`,
        "Cuando por fin llegó arriba, lo sostuvo con firmeza contra el pecho y bajó despacio, un escalón invisible a la vez, mientras el parque entero contenía la respiración.",
        `Abajo, todos aplaudieron. El señor Antonio le dio las gracias con los ojos brillosos. ${name} solo sonrió: los héroes de verdad no buscan medallas, buscan un buen final.`,
      ],
    },
    {
      theme: "pirata",
      label: "Pirata",
      title: "El mapa del tesoro escondido",
      paragraphs: [
        "La lluvia había lavado el jardín y, entre las piedras del camino, algo brillaba distinto. Era la esquina de un papel doblado en cuatro, con bordes quemados a propósito y una equis dibujada con tinta gruesa.",
        "El mapa marcaba el camino: pasar bajo la mesa de la cocina, rodear dos veces la maceta grande y girar a la izquierda en el sillón azul. Cada paso se sentía más importante que el anterior.",
        `Con el catalejo en alto para vigilar peligros invisibles, ${capitan} ${name} avanzó sin apuro. Los verdaderos tesoros nunca están donde uno espera, y eso lo hace todo más emocionante.`,
        `Al final del camino, detrás del cojín más grande del sofá, esperaba el cofre: un puñado de piedritas brillantes y una nota que decía "el tesoro más grande fue el viaje". ${name} sonrió — ya sabía que volvería a navegar.`,
      ],
    },
    {
      theme: "astronauta",
      label: "Astronauta",
      title: "Un viaje a la luna de papel",
      paragraphs: [
        "La cuenta regresiva empezó en la sala: diez, nueve, ocho... El cohete —hecho con dos sillas y una manta bien estirada— estaba listo para despegar rumbo a una luna hecha de papel plateado.",
        "Flotar era más fácil de lo que parecía: solo había que mover los brazos despacio y fingir que el suelo ya no tiraba hacia abajo. Afuera de la ventana imaginaria, las estrellas se dejaban contar una por una.",
        "En la superficie lunar —la alfombra de la sala, ahora cubierta de cráteres invisibles— cada paso se sentía enorme y silencioso, como si el mundo entero estuviera esperando para ver qué se descubría ahí.",
        `La bandera se plantó justo al lado del sillón: ${name} era ${explorador} en pisar esa luna en particular. La misión había sido un éxito, y ya se estaba planeando el próximo viaje para después de la cena.`,
      ],
    },
    {
      theme: "mago",
      label: "Mago/Bruja",
      title: "El hechizo de las estrellas",
      paragraphs: [
        "El libro de hechizos —en realidad, un cuaderno con dibujos de estrellas— decía que esa noche el cielo iba a estar de humor para la magia. Solo hacía falta una varita, un sombrero puntiagudo y mucha concentración.",
        'El primer hechizo era sencillo: "Luces, brillen fuerte". Con la varita en alto, dando una vuelta completa sobre los talones, las luces de verdad parecían titilar un poquito más.',
        "El segundo hechizo era más ambicioso: hacer que la manta del sillón volara como una capa mágica. No funcionó exactamente como en el libro, pero terminó siendo aún mejor: una capa de verdad, lista para la próxima aventura.",
        `Cuando el reloj marcó la hora de dormir, ${mago} ${name} guardó la varita bajo la almohada. Mañana habría más estrellas que encender, y ninguna magia es tan poderosa como la de una buena noche de sueño.`,
      ],
    },
  ];
}

// ---------------------------------------------------------------------------
// Kit imprimible — se arma en el momento con el nombre elegido. Solo se ve al
// imprimir ("Guardar como PDF" en el diálogo de impresión).
// ---------------------------------------------------------------------------

const PAGE_BREAK = { breakAfter: "page", pageBreakAfter: "always" } as const;

function PrintKit({ name, character }: { name: string; character: Character }) {
  const images = CHARACTER_IMAGES[character];
  const stories = buildStories(name, character);

  return (
    <div className="print-kit hidden print:block" aria-hidden>
      {/* Portada */}
      <section style={PAGE_BREAK} className="flex min-h-[250mm] flex-col items-center justify-center gap-6 text-center">
        <p className="text-lg font-semibold tracking-wide text-brand">{BRAND}</p>
        <h1 className="font-display text-5xl font-semibold text-foreground">El kit de héroe de {name}</h1>
        <img src={images.ninguno} alt="" className="max-h-[170mm] object-contain" />
        <p className="text-base text-muted-foreground">
          Recorta, juega y vive las aventuras de {name}.
        </p>
      </section>

      {/* Looks */}
      {THEMES.map((t) => (
        <section
          key={t.key}
          style={PAGE_BREAK}
          className="flex min-h-[250mm] flex-col items-center justify-center gap-5 text-center"
        >
          <p className="text-sm font-semibold tracking-wide text-brand">
            {t.emoji} {t.key === "ninguno" ? "Look normal" : t.label}
          </p>
          <h2 className="font-display text-3xl font-semibold text-foreground">{name}</h2>
          <img src={images[t.key]} alt="" className="max-h-[200mm] object-contain" />
          <p className="text-sm text-muted-foreground">Recorta siguiendo el borde del dibujo.</p>
        </section>
      ))}

      {/* Historias */}
      {stories.map((s, i) => (
        <section key={s.theme} style={PAGE_BREAK} className="flex min-h-[250mm] flex-col gap-5">
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
            <img src={images[s.theme]} alt="" className="max-h-[140mm] w-[55mm] shrink-0 object-contain" />
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
          <img src={images.superheroe} alt="" className="max-h-[110mm] object-contain" />
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

function ThemePicker({ value, onChange }: { value: ThemeKey; onChange: (key: ThemeKey) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {THEMES.map((t) => (
        <button
          key={t.key}
          type="button"
          onClick={() => onChange(t.key)}
          className={`flex items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-medium transition-colors ${
            value === t.key
              ? "border-brand bg-brand text-primary-foreground shadow-cta"
              : "border-border bg-surface text-foreground hover:bg-mist"
          }`}
        >
          <span aria-hidden>{t.emoji}</span>
          {t.label}
        </button>
      ))}
    </div>
  );
}

function CreatorApp() {
  const [character, setCharacter] = useState<Character>("nino");
  const [theme, setTheme] = useState<ThemeKey>("ninguno");
  const [rawName, setRawName] = useState("");

  const name = rawName.trim();

  const summary = useMemo(() => {
    const c = CHARACTERS.find((x) => x.key === character)!.label;
    const t = THEMES.find((x) => x.key === theme)!.label;
    const who = name || c;
    return theme === "ninguno" ? who : `${who} · ${t}`;
  }, [character, theme, name]);

  const imageSrc = CHARACTER_IMAGES[character][theme];

  return (
    <>
      <main className="min-h-screen bg-background print:hidden">
        <header className="border-b border-border/60 bg-surface/70">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
            <span className="font-display text-lg font-semibold text-foreground">{BRAND}</span>
            <span className="hidden text-sm text-muted-foreground sm:inline">{TAGLINE}</span>
          </div>
        </header>

        <section className="mx-auto max-w-6xl px-5 py-10">
          <div className="mb-8 max-w-2xl">
            <p className="text-sm font-semibold text-brand">Tu kit, a su nombre</p>
            <h1 className="mt-2 font-display text-3xl font-semibold text-balance text-foreground sm:text-4xl">
              Crea el héroe de tu hijo y descarga su kit personalizado
            </h1>
            <p className="mt-3 leading-relaxed text-muted-foreground">
              Escribe su nombre, elige personaje y tema, y mira cómo queda. Tu kit para imprimir incluye los 7 looks
              ilustrados, 4 historias con su nombre y su certificado de héroe.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-[minmax(0,320px)_1fr] md:items-start">
            {/* Vista previa */}
            <div className="mx-auto w-full max-w-[280px] md:mx-0">
              <div className="flex aspect-[5/8] items-center justify-center rounded-3xl bg-surface p-4 shadow-lift">
                <img
                  src={imageSrc}
                  alt={`Ilustración de ${summary}`}
                  className="max-h-full max-w-full object-contain"
                />
              </div>
              <p className="mt-3 text-center text-sm font-semibold text-brand-deep">{summary}</p>
            </div>

            {/* Controles */}
            <div className="flex flex-col gap-6 rounded-3xl border border-border bg-surface p-6 shadow-soft">
              <div>
                <label htmlFor="hero-name" className="mb-2 block text-sm font-semibold text-foreground">
                  ¿Cómo se llama tu héroe?
                </label>
                <input
                  id="hero-name"
                  type="text"
                  value={rawName}
                  maxLength={18}
                  onChange={(e) => setRawName(e.target.value)}
                  placeholder="Ej.: Mateo"
                  autoComplete="off"
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-base text-foreground outline-none transition-colors focus:border-brand"
                />
                <p className="mt-1.5 text-xs text-muted-foreground">
                  Su nombre aparecerá en las historias, en cada look y en el certificado.
                </p>
              </div>

              <div>
                <p className="mb-2 text-sm font-semibold text-foreground">Personaje</p>
                <div className="flex gap-2">
                  {CHARACTERS.map((c) => (
                    <button
                      key={c.key}
                      type="button"
                      onClick={() => setCharacter(c.key)}
                      className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                        character === c.key
                          ? "border-brand bg-brand text-primary-foreground"
                          : "border-border bg-surface text-foreground hover:bg-mist"
                      }`}
                    >
                      <span aria-hidden>{c.emoji}</span>
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-2 text-sm font-semibold text-foreground">Tema</p>
                <ThemePicker value={theme} onChange={setTheme} />
              </div>

              <p className="text-sm leading-relaxed text-muted-foreground">
                Cada tema es una ilustración completa —pelo, ropa y accesorios ya combinados por nuestro equipo—
                lista para imprimir y recortar.
              </p>
            </div>
          </div>

          {/* Descarga */}
          <div className="mt-10 rounded-3xl border border-brand/25 bg-mist/60 p-6">
            <div className="flex items-start gap-3">
              <Sparkles className="mt-0.5 size-5 shrink-0 text-brand" />
              <div>
                <p className="font-semibold text-foreground">
                  {name ? `El kit de ${name}, listo para imprimir` : "Tu kit completo para imprimir"}
                </p>
                <p className="text-sm text-muted-foreground">
                  13 páginas: portada, los 7 looks, 4 historias con su nombre y el certificado de héroe.
                </p>
              </div>
            </div>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <Button size="lg" className="shadow-cta" disabled={!name} onClick={() => window.print()}>
                <Download className="size-4" />
                Descargar mi kit (PDF)
              </Button>
              <p className="text-sm text-muted-foreground">
                {name
                  ? "En la ventana que se abre, elige “Guardar como PDF” (o imprime directo)."
                  : "Escribe el nombre de tu héroe para activar la descarga."}
              </p>
            </div>
          </div>
        </section>
      </main>

      {name ? <PrintKit name={name} character={character} /> : null}
    </>
  );
}
