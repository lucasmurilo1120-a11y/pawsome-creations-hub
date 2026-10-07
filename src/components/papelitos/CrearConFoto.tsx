import { useRef, useState, type ChangeEvent } from "react";
import { Camera, Loader2, ShieldCheck, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MAX_CREACIONES_CARITA, SUPPORT_EMAIL } from "@/lib/papelitos-config";
import { borrarPersonajeCarita, crearLookCarita, crearPersonajeBase, LOOKS_CARITA, type Genero } from "@/lib/personaje.functions";

// Flujo "Con su carita": consentimiento -> foto -> creación -> listo.
// La foto se achica a 768 px en el propio celular (eso además borra los datos de
// ubicación de la cámara), se envía una sola vez y no se guarda.

type Paso = "permiso" | "foto" | "creando" | "error";
type ErrorClave = "sin_compra" | "limite" | "sin_credito" | "ocupado" | "rechazada" | "fallo" | "sin_base";

const MENSAJES: Record<ErrorClave, string> = {
  rechazada: "No pudimos crear el personaje con esta foto. Prueba con otra: de frente, con buena luz y sin otras personas.",
  limite: `Ya usaste los ${MAX_CREACIONES_CARITA} intentos para crear su personaje. Si necesitas otro, escríbenos a ${SUPPORT_EMAIL}.`,
  ocupado: "Hay muchas familias creando personajes ahora. Inténtalo de nuevo en unos minutos.",
  sin_credito: "La creación de personajes está en pausa por unos minutos. Inténtalo de nuevo más tarde.",
  sin_compra: "Este extra no está activo en tu cuenta. Si acabas de pagar, espera un minuto y actualiza.",
  sin_base: "Algo salió mal al guardar su personaje. Inténtalo de nuevo.",
  fallo: "Algo salió mal. Inténtalo de nuevo en un momento.",
};

const NOMBRES_LOOK: Record<string, string> = {
  superheroe: "Superhéroe",
  pirata: "Pirata",
  astronauta: "Astronauta",
  mago: "Mago/Bruja",
  guerreiro: "Guerrero",
  realeza: "Realeza",
};

async function prepararFoto(archivo: File): Promise<string> {
  const url = URL.createObjectURL(archivo);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = () => reject(new Error("No se pudo leer la foto"));
      i.src = url;
    });
    const lado = Math.min(img.naturalWidth, img.naturalHeight);
    const sx = (img.naturalWidth - lado) / 2;
    const sy = Math.max(0, (img.naturalHeight - lado) / 2 - lado * 0.08); // un poco hacia arriba: la cara suele estar arriba
    const canvas = document.createElement("canvas");
    canvas.width = 768;
    canvas.height = 768;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Sin canvas");
    ctx.drawImage(img, sx, sy, lado, lado, 0, 0, 768, 768);
    return canvas.toDataURL("image/jpeg", 0.86);
  } finally {
    URL.revokeObjectURL(url);
  }
}

// Ejecuta tareas con un máximo de N al mismo tiempo (para no saturar la IA).
async function enTandas<T>(items: readonly T[], n: number, fn: (item: T) => Promise<void>) {
  const cola = [...items];
  await Promise.all(
    Array.from({ length: Math.min(n, cola.length) }, async () => {
      while (cola.length) await fn(cola.shift() as T);
    }),
  );
}

