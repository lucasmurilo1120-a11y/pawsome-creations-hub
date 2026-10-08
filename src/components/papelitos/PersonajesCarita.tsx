import { useState } from "react";
import { Copy, Plus, Trash2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CrearConFoto, completarLooksCarita } from "@/components/papelitos/CrearConFoto";
import { borrarPersonajeCarita, looksCarita, type PersonajeCarita } from "@/lib/carita.functions";
import { enlaceDeAcceso } from "@/lib/carita.client";
import { CHECKOUT_PACK_FAMILIA, MAX_INTENTOS_POR_FOTO } from "@/lib/papelitos-config";

// Panel "Con su carita": un lugar por cada personaje desbloqueado con código.
export function PersonajesCarita({
  token,
  fotos,
  personajes,
  onCambio,
}: {
  token: string;
  fotos: number;
  personajes: PersonajeCarita[];
  onCambio: () => Promise<void> | void;
}) {
  const [abierto, setAbierto] = useState<number | null>(() => (personajes.length === 0 ? 0 : null));
  const [ocupado, setOcupado] = useState<number | null>(null);
  const [copiado, setCopiado] = useState(false);
  const porSlot = new Map(personajes.map((p) => [p.slot, p]));
  const creados = personajes.filter((p) => p.imagenes["ninguno"]).length;

  async function completar(slot: number, p: PersonajeCarita) {
    setOcupado(slot);
    await completarLooksCarita(token, slot, looksCarita(p.genero).filter((l) => !p.imagenes[l]), () => {});
    await onCambio();
    setOcupado(null);
  }

  async function borrar(slot: number) {
    setOcupado(slot);
    await borrarPersonajeCarita({ data: { token, slot } });
    await onCambio();
    setOcupado(null);
  }

  async function copiarEnlace() {
    const enlace = enlaceDeAcceso(token);
    try {
      await navigator.clipboard.writeText(enlace);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      window.prompt("Copia tu enlace de acceso:", enlace);
    }
  }

  return (
    <div className="rounded-3xl border border-brand/30 bg-surface p-5 shadow-soft sm:p-6">
      <p className="font-display text-xl font-semibold text-foreground">Personajes con su carita</p>
      <p className="mt-1 text-sm text-muted-foreground">
        {creados} de {fotos} {fotos === 1 ? "personaje creado" : "personajes creados"}. Cada uno aparece arriba, en “Elige su personaje”, con sus 7 looks y sus 12 historias.
      </p>

      <ul className="mt-4 space-y-3">
        {Array.from({ length: fotos }, (_, slot) => {
          const p = porSlot.get(slot);
          const listo = Boolean(p?.imagenes["ninguno"]);
          const faltan = p ? looksCarita(p.genero).filter((l) => !p.imagenes[l]).length : 6;
          const sinIntentos = (p?.intentos ?? 0) >= MAX_INTENTOS_POR_FOTO;
          return (
            <li key={slot} className="rounded-2xl border border-border p-3">
              {abierto === slot ? (
                <CrearConFoto token={token} slot={slot} existente={p} onListo={() => void onCambio()} onCerrar={() => setAbierto(null)} />
              ) : (
                <div className="flex items-center gap-3">
                  <div className="grid size-16 shrink-0 place-items-center overflow-hidden rounded-xl bg-mist/60">
                    {listo ? <img src={p!.imagenes["ninguno"]} alt="" className="size-full object-contain" /> : <Plus className="size-6 text-muted-foreground" aria-hidden />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-foreground">{p?.nombre || `Personaje ${slot + 1}`}</p>
                    <p className="text-xs text-muted-foreground">
                      {!listo ? (sinIntentos ? "Sin intentos" : "Sin crear todavía") : faltan > 0 ? `Faltan ${faltan} looks` : "Listo, con sus 7 looks"}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    {!listo && (
                      <Button size="sm" className="h-10" disabled={sinIntentos} onClick={() => setAbierto(slot)}>
                        Crear con foto
                      </Button>
                    )}
                    {listo && faltan > 0 && (
                      <Button size="sm" className="h-10" disabled={ocupado === slot} onClick={() => completar(slot, p!)}>
                        {ocupado === slot ? "Creando…" : "Completar"}
                      </Button>
                    )}
                    {listo && faltan === 0 && !sinIntentos && (
                      <button type="button" onClick={() => setAbierto(slot)} className="min-h-10 text-sm font-semibold text-brand">
                        Cambiar foto
                      </button>
                    )}
                    {listo && (
                      <button
                        type="button"
                        onClick={() => borrar(slot)}
                        disabled={ocupado === slot}
                        className="inline-flex min-h-10 items-center gap-1 text-xs font-semibold text-destructive"
                      >
                        <Trash2 className="size-3.5" aria-hidden />
                        Borrar
                      </button>
                    )}
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-mist/50 p-4">
        <p className="min-w-0 flex-1 text-sm leading-relaxed text-muted-foreground">
          Tus personajes quedan guardados en este celular. Para verlos en otro dispositivo, guarda tu enlace de acceso.
        </p>
        <Button size="sm" variant="outline" className="h-10" onClick={copiarEnlace}>
          <Copy className="size-4" aria-hidden />
          {copiado ? "¡Copiado!" : "Copiar mi enlace"}
        </Button>
      </div>

      {CHECKOUT_PACK_FAMILIA && fotos < 5 && creados > 0 && (
        <div className="mt-4 rounded-2xl border border-border p-4">
          <p className="flex items-center gap-2 font-semibold text-foreground">
            <Users className="size-4 text-brand" aria-hidden />
            ¿Y sus hermanos, mamá o papá?
          </p>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">El Pack familia suma 4 personajes más, cada uno con su carita.</p>
          <a
            href={CHECKOUT_PACK_FAMILIA}
            className="mt-3 inline-flex h-12 items-center justify-center rounded-md bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-cta"
          >
            Sumar 4 personajes
          </a>
        </div>
      )}
    </div>
  );
}
