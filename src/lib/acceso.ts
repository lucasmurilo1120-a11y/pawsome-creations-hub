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
  recargar: () => Promise<void>;
  salir: () => Promise<void>;
};

export function useAcceso(): Acceso {
  const [estado, setEstado] = useState<Acceso["estado"]>("cargando");
  const [email, setEmail] = useState<string | null>(null);
  const [claves, setClaves] = useState<Set<Clave>>(new Set());

  const cargarCompras = useCallback(async () => {
    const { data } = await supabase.from("compras").select("clave").eq("estado", "activo");
    const set = new Set<Clave>(((data ?? []) as { clave: Clave }[]).map((c) => c.clave));
    if (set.has("premium")) set.add("kit"); // el Premium incluye el kit
    setClaves(set);
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

  return { estado, email, claves, recargar: cargarCompras, salir };
}

export async function enviarEnlace(email: string) {
  return supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: typeof window !== "undefined" ? window.location.origin : undefined },
  });
}

// Imágenes del personaje con su carita (URLs firmadas, válidas por 1 hora).
export type PersonajeCarita = { genero: "nino" | "nina"; imagenes: Record<string, string> };

export async function cargarPersonajeCarita(): Promise<PersonajeCarita | null> {
  const { data } = await supabase.from("personajes_carita").select("genero, looks").maybeSingle();
  const fila = data as { genero: "nino" | "nina"; looks: Record<string, string> } | null;
  if (!fila || !fila.looks || !fila.looks.ninguno) return null;
  const entradas = Object.entries(fila.looks);
  const { data: firmadas } = await supabase.storage.from("personajes").createSignedUrls(
    entradas.map(([, path]) => path),
    3600,
  );
  const imagenes: Record<string, string> = {};
  entradas.forEach(([look], i) => {
    const url = firmadas?.[i]?.signedUrl;
    if (url) imagenes[look] = url;
  });
  return { genero: fila.genero, imagenes };
}