export function CrearConFoto({
  looksExistentes,
  onListo,
  onCerrar,
}: {
  looksExistentes: string[];
  onListo: () => void;
  onCerrar: () => void;
}) {
  const tienePersonaje = looksExistentes.includes("ninguno");
  const faltantes = LOOKS_CARITA.filter((l) => !looksExistentes.includes(l));
  const [paso, setPaso] = useState<Paso>("permiso");
  const [acepto, setAcepto] = useState(false);
  const [genero, setGenero] = useState<Genero | null>(null);
  const [foto, setFoto] = useState<string | null>(null);
  const [progreso, setProgreso] = useState<{ base: boolean; looks: string[] }>({ base: false, looks: [] });
  const [error, setError] = useState<ErrorClave>("fallo");
  const [borrando, setBorrando] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  async function elegirFoto(e: ChangeEvent<HTMLInputElement>) {
    const archivo = e.target.files?.[0];
    e.target.value = "";
    if (!archivo) return;
    try {
      setFoto(await prepararFoto(archivo));
    } catch {
      setError("rechazada");
      setPaso("error");
    }
  }

  async function crear() {
    if (!foto || !genero) return;
    setPaso("creando");
    setProgreso({ base: false, looks: [] });
    const base = await crearPersonajeBase({ data: { foto, genero } });
    setFoto(null); // la foto ya no se necesita: se descarta también en el celular
    if (!base.ok) {
      setError(base.error);
      setPaso("error");
      return;
    }
    await completarLooks(LOOKS_CARITA, []);
  }

  // Genera los looks que faltan (después de crear la base, o para reintentar los que fallaron).
  async function completarLooks(lista: readonly (typeof LOOKS_CARITA)[number][], listos: string[]) {
    setPaso("creando");
    setProgreso({ base: true, looks: listos });
    const fallas: ErrorClave[] = [];
    await enTandas(lista, 3, async (look) => {
      const r = await crearLookCarita({ data: { look } });
      if (r.ok) setProgreso((p) => ({ ...p, looks: [...p.looks, look] }));
      else fallas.push(r.error);
    });
    onListo();
    if (fallas.length) {
      setError(fallas[0]!);
      setPaso("error");
      return;
    }
    onCerrar();
  }

  async function borrar() {
    setBorrando(true);
    await borrarPersonajeCarita();
    setBorrando(false);
    onListo();
    onCerrar();
  }

  return (
    <div className="rounded-3xl border border-brand/30 bg-surface p-5 shadow-soft sm:p-6">
      {paso === "permiso" && (
        <div>
          <p className="font-display text-xl font-semibold text-foreground">Antes de la foto</p>
          <ul className="mt-3 space-y-2 text-sm leading-relaxed text-muted-foreground">
            <li>Usamos la foto solo para dibujar su personaje. No se publica ni se usa para nada más.</li>
            <li>La foto se borra apenas se crea el personaje. Solo guardamos los dibujos, y puedes borrarlos cuando quieras.</li>
            <li>Tienes {MAX_CREACIONES_CARITA} intentos para crear su personaje.</li>
          </ul>
          <p className="mt-5 text-sm font-semibold text-foreground">Su personaje es:</p>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {(
              [
                ["nino", "Niño"],
                ["nina", "Niña"],
              ] as const
            ).map(([g, label]) => (
              <button
                key={g}
                type="button"
                onClick={() => setGenero(g)}
                aria-pressed={genero === g}
                className={`min-h-12 rounded-xl border-2 text-sm font-semibold transition-colors ${
                  genero === g ? "border-brand bg-brand/10 text-brand-deep" : "border-border text-foreground"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <label className="mt-5 flex cursor-pointer items-start gap-3 text-sm leading-relaxed text-foreground">
            <input type="checkbox" checked={acepto} onChange={(e) => setAcepto(e.target.checked)} className="mt-1 size-5 shrink-0 accent-[var(--brand)]" />
            <span>Soy mayor de 18 años, soy madre, padre o tutor de este niño o niña y autorizo usar su foto solo para crear su personaje.</span>
          </label>
          <div className="mt-5 flex flex-wrap gap-2">
            <Button size="lg" className="h-12" disabled={!acepto || !genero} onClick={() => setPaso("foto")}>
              Continuar
            </Button>
            <Button size="lg" variant="ghost" className="h-12" onClick={onCerrar}>
              Cancelar
            </Button>
          </div>
          {tienePersonaje && faltantes.length > 0 && (
            <Button size="lg" variant="outline" className="mt-4 h-12 w-full" onClick={() => completarLooks(faltantes, LOOKS_CARITA.filter((l) => !faltantes.includes(l)))}>
              Completar los {faltantes.length} looks que faltan
            </Button>
          )}
          {tienePersonaje && (
            <button type="button" onClick={borrar} disabled={borrando} className="mt-4 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-destructive">
              <Trash2 className="size-4" aria-hidden />
              {borrando ? "Borrando…" : "Borrar su personaje actual"}
            </button>
          )}
        </div>
      )}

      {paso === "foto" && (
        <div>
          <p className="font-display text-xl font-semibold text-foreground">Su foto</p>
          <ul className="mt-2 space-y-1 text-sm leading-relaxed text-muted-foreground">
            <li>De frente, mirando a la cámara.</li>
            <li>Con buena luz, sin lentes de sol ni gorro.</li>
            <li>Solo él o ella en la foto.</li>
          </ul>
          <input ref={input} type="file" accept="image/*" className="hidden" onChange={elegirFoto} />
          {foto ? (
            <div className="mt-4">
              <img src={foto} alt="Foto elegida" className="mx-auto aspect-square w-full max-w-[260px] rounded-2xl object-cover" />
              <div className="mt-4 flex flex-wrap gap-2">
                <Button size="lg" className="h-12 shadow-cta" onClick={crear}>
                  Crear su personaje
                </Button>
                <Button size="lg" variant="outline" className="h-12" onClick={() => input.current?.click()}>
                  Elegir otra
                </Button>
              </div>
            </div>
          ) : (
            <Button size="lg" className="mt-4 h-12 shadow-cta" onClick={() => input.current?.click()}>
              <Camera className="size-4" aria-hidden />
              Tomar o elegir foto
            </Button>
          )}
          <p className="mt-4 flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden />
            La foto se recorta y se achica aquí en tu celular antes de enviarse, y se borra apenas se crea el personaje.
          </p>
        </div>
      )}

      {paso === "creando" && (
        <div role="status" aria-live="polite">
          <p className="flex items-center gap-2 font-display text-xl font-semibold text-foreground">
            <Loader2 className="size-5 animate-spin text-brand" aria-hidden />
            Creando su personaje…
          </p>
          <p className="mt-2 text-sm text-muted-foreground">Tarda alrededor de un minuto. No cierres esta pantalla.</p>
          <ul className="mt-4 space-y-1.5 text-sm">
            <li className={progreso.base ? "text-foreground" : "text-muted-foreground"}>{progreso.base ? "✓" : "…"} Su personaje</li>
            {LOOKS_CARITA.map((l) => (
              <li key={l} className={progreso.looks.includes(l) ? "text-foreground" : "text-muted-foreground"}>
                {progreso.looks.includes(l) ? "✓" : "…"} Look {NOMBRES_LOOK[l]}
              </li>
            ))}
          </ul>
        </div>
      )}

      {paso === "error" && (
        <div role="alert">
          <p className="font-display text-xl font-semibold text-foreground">No salió esta vez</p>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{MENSAJES[error]}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {progreso.base && error !== "limite" && error !== "sin_compra" && (
              <Button
                size="lg"
                className="h-12"
                onClick={() => completarLooks(LOOKS_CARITA.filter((l) => !progreso.looks.includes(l)), progreso.looks)}
              >
                Completar los looks que faltan
              </Button>
            )}
            {!progreso.base && error !== "limite" && error !== "sin_compra" && (
              <Button size="lg" className="h-12" onClick={() => setPaso("foto")}>
                Intentar con otra foto
              </Button>
            )}
            <Button size="lg" variant="ghost" className="h-12" onClick={onCerrar}>
              Cerrar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
