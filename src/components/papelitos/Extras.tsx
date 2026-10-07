import { Lock, Palette, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CanjearCodigo } from "@/components/papelitos/CanjearCodigo";
import { checkoutConEmail, EXTRAS, type Clave, type Extra } from "@/lib/papelitos-config";

// Tarjetas de los extras. Si la familia ya lo compró, muestra la acción; si no,
// muestra el candado y el botón que abre el pago de ese extra en Hotmart.
export function Extras({
  claves,
  email,
  onRecargar,
  onAbrir,
  personajeCaritaListo,
}: {
  claves: Set<Clave>;
  email: string | null;
  onRecargar: () => void;
  onAbrir: (clave: Extra["clave"]) => void;
  personajeCaritaListo: boolean;
}) {
  return (
    <section className="mt-10" aria-labelledby="extras-titulo">
      <h2 id="extras-titulo" className="font-display text-2xl font-semibold text-foreground">
        Extras para su kit
      </h2>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {EXTRAS.map((extra) => {
          const activo = claves.has(extra.clave);
          const Icono = extra.clave === "carita" ? Sparkles : Palette;
          const link = checkoutConEmail(extra.checkout, email);
          return (
            <article key={extra.clave} className={`rounded-3xl border p-5 ${activo ? "border-brand/30 bg-surface shadow-soft" : "border-border bg-mist/40"}`}>
              <div className="flex items-start justify-between gap-3">
                <p className="flex items-center gap-2 font-display text-xl font-semibold text-foreground">
                  <Icono className="size-5 text-brand" aria-hidden />
                  {extra.titulo}
                </p>
                {!activo && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-surface px-2.5 py-1 text-xs font-semibold text-muted-foreground">
                    <Lock className="size-3.5" aria-hidden />
                    Bloqueado
                  </span>
                )}
              </div>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{extra.descripcion}</p>
              <div className="mt-4">
                {activo ? (
                  <Button size="lg" className="h-12 w-full shadow-cta sm:w-auto" onClick={() => onAbrir(extra.clave)}>
                    {extra.clave === "carita" ? (personajeCaritaListo ? "Ver sus personajes" : "Crear su personaje con una foto") : "Abrir su libro para colorear"}
                  </Button>
                ) : link ? (
                  <div className="flex flex-wrap items-center gap-3">
                    <a
                      href={link}
                      className="inline-flex h-12 items-center justify-center rounded-md bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-cta transition-transform active:scale-[0.97]"
                    >
                      Desbloquear por {extra.precio}
                    </a>
                    <a href="#codigo-canje" className="inline-flex min-h-11 items-center text-sm font-semibold text-brand">
                      Ya pagué: pegar mi código
                    </a>
                  </div>
                ) : (
                  <p className="text-sm font-semibold text-muted-foreground">Muy pronto</p>
                )}
              </div>
            </article>
          );
        })}
      </div>
      <div className="mt-4">
        <CanjearCodigo onListo={onRecargar} />
      </div>
    </section>
  );
}
