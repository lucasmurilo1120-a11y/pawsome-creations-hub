import { useState } from "react";
import { Plus, Trash2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CrearConFoto, completarLooksCarita } from "@/components/papelitos/CrearConFoto";
import type { PersonajeCarita } from "@/lib/acceso";
import { checkoutConEmail, MAX_INTENTOS_POR_FOTO, PACK_FAMILIA } from "@/lib/papelitos-config";
import { borrarPersonajeCarita, LOOKS_CARITA } from "@/lib/personaje.functions";

// Panel "Con su carita": un lugar por cada foto comprada. "Con su carita" da 1 foto
// y el Pack familia suma 4 más (hermanos, mamá, papá, abuelos...).
export function PersonajesCarita({
  fotos,
  personajes,
  email,
  onCambio,
  onRecargarCompras,
}: {
  fotos: number;
  personajes: PersonajeCarita[];
  email: string | null;
  onCambio: () => Promise<void> | void;
  onRecargarCompras: () => Promise<void> | void;
}) {
  const [abierto, setAbierto] = useState<number | null>(null);
  const [ocupado, setOcupado] = useState<number | null>(null);
  const porSlot = new Map(personajes.map((p) => [p.slot, p]));
  const creados = personajes.filter((p) => p.imagenes.ninguno).length;
  const pack = checkoutConEmail(PACK_FAMILIA.checkout, email);

  async function completar(slot: number, p: PersonajeCarita) {
    setOcupado(slot);
    await completarLooksCarita(slot, LOOKS_CARITA.filter((l) => !p.imagenes[l]), () => {});
    await onCambio();
    setOcupado(null);
  }

  async function borrar(slot: number) {
    setOcupado(slot);
    await borrarPersonajeCarita({ data: { slot } });
    await onCambio();
    setOcupado(null);
  }

  return (
    <div className="rounded-3xl border border-brand/30 bg-surface p-5 shadow-soft sm:p-6">
      <p className="font-display text-xl font-semibold text-foreground">Personajes con su carita</p>
      <p className="mt-1 text-sm text-muted-foreground">
        {creados} de {fotos} {fotos === 1 ? "personaje creado" : "personajes creados"}. Cada uno aparece como personaje del kit, con sus 7 looks.
      </p>

      <ul className="mt-4 space-y-3">
        {Array.from({ length: fotos }, (_, slot) => {
          const p = porSlot.get(slot);
          const listo = Boolean(p?.imagenes.ninguno);
          const faltan = p ? LOOKS_CARITA.filter((l) => !p.imagenes[l]).length : LOOKS_CARITA.length;
          const sinIntentos = (p?.intentos ?? 0) >= MAX_INTENTOS_POR_FOTO;
          return (
            <li key={slot} className="rounded-2xl border border-border p-3">
              {abierto === slot ? (
                <CrearConFoto
                  slot={slot}
                  existente={p}
                  onListo={onCambio}
                  onCerrar={() => setAbierto(null)}
                />
              ) : (
                <div className="flex items-center gap-3">
                  <div className="grid size-16 shrink-0 place-items-center overflow-hidden rounded-xl bg-mist/60">
                    {listo ? (
                      <img src={p!.imagenes.ninguno} alt="" className="size-full object-contain" />
                    ) : (
                      <Plus className="size-6 text-muted-foreground" aria-hidden />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-foreground">{p?.nombre || `Personaje ${slot + 1}`}</p>
                    <p className="text-xs text-muted-foreground">
                      {!listo ? "Sin crear todavía" : faltan > 0 ? `Faltan ${faltan} looks` : "Listo, con sus 7 looks"}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    {!listo && (
                      <Button size="sm" className="h-10" disabled={sinIntentos} onClick={() => setAbierto(slot)}>
                        Crear
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

      {/* Pack familia: se ofrece cuando ya tiene su primer personaje */}
      {fotos < 1 + PACK_FAMILIA.fotos && creados > 0 && (
        <div className="mt-5 rounded-2xl bg-mist/60 p-4">
          <p className="flex items-center gap-2 font-semibold text-foreground">
            <Users className="size-4 text-brand" aria-hidden />
            ¿Y sus hermanos, mamá o papá?
          </p>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{PACK_FAMILIA.descripcion}</p>
          {pack ? (
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <a
                href={pack}
                className="inline-flex h-12 items-center justify-center rounded-md bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-cta transition-transform active:scale-[0.97]"
              >
                Sumar {PACK_FAMILIA.fotos} fotos por {PACK_FAMILIA.precio}
              </a>
              <button type="button" onClick={onRecargarCompras} className="min-h-11 text-sm font-semibold text-brand">
                Ya pagué, actualizar
              </button>
            </div>
          ) : (
            <p className="mt-2 text-sm font-semibold text-muted-foreground">Muy pronto</p>
          )}
        </div>
      )}
    </div>
  );
}
