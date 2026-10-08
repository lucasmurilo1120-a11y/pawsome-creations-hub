import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";

// Página de códigos de Papelitos: __NOMBRE__.
// Pide un código a la app de Papelitos (vale 15 minutos y se usa una sola vez)
// y explica qué hacer con él. Cuando el código vence, pide otro sola.

const PLATAFORMA = {
  token: "__TOKEN__",
  titulo: "__TITULO__",
  bajada: "__BAJADA__",
  personajes: __FOTOS__,
};
const APP_URL = "__APP_URL__"; // la app de Papelitos (donde se canjea el código)
const API_URL = `${APP_URL}/api/codigo`;
const SOPORTE = "lucasmurilo1120@gmail.com";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: `${PLATAFORMA.titulo} · Papelitos` },
      { name: "description", content: "Tu código para crear personajes con su carita en la app de Papelitos." },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: `${PLATAFORMA.titulo} · Papelitos` },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600&family=Nunito:wght@400;600;700;800&display=swap" },
    ],
  }),
  component: PaginaCodigo,
});

type Respuesta =
  | { ok: true; codigo: string; expira: string; fotos: number; minutos: number; nombre: string }
  | { ok: false; error: "token" | "pide_email" | "sin_compra" | "agotado" | "ya_entregado" | "limite" | "fallo" };

type Estado =
  | { tipo: "cargando" }
  | { tipo: "codigo"; codigo: string; expira: number; minutos: number }
  | { tipo: "email"; mensaje?: string }
  | { tipo: "error"; mensaje: string; reintentar: boolean };

const MENSAJES: Record<Exclude<Respuesta, { ok: true }>["error"], string> = {
  token: "Esta página no está activa. Escríbenos y lo resolvemos.",
  pide_email: "",
  sin_compra: "No encontramos una compra con ese e-mail. Revisa que sea el mismo que usaste al pagar.",
  agotado: "Ya canjeaste todos los códigos de tu compra. Tus personajes están en la app de Papelitos.",
  ya_entregado:
    "Desde esta conexión ya se canjeó tu código. Tus personajes están en la app de Papelitos, en el celular donde lo canjeaste. Si cambiaste de celular, escríbenos y te ayudamos.",
  limite: "Hubo demasiados pedidos seguidos. Espera unos minutos y vuelve a intentar.",
  fallo: "No pudimos generar tu código ahora. Revisa tu conexión y vuelve a intentar.",
};

const C = {
  papel: "#F7F3EB",
  tinta: "#251C17",
  marca: "#B84A27",
  marcaOscura: "#943417",
  niebla: "#F0E4D4",
  gris: "#6F625A",
  borde: "#E6DCCF",
};

