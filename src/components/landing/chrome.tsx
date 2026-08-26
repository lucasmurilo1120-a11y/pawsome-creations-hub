import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";
import { Cta } from "./primitives";
import {
  CTA_TEXT_SHORT,
  PROMO_ACTIVE,
  PROMO_END_AT,
  REALTIME_PURCHASES_ENABLED,
  REGULAR_PRICE,
  getCheckoutUrl,
  track,
} from "@/lib/site-config";

/** Header mínimo: sin menú, sin rutas de escape. */
export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3 md:px-8">
        <a href="#hero" className="font-display text-lg font-semibold tracking-tight">
          Pastelería Canina
        </a>
        <div className="hidden items-center gap-5 md:flex">
          <span className="text-sm text-muted-foreground">{REGULAR_PRICE} · Pago único</span>
          <Cta
            asChild
            size="sm"
            onClick={() => track("checkout_clicked", { location: "header" })}
          >
            <a href={getCheckoutUrl()}>{CTA_TEXT_SHORT}</a>
          </Cta>
        </div>
      </div>
    </header>
  );
}

/** Línea de progreso de lectura, muy fina y discreta. */
export function ReadingProgress() {
  const [pct, setPct] = useState(0);

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const h = document.documentElement.scrollHeight - window.innerHeight;
        setPct(h > 0 ? Math.min(100, (window.scrollY / h) * 100) : 0);
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div className="fixed inset-x-0 top-0 z-50 h-[2px] bg-transparent">
      <div
        className="h-full bg-terracotta transition-[width] duration-150 ease-out"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

/** Profundidad de scroll para analytics (25/50/75/90). */
export function ScrollDepth() {
  useEffect(() => {
    const marks = [25, 50, 75, 90] as const;
    const fired = new Set<number>();
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const h = document.documentElement.scrollHeight - window.innerHeight;
        const pct = h > 0 ? (window.scrollY / h) * 100 : 0;
        for (const m of marks) {
          if (pct >= m && !fired.has(m)) {
            fired.add(m);
            track(`scroll_${m}`);
          }
        }
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);
  return null;
}

/** Barra inferior compacta en mobile, oculta sobre el Hero y sobre la oferta. */
export function StickyCta() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const hero = document.getElementById("hero");
    const oferta = document.getElementById("oferta");
    const finalCta = document.getElementById("final");
    let heroOut = false;
    let blocked = false;

    const sync = () => setShow(heroOut && !blocked);

    const heroObs = new IntersectionObserver(
      (e) => {
        heroOut = !e[0]?.isIntersecting;
        sync();
      },
      { threshold: 0 },
    );
    const blockObs = new IntersectionObserver(
      (entries) => {
        blocked = entries.some((e) => e.isIntersecting);
        sync();
      },
      { threshold: 0.12 },
    );
    if (hero) heroObs.observe(hero);
    if (oferta) blockObs.observe(oferta);
    if (finalCta) blockObs.observe(finalCta);
    return () => {
      heroObs.disconnect();
      blockObs.disconnect();
    };
  }, []);

  return (
    <div
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 backdrop-blur-md transition-transform duration-300 ease-out md:hidden",
        show ? "translate-y-0" : "translate-y-full",
      )}
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex items-center justify-between gap-3 px-4 py-2.5">
        <p className="text-[0.95rem] leading-tight font-semibold">
          {REGULAR_PRICE}
          <span className="block text-[0.68rem] font-medium text-muted-foreground">
            Pago único
          </span>
        </p>
        <Cta
          asChild
          size="sm"
          onClick={() => {
            track("sticky_cta_clicked");
            track("checkout_clicked", { location: "sticky_mobile" });
          }}
        >
          <a href={getCheckoutUrl()}>{CTA_TEXT_SHORT}</a>
        </Cta>
      </div>
    </div>
  );
}

const TRUE_MESSAGES = [
  "✓ Pago único",
  "✓ 100 recetas completas",
  "✓ Ajustador de cantidades",
  "✓ Desde tu celular",
];

/**
 * Microtoasts con afirmaciones verdaderas del producto.
 * Frecuencia limitada, máximo 3 por sesión, se pueden cerrar.
 * Nunca notificaciones de compradores sin datos reales.
 */
export function TrueToasts() {
  const [index, setIndex] = useState(-1);
  const dismissed = useRef(false);

  useEffect(() => {
    if (REALTIME_PURCHASES_ENABLED) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let shown = 0;
    let hideTimer: ReturnType<typeof setTimeout>;
    let loop: ReturnType<typeof setInterval>;
    const show = () => {
      if (dismissed.current || shown >= 3) {
        clearInterval(loop);
        return;
      }
      setIndex(shown % TRUE_MESSAGES.length);
      shown += 1;
      hideTimer = setTimeout(() => setIndex(-1), 5000);
    };
    const first = setTimeout(show, 25000);
    loop = setInterval(show, 75000);
    return () => {
      clearTimeout(first);
      clearTimeout(hideTimer);
      clearInterval(loop);
    };
  }, []);

  return (
    <div
      aria-live="polite"
      className={cn(
        "pointer-events-none fixed bottom-20 left-4 z-30 transition-all duration-500 ease-out md:bottom-6",
        index >= 0 ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0",
      )}
    >
      {index >= 0 && (
        <div className="surface pointer-events-auto flex items-center gap-2 rounded-full py-2 pr-2 pl-4 text-xs font-medium">
          {TRUE_MESSAGES[index]}
          <button
            aria-label="Cerrar aviso"
            onClick={() => {
              dismissed.current = true;
              setIndex(-1);
            }}
            className="flex size-5 items-center justify-center rounded-full text-muted-foreground hover:bg-muted"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}

/** Banner de promoción: solo si existe promo real configurada. */
export function PromoBanner() {
  const [left, setLeft] = useState<number | null>(null);

  useEffect(() => {
    if (!PROMO_ACTIVE || !PROMO_END_AT) return;
    const end = new Date(PROMO_END_AT).getTime();
    const tick = () => setLeft(Math.max(0, end - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  if (!PROMO_ACTIVE) return null;
  if (PROMO_END_AT && left !== null && left <= 0) return null;

  const fmt = (ms: number) => {
    const s = Math.floor(ms / 1000);
    const d = Math.floor(s / 86400);
    const h = Math.floor((s % 86400) / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return d > 0 ? `${d}d ${h}h ${m}m` : `${h}h ${m}m ${sec}s`;
  };

  return (
    <div className="border-b border-border bg-accent/60 px-4 py-2 text-center text-xs font-medium">
      Precio especial de lanzamiento
      {PROMO_END_AT && left !== null && <span className="ml-2 tabular-nums">{fmt(left)}</span>}
    </div>
  );
}
