import { useEffect, useRef, useState, type FormEvent } from "react";
import { Check, Ticket, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { canjearCodigo, type ErrorCanje } from "@/lib/carita.functions";
import { leerToken } from "@/lib/carita-acceso";
import { SUPPORT_EMAIL } from "@/lib/papelitos-config";

// Botón "Tengo un código" (arriba a la derecha) con su panel para canjearlo.

const MENSAJES: Record<ErrorCanje, string> = {
  formato: "El código tiene 6 letras y números. Revísalo y vuelve a intentar.",
  incorrecto: "Código incorrecto. Revisa que esté igual al de tu página de códigos.",
  vencido: "Este código ya venció. Vuelve a tu página de códigos: ya tiene uno nuevo.",
  usado: "Este código ya se usó.",
  demasiados: "Hubo demasiados intentos. Prueba de nuevo en una hora.",
  fallo: `Algo salió mal. Inténtalo de nuevo en un momento o escríbenos a ${SUPPORT_EMAIL}.`,
};

export function CodigoBoton({
  token,
  fotos,
  onActivado,
  onIrAFoto,
}: {
  token: string | null;
  fotos: number;
  onActivado: (token: string) => Promise<void> | void;
  onIrAFoto: () => void;
}) {
  const [abierto, setAbierto] = useState(false);
  const [codigo, setCodigo] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [resultado, setResultado] = useState<{ tipo: "ok"; texto: string } | { tipo: "error"; texto: string } | null>(null);
  const caja = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!abierto) return;
    input.current?.focus();
    const cerrar = (e: MouseEvent) => {
      if (caja.current && !caja.current.contains(e.target as Node)) setAbierto(false);
    };
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setAbierto(false);
    document.addEventListener("mousedown", cerrar);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", cerrar);
      document.removeEventListener("keydown", esc);
    };
  }, [abierto]);

  async function canjear(valor: string, tokenActual: string | null = token) {
    if (enviando) return;
    setEnviando(true);
    setResultado(null);
    try {
      const r = await canjearCodigo({ data: { codigo: valor, token: tokenActual } });
      if (r.ok) {
        await onActivado(r.token);
        setCodigo("");
        setResultado({
          tipo: "ok",
          texto:
            r.sumadas > 0
              ? `¡Código correcto! Desbloqueaste ${r.sumadas} ${r.sumadas === 1 ? "personaje" : "personajes"} con su carita.`
              : "Este código ya estaba activado en este celular.",
        });
      } else {
        setResultado({ tipo: "error", texto: MENSAJES[r.error] });
      }
    } catch {
      setResultado({ tipo: "error", texto: MENSAJES.fallo });
    }
    setEnviando(false);
  }

  function enviar(e: FormEvent) {
    e.preventDefault();
    void canjear(codigo);
  }

  // Enlace desde la página de códigos: /?codigo=ABC123 abre el panel y lo canjea solo.
  useEffect(() => {
    try {
      const url = new URL(window.location.href);
      const delEnlace = (url.searchParams.get("codigo") ?? "").toUpperCase().replace(/[^A-Z0-9]/g, "");
      if (!delEnlace) return;
      url.searchParams.delete("codigo");
      window.history.replaceState(null, "", url.toString());
      if (delEnlace.length !== 6) return;
      setCodigo(delEnlace);
      setAbierto(true);
      // El acceso de este celular se lee aquí mismo: al abrir la app todavía no llegó por props.
      void canjear(delEnlace, leerToken());
    } catch {
      /* sin URL: nada que hacer */
    }
  }, []); // solo al abrir la app

  return (
    <div ref={caja} className="relative">
      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        aria-expanded={abierto}
        aria-controls="panel-codigo"
        className="inline-flex min-h-11 items-center gap-2 rounded-full border border-brand/40 bg-surface px-4 text-sm font-semibold text-brand-deep shadow-soft transition-colors hover:bg-mist/60"
      >
        <Ticket className="size-4" aria-hidden />
        Tengo un código
        {fotos > 0 && (
          <span className="grid size-5 place-items-center rounded-full bg-brand text-[11px] font-bold text-primary-foreground" aria-label={`${fotos} desbloqueados`}>
            {fotos}
          </span>
        )}
      </button>

      {abierto && (
        <div
          id="panel-codigo"
          role="dialog"
          aria-label="Canjear código"
          className="fixed inset-x-3 top-16 z-50 rounded-3xl border border-border bg-surface p-5 shadow-lift sm:absolute sm:inset-x-auto sm:top-auto sm:right-0 sm:mt-2 sm:w-[360px]"
        >
          <div className="flex items-start justify-between gap-3">
            <p className="font-display text-lg font-semibold text-foreground">Canjear código</p>
            <button type="button" onClick={() => setAbierto(false)} className="grid size-9 place-items-center rounded-full hover:bg-mist/60" aria-label="Cerrar">
              <X className="size-4" aria-hidden />
            </button>
          </div>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            Copia el código de tu página de códigos (Con su carita o Pack familia) y pégalo aquí.
          </p>
          <form onSubmit={enviar} noValidate className="mt-4 flex gap-2">
            <label htmlFor="codigo-carita" className="sr-only">
              Código
            </label>
            <input
              ref={input}
              id="codigo-carita"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value.toUpperCase())}
              placeholder="Ej.: 7KQ4P2"
              autoComplete="one-time-code"
              autoCapitalize="characters"
              spellCheck={false}
              maxLength={12}
              className="h-12 w-full min-w-0 rounded-xl border border-border bg-background px-4 font-mono text-lg tracking-[0.2em] text-foreground uppercase outline-none focus:border-brand"
            />
            <Button type="submit" size="lg" className="h-12 shrink-0" disabled={enviando || codigo.replace(/[^A-Za-z0-9]/g, "").length < 6}>
              {enviando ? "…" : "Canjear"}
            </Button>
          </form>
          {resultado && (
            <div
              role={resultado.tipo === "error" ? "alert" : "status"}
              className={`mt-3 flex items-start gap-2 rounded-2xl p-3 text-sm leading-relaxed ${
                resultado.tipo === "ok" ? "bg-success-soft font-medium text-success" : "bg-destructive/10 text-destructive"
              }`}
            >
              {resultado.tipo === "ok" ? <Check className="mt-0.5 size-4 shrink-0" aria-hidden /> : <X className="mt-0.5 size-4 shrink-0" aria-hidden />}
              <span>{resultado.texto}</span>
            </div>
          )}
          {(resultado?.tipo === "ok" || fotos > 0) && (
            <Button
              size="lg"
              className="mt-3 h-12 w-full shadow-cta"
              onClick={() => {
                setAbierto(false);
                onIrAFoto();
              }}
            >
              Crear su personaje con una foto
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
