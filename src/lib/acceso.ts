import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Clave } from "@/lib/papelitos-config";

// Quién está usando el app y qué compró. Entra con un enlace que llega al e-mail
// de la compra (sin contraseña). Lo comprado viene de public.compras, que llena el
// aviso automático de Hotmart.

export type Acceso = {
  estado: "cargando" | "sin_sesion" | "listo";
  email: string | null;
  claves: Set<Clave>;
  fotos: number; // personajes con carita comprados (1 por "Con su carita" + 4 por Pack familia)
  recargar: () => Promise<void>;
  salir: () => Promise<void>;
};

export function useAcceso(): Acceso {
  const [estado, setEstado] = useState<Acceso["estado"]>("cargando");
  const [email, setEmail] = useState<string | null>(null);
  const [claves, setClaves] = useState<Set<Clave>>(new Set());
  const [fotos, setFotos] = useState(0);

  const cargarCompras = useCallback(async () => {
    const { data } = await supabase.from("compras").select("clave, fotos").eq("estado", "activo");
    const filas = (data ?? []) as { clave: Clave; fotos: number | null }[];
    const set = new Set<Clave>(filas.map((c) => c.clave));
    if (set.has("premium")) set.add("kit"); // el Premium incluye el kit
    setClaves(set);
    setFotos(filas.filter((c) => c.clave === "carita").reduce((s, c) => s + (c.fotos ?? 0), 0));
  }, []);

  useEffect(() => {
    let vivo = true;
    supabase.auth.getSession().then(async ({ data }) => {
      if (!vivo) return;
      const user = data.session?.user;
      if (!user) {
        setEstado("sin_sesion");
        return;
      }
      setEmail(user.email ?? null);
      await cargarCompras();
      if (vivo) setEstado("listo");
    });
    const { data: sub } = supabase.auth.onAuthStateChange(async (_evento, session) => {
      if (!session?.user) {
        setEmail(null);
        setClaves(new Set());
        setFotos(0);
        setEstado("sin_sesion");
        return;
      }
      setEmail(session.user.email ?? null);
      await cargarCompras();
      setEstado("listo");
    });
    return () => {
      vivo = false;
      sub.subscription.unsubscribe();
    };
  }, [cargarCompras]);

  const salir = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  return { estado, email, claves, fotos, recargar: cargarCompras, salir };
}

export async function enviarEnlace(email: string) {
  return supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: typeof window !== "undefined" ? window.location.origin : undefined },
  });
}

// Personajes con su carita (uno por foto comprada). URLs firmadas, válidas por 1 hora.
export type PersonajeCarita = {
  slot: number;
  nombre: string | null;
  genero: "nino" | "nina";
  intentos: number;
  imagenes: Record<string, string>;
};

export async function cargarPersonajesCarita(): Promise<PersonajeCarita[]> {
  const { data } = await supabase.from("personajes_carita").select("slot, nombre, genero, intentos, looks").order("slot");
  const filas = (data ?? []) as { slot: number; nombre: string | null; genero: "nino" | "nina"; intentos: number; looks: Record<string, string> }[];
  const paths = filas.flatMap((f) => Object.values(f.looks ?? {}));
  const firmadas = paths.length
    ? (await supabase.storage.from("personajes").createSignedUrls(paths, 3600)).data ?? []
    : [];
  const url = new Map<string, string>();
  paths.forEach((p, i) => {
    const u = (firmadas as { signedUrl?: string }[])[i]?.signedUrl;
    if (u) url.set(p, u);
  });
  return filas.map((f) => ({
    slot: f.slot,
    nombre: f.nombre,
    genero: f.genero,
    intentos: f.intentos,
    imagenes: Object.fromEntries(
      Object.entries(f.looks ?? {}).flatMap(([look, p]) => (url.has(p) ? [[look, url.get(p)!]] : [])),
    ),
  }));
}
