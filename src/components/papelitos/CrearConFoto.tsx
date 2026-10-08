import { useRef, useState, type ChangeEvent } from "react";
import { Camera, ImageUp, Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { lookDe, type LookKey } from "@/lib/kit";
import { MAX_INTENTOS_POR_FOTO, SUPPORT_EMAIL } from "@/lib/papelitos-config";
import {
  crearLookCarita,
  crearPersonajeBase,
  looksCarita,
  type ErrorCarita,
  type Genero,
  type PersonajeCarita,
} from "@/lib/carita.functions";

// Flujo de UNA foto: permiso -> foto (tomar o subir) -> creación.
// La foto se recorta y se achica a 768 px en el propio celular (eso además borra
// los datos de ubicación de la cámara), se envía una sola vez y no se guarda.

type Paso = "permiso" | "foto" | "creando" | "error";

const MENSAJES: Record<ErrorCarita, string> = {
  rechazada: "No pudimos crear el personaje con esta foto. Prueba con otra: de frente, con buena luz y sin otras personas.",
  limite: `Ya usaste los ${MAX_INTENTOS_POR_FOTO} intentos de este personaje. Si necesitas ayuda, escríbenos a ${SUPPORT_EMAIL}.`,
  ocupado: "Hay muchas familias creando personajes ahora. Inténtalo de nuevo en unos minutos. Este intento no se descontó.",
  sin_credito: `La creación de personajes está en pausa. Inténtalo de nuevo más tarde y, si sigue así, escríbenos a ${SUPPORT_EMAIL}. Este intento no se descontó.`,
  sin_acceso: "Este personaje no está desbloqueado en este celular. Canjea tu código arriba a la derecha.",
  sin_base: "Algo salió mal al guardar el personaje. Inténtalo de nuevo.",
  fallo: "Algo salió mal. Inténtalo de nuevo en un momento. Este intento no se descontó.",
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

// Genera los looks que faltan de un personaje (también sirve para reintentar los que fallaron).
export async function completarLooksCarita(token: string, slot: number, lista: readonly LookKey[], onLook: (l: LookKey) => void) {
  const fallas: ErrorCarita[] = [];
  await enTandas(lista, 3, async (look) => {
    try {
      const r = await crearLookCarita({ data: { token, slot, look } });
      if (r.ok) onLook(look);
      else fallas.push(r.error);
    } catch {
      fallas.push("fallo");
    }
  });
  return fallas;
}

export function CrearConFoto({
  token,
  slot,
  existente,
  onListo,
  onCerrar,
}: {
  token: string;
  slot: number;
  existente?: PersonajeCarita | undefined;
  onListo: () => void;
  onCerrar: () => void;
}) {
  const intentosRestantes = MAX_INTENTOS_POR_FOTO - (existente?.intentos ?? 0);
  const [paso, setPaso] = useState<Paso>(intentosRestantes > 0 ? "permiso" : "error");
  const [acepto, setAcepto] = useState(false);
  const [nombre, setNombre] = useState(existente?.nombre ?? "");
  const [genero, setGenero] = useState<Genero | null>(existente?.genero ?? null);
  const [foto, setFoto] = useState<string | null>(null);
  const [progreso, setProgreso] = useState<{ base: boolean; looks: LookKey[] }>({ base: false, looks: [] });
  const [error, setError] = useState<ErrorCarita>("limite");
  const camara = useRef<HTMLInputElement>(null);
  const galeria = useRef<HTMLInputElement>(null);

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

  async function completar(lista: readonly LookKey[], listos: LookKey[]) {
    setPaso("creando");
    setProgreso({ base: true, looks: listos });
    const fallas = await completarLooksCarita(token, slot, lista, (look) => setProgreso((p) => ({ ...p, looks: [...p.looks, look] })));
    onListo();
    if (fallas.length) {
      setError(fallas[0]!);
      setPaso("error");
      return;
    }
    onCerrar();
  }

  async function crear() {
    if (!foto || !genero) return;
    setPaso("creando");
    setProgreso({ base: false, looks: [] });
    let base: Awaited<ReturnType<typeof crearPersonajeBase>>;
    try {
      base = await crearPersonajeBase({ data: { token, foto, genero, slot, nombre } });
    } catch {
      base = { ok: false, error: "fallo" };
    }
    setFoto(null); // la foto ya no se necesita: se descarta también en el celular
    if (!base.ok) {
      setError(base.error);
      setPaso("error");
      onListo();
      return;
    }
    await completar(looksCarita(genero), []);
  }

  return (
    <div className="rounded-3xl border border-brand/30 bg-surface p-5 shadow-soft sm:p-6">
      {paso === "permiso" && (
        <div>
          <p className="font-display text-xl font-semibold text-foreground">Antes de la foto</p>
          <ul className="mt-3 space-y-2 text-sm leading-relaxed text-muted-foreground">
            <li>Usamos la foto solo para dibujar el personaje. No se publica ni se usa para nada más.</li>
            <li>La foto no se guarda: se usa una vez para crear el dibujo. Solo quedan los dibujos, y puedes borrarlos cuando quieras.</li>
            <li>
              Si no sale bien, puedes probar con otra foto: te quedan {intentosRestantes} {intentosRestantes === 1 ? "intento" : "intentos"} para este personaje.
            </li>
          </ul>
          <label htmlFor={`nombre-${slot}`} className="mt-5 block text-sm font-semibold text-foreground">
            ¿De quién es la foto? <span className="font-normal text-muted-foreground">(opcional)</span>
          </label>
          <input
            id={`nombre-${slot}`}
            type="text"
            value={nombre}
            maxLength={20}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Ej.: Sofía, Mamá, el abuelo"
            autoComplete="off"
            className="mt-2 h-12 w-full rounded-xl border border-border bg-background px-4 text-base text-foreground outline-none focus:border-brand"
          />
          <p className="mt-5 text-sm font-semibold text-foreground">Estilo del personaje</p>
          <p className="mt-0.5 text-xs text-muted-foreground">Define sus 7 looks: los del Niño (superhéroe, bombero, chef…) o los de la Niña (hada, princesa, bailarina…).</p>
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
            <span>
              Soy mayor de 18 años. Si la foto es de un niño o niña, soy su madre, padre o tutor; si es de un adulto, tengo su permiso.
              Autorizo usarla solo para crear este personaje.
            </span>
          </label>
          <div className="mt-5 flex flex-wrap gap-2">
            <Button size="lg" className="h-12" disabled={!acepto || !genero} onClick={() => setPaso("foto")}>
              Continuar
            </Button>
            <Button size="lg" variant="ghost" className="h-12" onClick={onCerrar}>
              Cancelar
            </Button>
          </div>
        </div>
      )}

      {paso === "foto" && (
        <div>
          <p className="font-display text-xl font-semibold text-foreground">La foto</p>
          <ul className="mt-2 space-y-1 text-sm leading-relaxed text-muted-foreground">
            <li>De frente, mirando a la cámara.</li>
            <li>Con buena luz, sin lentes de sol ni gorro.</li>
            <li>Una sola persona en la foto.</li>
          </ul>
          <input ref={camara} type="file" accept="image/*" capture="user" className="hidden" onChange={elegirFoto} />
          <input ref={galeria} type="file" accept="image/*" className="hidden" onChange={elegirFoto} />
          {foto ? (
            <div className="mt-4">
              <img src={foto} alt="Foto elegida" className="mx-auto aspect-square w-full max-w-[260px] rounded-2xl object-cover" />
              <div className="mt-4 flex flex-wrap gap-2">
                <Button size="lg" className="h-12 shadow-cta" onClick={crear}>
                  Crear el personaje
                </Button>
                <Button size="lg" variant="outline" className="h-12" onClick={() => setFoto(null)}>
                  Cambiar foto
                </Button>
              </div>
            </div>
          ) : (
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              <Button size="lg" className="h-12 shadow-cta" onClick={() => camara.current?.click()}>
                <Camera className="size-4" aria-hidden />
                Tomar foto
              </Button>
              <Button size="lg" variant="outline" className="h-12" onClick={() => galeria.current?.click()}>
                <ImageUp className="size-4" aria-hidden />
                Subir una foto
              </Button>
            </div>
          )}
          <p className="mt-4 flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden />
            La foto se recorta y se achica aquí en tu celular antes de enviarse, y no se guarda.
          </p>
        </div>
      )}

      {paso === "creando" && (
        <div role="status" aria-live="polite">
          <p className="flex items-center gap-2 font-display text-xl font-semibold text-foreground">
            <Loader2 className="size-5 animate-spin text-brand" aria-hidden />
            Creando {nombre ? `a ${nombre}` : "el personaje"}…
          </p>
          <p className="mt-2 text-sm text-muted-foreground">Tarda uno o dos minutos. No cierres esta pantalla.</p>
          <ul className="mt-4 space-y-1.5 text-sm">
            <li className={progreso.base ? "text-foreground" : "text-muted-foreground"}>{progreso.base ? "✓" : "…"} Su personaje</li>
            {(genero ? looksCarita(genero) : []).map((l) => (
              <li key={l} className={progreso.looks.includes(l) ? "text-foreground" : "text-muted-foreground"}>
                {progreso.looks.includes(l) ? "✓" : "…"} Look {genero ? lookDe(genero, l).label : ""}
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
            {progreso.base && genero && error !== "limite" && error !== "sin_acceso" && (
              <Button size="lg" className="h-12" onClick={() => completar(looksCarita(genero).filter((l) => !progreso.looks.includes(l)), progreso.looks)}>
                Completar los looks que faltan
              </Button>
            )}
            {!progreso.base && error !== "limite" && error !== "sin_acceso" && intentosRestantes > 0 && (
              <Button size="lg" className="h-12" onClick={() => setPaso("foto")}>
                {error === "rechazada" ? "Intentar con otra foto" : "Intentar de nuevo"}
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
