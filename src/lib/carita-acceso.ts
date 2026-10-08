import { useCallback, useEffect, useState } from "react";
import { estadoCarita, type PersonajeCarita } from "@/lib/carita.functions";

// El acceso a "Con su carita" queda guardado en este celular. También se puede
// abrir en otro dispositivo con el enlace ?acceso=... (lo mostramos en el panel).
const CLAVE = "papelitos_acceso";

export function leerToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const url = new URL(window.location.href);
    const delEnlace = url.searchParams.get("acceso");
    if (delEnlace && /^[a-z0-9]{30,80}$/.test(delEnlace)) {
      localStorage.setItem(CLAVE, delEnlace);
      url.searchParams.delete("acceso");
      window.history.replaceState(null, "", url.toString());
      return delEnlace;
    }
    return localStorage.getItem(CLAVE);
  } catch {
    return null;
  }
}

export function guardarToken(token: string) {
  try {
    localStorage.setItem(CLAVE, token);
  } catch {
    /* sin almacenamiento: queda solo en esta pestaña */
  }
}

export function enlaceDeAcceso(token: string): string {
  if (typeof window === "undefined") return "";
  return `${window.location.origin}/?acceso=${token}`;
}

export type EstadoCarita = {
  token: string | null;
  fotos: number;
  personajes: PersonajeCarita[];
  cargando: boolean;
};

export function useCarita() {
  const [estado, setEstado] = useState<EstadoCarita>({ token: null, fotos: 0, personajes: [], cargando: true });

  const recargar = useCallback(async (tokenNuevo?: string) => {
    const token = tokenNuevo ?? leerToken();
    if (!token) {
      setEstado({ token: null, fotos: 0, personajes: [], cargando: false });
      return;
    }
    try {
      const r = await estadoCarita({ data: { token } });
      setEstado(r.ok ? { token, fotos: r.fotos, personajes: r.personajes, cargando: false } : { token: null, fotos: 0, personajes: [], cargando: false });
    } catch {
      setEstado((e) => ({ ...e, token, cargando: false }));
    }
  }, []);

  useEffect(() => {
    void recargar();
  }, [recargar]);

  const activar = useCallback(
    async (token: string) => {
      guardarToken(token);
      await recargar(token);
    },
    [recargar],
  );

  return { ...estado, recargar: () => recargar(estado.token ?? undefined), activar };
}