function mmss(ms: number) {
  const s = Math.max(0, Math.round(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

function PaginaCodigo() {
  const [estado, setEstado] = useState<Estado>({ tipo: "cargando" });
  const [ahora, setAhora] = useState(() => Date.now());
  const [copiado, setCopiado] = useState(false);
  const [email, setEmail] = useState("");
  const pidiendo = useRef(false);

  const pedir = useCallback(async (mail?: string) => {
    if (pidiendo.current) return;
    pidiendo.current = true;
    setEstado({ tipo: "cargando" });
    const correo = mail ?? (() => {
      try {
        return localStorage.getItem("papelitos_email") ?? "";
      } catch {
        return "";
      }
    })();
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: PLATAFORMA.token, email: correo || undefined }),
      });
      const r = (await res.json()) as Respuesta;
      if (r.ok) {
        if (correo) {
          try {
            localStorage.setItem("papelitos_email", correo);
          } catch {
            /* sin almacenamiento */
          }
        }
        setEstado({ tipo: "codigo", codigo: r.codigo, expira: new Date(r.expira).getTime(), minutos: r.minutos });
      } else if (r.error === "pide_email") {
        setEstado({ tipo: "email" });
      } else if (r.error === "sin_compra" || r.error === "agotado") {
        setEstado(r.error === "sin_compra" ? { tipo: "email", mensaje: MENSAJES.sin_compra } : { tipo: "error", mensaje: MENSAJES.agotado, reintentar: false });
      } else {
        setEstado({ tipo: "error", mensaje: MENSAJES[r.error], reintentar: r.error !== "ya_entregado" && r.error !== "token" });
      }
    } catch {
      setEstado({ tipo: "error", mensaje: MENSAJES.fallo, reintentar: true });
    }
    pidiendo.current = false;
  }, []);

  useEffect(() => {
    void pedir();
  }, [pedir]);

  // Reloj: cuando el código vence, se pide uno nuevo solo.
  useEffect(() => {
    const t = setInterval(() => setAhora(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  useEffect(() => {
    if (estado.tipo === "codigo" && ahora >= estado.expira) void pedir();
  }, [ahora, estado, pedir]);

  async function copiar(codigo: string) {
    try {
      await navigator.clipboard.writeText(codigo);
    } catch {
      const area = document.createElement("textarea");
      area.value = codigo;
      document.body.appendChild(area);
      area.select();
      document.execCommand("copy");
      area.remove();
    }
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  }

  function enviarEmail(e: FormEvent) {
    e.preventDefault();
    const limpio = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(limpio)) {
      setEstado({ tipo: "email", mensaje: "Escribe un e-mail válido." });
      return;
    }
    void pedir(limpio);
  }

  const restante = estado.tipo === "codigo" ? estado.expira - ahora : 0;
  const total = estado.tipo === "codigo" ? estado.minutos * 60_000 : 1;

  return (
    <main style={{ background: C.papel, color: C.tinta, fontFamily: "Nunito, system-ui, sans-serif" }} className="min-h-screen">
      <div className="mx-auto max-w-xl px-4 pt-6 pb-16">
        <header className="flex items-center justify-between">
          <span style={{ fontFamily: "Fraunces, Georgia, serif" }} className="text-xl font-semibold">
            Papelitos
          </span>
          <span className="rounded-full px-3 py-1 text-xs font-bold" style={{ background: C.niebla, color: C.marcaOscura }}>
            Página de códigos
          </span>
        </header>

        <h1 style={{ fontFamily: "Fraunces, Georgia, serif" }} className="mt-8 text-[1.9rem] leading-tight font-semibold">
          {PLATAFORMA.titulo}
        </h1>
        <p className="mt-2 text-base leading-relaxed" style={{ color: C.gris }}>
          {PLATAFORMA.bajada}
        </p>

        <section aria-live="polite" className="mt-6 rounded-3xl bg-white p-6 text-center shadow-[0_18px_40px_-18px_rgba(60,35,20,0.35)]" style={{ border: `1px solid ${C.borde}` }}>
          {estado.tipo === "cargando" && (
            <p className="py-8 text-base font-semibold" style={{ color: C.gris }}>
              Generando tu código…
            </p>
          )}

          {estado.tipo === "codigo" && (
            <>
              <p className="text-sm font-bold tracking-wide uppercase" style={{ color: C.marca }}>
                Tu código
              </p>
              <p className="mt-2 font-mono text-[2.6rem] leading-none font-bold tracking-[0.18em] sm:text-5xl" aria-label={`Código ${estado.codigo.split("").join(" ")}`}>
                {estado.codigo.slice(0, 3)} {estado.codigo.slice(3)}
              </p>
              <a
                href={`${APP_URL}/?codigo=${estado.codigo}`}
                target="_blank"
                rel="noopener"
                className="mt-5 inline-flex min-h-14 w-full items-center justify-center rounded-full px-6 text-base font-bold text-white transition-transform active:scale-[0.97]"
                style={{ background: C.marca }}
              >
                Usar este código en la app
              </a>
              <button
                type="button"
                onClick={() => copiar(estado.codigo)}
                className="mt-2 inline-flex min-h-12 w-full items-center justify-center rounded-full px-6 text-base font-bold transition-transform active:scale-[0.97]"
                style={{ border: `2px solid ${C.marca}`, color: C.marcaOscura, background: "white" }}
              >
                {copiado ? "¡Copiado!" : "Copiar código"}
              </button>
              <div className="mt-5">
                <div className="h-2 overflow-hidden rounded-full" style={{ background: C.niebla }}>
                  <div className="h-full rounded-full transition-[width] duration-1000 ease-linear" style={{ width: `${Math.max(0, (restante / total) * 100)}%`, background: C.marca }} />
                </div>
                <p className="mt-2 text-sm" style={{ color: C.gris }}>
                  Vence en <b style={{ color: C.tinta }}>{mmss(restante)}</b>. Después, esta página te da uno nuevo sola.
                </p>
              </div>
            </>
          )}

          {estado.tipo === "email" && (
            <form onSubmit={enviarEmail} noValidate className="text-left">
              <p className="text-base font-bold">Escribe el e-mail con el que compraste</p>
              <p className="mt-1 text-sm" style={{ color: C.gris }}>
                Así sabemos cuántos personajes incluye tu compra.
              </p>
              <label htmlFor="email" className="sr-only">
                E-mail de la compra
              </label>
              <input
                id="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                className="mt-3 h-12 w-full rounded-xl px-4 text-base outline-none"
                style={{ border: `1px solid ${C.borde}`, background: C.papel }}
              />
              {estado.mensaje && (
                <p role="alert" className="mt-2 text-sm font-semibold" style={{ color: C.marcaOscura }}>
                  {estado.mensaje}
                </p>
              )}
              <button type="submit" className="mt-3 min-h-12 w-full rounded-full px-6 text-base font-bold text-white" style={{ background: C.marca }}>
                Ver mi código
              </button>
            </form>
          )}

          {estado.tipo === "error" && (
            <div className="py-2">
              <p role="alert" className="text-base leading-relaxed font-semibold">
                {estado.mensaje}
              </p>
              {estado.reintentar && (
                <button type="button" onClick={() => pedir()} className="mt-4 min-h-12 rounded-full px-6 text-base font-bold text-white" style={{ background: C.marca }}>
                  Intentar de nuevo
                </button>
              )}
            </div>
          )}
        </section>

        <section className="mt-8">
          <h2 style={{ fontFamily: "Fraunces, Georgia, serif" }} className="text-2xl font-semibold">
            Cómo usarlo
          </h2>
          <ol className="mt-4 space-y-3">
            {[
              <>Toca <b>Usar este código en la app</b>: se abre la app de Papelitos (la misma de tu kit) y el código se canjea solo. Verás un mensaje verde.</>,
              <>¿No se abrió? Toca <b>Copiar código</b>, abre la app con el botón de abajo y, arriba a la derecha, toca <b>Tengo un código</b>, pégalo y toca <b>Canjear</b>.</>,
              <>Toca <b>Crear su personaje con una foto</b>, elige el estilo (niño o niña) y <b>toma o sube una foto</b> de frente y con buena luz.</>,
              <>En uno o dos minutos aparece su personaje con sus 7 looks. Elígelo en “Elige su personaje” y descarga su kit.</>,
            ].map((paso, i) => (
              <li key={i} className="flex gap-3 rounded-2xl bg-white p-4" style={{ border: `1px solid ${C.borde}` }}>
                <span className="grid size-7 shrink-0 place-items-center rounded-full text-sm font-bold text-white" style={{ background: C.marca }}>
                  {i + 1}
                </span>
                <span className="text-[15px] leading-relaxed">{paso}</span>
              </li>
            ))}
          </ol>
          <a
            href={APP_URL}
            target="_blank"
            rel="noopener"
            className="mt-5 inline-flex min-h-14 w-full items-center justify-center rounded-full px-6 text-base font-bold transition-transform active:scale-[0.97]"
            style={{ border: `2px solid ${C.marca}`, color: C.marcaOscura, background: "white" }}
          >
            Abrir la app de Papelitos
          </a>
        </section>

        <section className="mt-8 space-y-2 text-sm leading-relaxed" style={{ color: C.gris }}>
          <p>
            • Este código desbloquea <b style={{ color: C.tinta }}>{PLATAFORMA.personajes === 1 ? "1 personaje" : `${PLATAFORMA.personajes} personajes`}</b> con su carita. Vale 15 minutos y se usa una sola vez.
          </p>
          <p>• La foto se usa solo para crear el dibujo y no se guarda.</p>
          <p>• Tus personajes quedan en el celular donde canjeaste el código. En la app puedes copiar tu enlace para abrirlos en otro dispositivo.</p>
          <p>
            • ¿Algo no funcionó? Escríbenos a <span className="font-semibold select-all" style={{ color: C.tinta }}>{SOPORTE}</span>.
          </p>
        </section>
      </div>
    </main>
  );
}
