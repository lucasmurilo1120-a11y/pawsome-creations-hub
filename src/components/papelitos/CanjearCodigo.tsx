import { useState, type FormEvent } from "react";
import { Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { canjearCodigo, type ResultadoCanje } from "@/lib/canje.functions";
import { SUPPORT_EMAIL } from "@/lib/papelitos-config";

// Canjear el código de la compra: es el "código de la transacción" de Hotmart
// (empieza con HP) que llega en el e-mail de compra. Se usa una sola vez.

const MENSAJES: Record<Exclude<ResultadoCanje, { ok: true }>["error"], string> = {
  formato: "Revisa el código: empieza con HP y sigue con números (por ejemplo, HP1234567890).",
  no_existe: "No encontramos ese código. Si acabas de comprar, espera unos minutos y vuelve a intentar.",
  usado: "Este código ya fue usado en otra cuenta.",
  revocado: "Esta compra fue cancelada o reembolsada, así que el código ya no es válido.",
  pide_email: "Este código es de una compra hecha con otro e-mail. Escribe el e-mail que se usó en esa compra.",
  email_no_coincide: "El e-mail no coincide con el de la compra. Revísalo.",
  demasiados: `Hubo demasiados intentos. Prueba de nuevo en una hora o escríbenos a ${SUPPORT_EMAIL}.`,
};

const NOMBRE_CLAVE: Record<string, string> = {
  kit: "el kit",
  premium: "el plan Premium",
  colorear: "el libro para colorear",
  carita: "Con su carita",
};

export function CanjearCodigo({ onListo, compacto = false }: { onListo: () => void; compacto?: boolean }) {
  const [codigo, setCodigo] = useState("");
  const [email, setEmail] = useState("");
  const [pideEmail, setPideEmail] = useState(false);
  const [estado, setEstado] = useState<"idle" | "enviando">("idle");
  const [mensaje, setMensaje] = useState<{ tipo: "ok" | "error"; texto: string } | null>(null);

  async function enviar(e: FormEvent) {
    e.preventDefault();
    setEstado("enviando");
    setMensaje(null);
    const r = await canjearCodigo({ data: { codigo, email: pideEmail ? email : "" } });
    setEstado("idle");
    if (r.ok) {
      const que = NOMBRE_CLAVE[r.clave] ?? "tu compra";
      const extra = r.clave === "carita" ? ` (${r.fotos} ${r.fotos === 1 ? "foto" : "fotos"})` : "";
      setMensaje({ tipo: "ok", texto: `¡Listo! Desbloqueaste ${que}${extra}.` });
      setCodigo("");
      setEmail("");
      setPideEmail(false);
      onListo();
      return;
    }
    if (r.error === "pide_email") setPideEmail(true);
    setMensaje({ tipo: "error", texto: MENSAJES[r.error] });
  }

  return (
    <form onSubmit={enviar} noValidate className={compacto ? "" : "rounded-3xl border border-border bg-surface p-5"}>
      <p className="flex items-center gap-2 font-semibold text-foreground">
        <Ticket className="size-4 text-brand" aria-hidden />
        ¿Tienes un código de compra?
      </p>
      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
        Es el código de la transacción que llega en el e-mail de Hotmart y empieza con HP. También sirve para usar un regalo.
      </p>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <label htmlFor="codigo-canje" className="sr-only">
          Código de compra
        </label>
        <input
          id="codigo-canje"
          value={codigo}
          onChange={(e) => setCodigo(e.target.value)}
          placeholder="HP1234567890"
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          className="h-12 w-full rounded-xl border border-border bg-background px-4 text-base uppercase tracking-wide text-foreground outline-none focus:border-brand sm:max-w-xs"
        />
        {pideEmail && (
          <>
            <label htmlFor="email-canje" className="sr-only">
              E-mail de la compra
            </label>
            <input
              id="email-canje"
              type="email"
              inputMode="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e-mail de la compra"
              className="h-12 w-full rounded-xl border border-border bg-background px-4 text-base text-foreground outline-none focus:border-brand sm:max-w-xs"
            />
          </>
        )}
        <Button type="submit" size="lg" className="h-12" disabled={estado === "enviando" || codigo.trim().length < 4}>
          {estado === "enviando" ? "Revisando…" : "Canjear"}
        </Button>
      </div>
      {mensaje && (
        <p role={mensaje.tipo === "error" ? "alert" : "status"} className={`mt-2 text-sm ${mensaje.tipo === "error" ? "text-destructive" : "font-semibold text-brand-deep"}`}>
          {mensaje.texto}
        </p>
      )}
    </form>
  );
}
