import { useState, type FormEvent, type ReactNode } from "react";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { enviarEnlace } from "@/lib/acceso";
import { CanjearCodigo } from "@/components/papelitos/CanjearCodigo";
import { BRAND, SALES_URL, SUPPORT_EMAIL } from "@/lib/papelitos-config";

function Marco({ children }: { children: ReactNode }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-5 py-10">
      <div className="w-full max-w-md rounded-3xl border border-border bg-surface p-6 shadow-lift sm:p-8">
        <p className="font-display text-lg font-semibold text-foreground">{BRAND}</p>
        {children}
      </div>
    </main>
  );
}

export function Cargando() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background">
      <p className="text-sm text-muted-foreground">Cargando…</p>
    </main>
  );
}

export function EntrarPantalla() {
  const [email, setEmail] = useState("");
  const [estado, setEstado] = useState<"idle" | "enviando" | "enviado">("idle");
  const [error, setError] = useState("");

  async function enviar(e: FormEvent) {
    e.preventDefault();
    const limpio = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(limpio)) {
      setError("Escribe un e-mail válido.");
      return;
    }
    setError("");
    setEstado("enviando");
    const { error: err } = await enviarEnlace(limpio);
    if (err) {
      setError("No pudimos enviar el enlace. Inténtalo de nuevo en un minuto.");
      setEstado("idle");
      return;
    }
    setEstado("enviado");
  }

  if (estado === "enviado") {
    return (
      <Marco>
        <Mail className="mt-6 size-8 text-brand" aria-hidden />
        <h1 className="mt-3 font-display text-2xl font-semibold text-foreground">Revisa tu e-mail</h1>
        <p className="mt-2 leading-relaxed text-muted-foreground">
          Te enviamos un enlace a <b className="text-foreground">{email.trim().toLowerCase()}</b>. Tócalo desde este mismo
          celular o computadora para entrar. Si no aparece en unos minutos, mira en la carpeta de spam o promociones.
        </p>
        <button type="button" onClick={() => setEstado("idle")} className="mt-5 min-h-11 text-sm font-semibold text-brand">
          Usar otro e-mail
        </button>
      </Marco>
    );
  }

  return (
    <Marco>
      <h1 className="mt-6 font-display text-2xl font-semibold text-foreground">Entra al kit de tu hijo</h1>
      <p className="mt-2 leading-relaxed text-muted-foreground">
        Escribe el e-mail que usaste en la compra y te enviamos un enlace para entrar. Sin contraseña.
      </p>
      <form onSubmit={enviar} noValidate className="mt-5 space-y-3">
        <label htmlFor="email-entrar" className="block text-sm font-semibold text-foreground">
          E-mail de la compra
        </label>
        <input
          id="email-entrar"
          type="email"
          inputMode="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@email.com"
          className="h-12 w-full rounded-xl border border-border bg-background px-4 text-base text-foreground outline-none focus:border-brand"
        />
        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}
        <Button type="submit" size="lg" className="h-12 w-full shadow-cta" disabled={estado === "enviando"}>
          {estado === "enviando" ? "Enviando…" : "Enviarme el enlace"}
        </Button>
      </form>
      <p className="mt-5 text-xs leading-relaxed text-muted-foreground">
        ¿Problemas para entrar? Escríbenos a{" "}
        <a className="underline" href={`mailto:${SUPPORT_EMAIL}`}>
          {SUPPORT_EMAIL}
        </a>
        .
      </p>
    </Marco>
  );
}

export function SinCompraPantalla({ email, onSalir, onRecargar }: { email: string | null; onSalir: () => void; onRecargar: () => void }) {
  return (
    <Marco>
      <h1 className="mt-6 font-display text-2xl font-semibold text-foreground">No encontramos tu compra</h1>
      <p className="mt-2 leading-relaxed text-muted-foreground">
        No hay un kit comprado con <b className="text-foreground">{email}</b>. Si acabas de pagar, espera un minuto y
        actualiza. Si compraste con otro e-mail, sal y entra con ese.
      </p>
      <div className="mt-5 flex flex-col gap-2">
        <Button size="lg" className="h-12 w-full" onClick={onRecargar}>
          Ya pagué, actualizar
        </Button>
        <Button size="lg" variant="outline" className="h-12 w-full" onClick={onSalir}>
          Entrar con otro e-mail
        </Button>
        <a href={SALES_URL} className="mt-1 inline-flex min-h-11 items-center justify-center text-sm font-semibold text-brand">
          Todavía no lo compré
        </a>
      </div>
      <div className="mt-6 border-t border-border pt-5">
        <CanjearCodigo onListo={onRecargar} compacto />
      </div>
    </Marco>
  );
}
