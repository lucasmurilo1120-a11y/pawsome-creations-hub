export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      accesos: {
        Row: {
          creado: string
          fotos: number
          id: string
          token_hash: string
        }
        Insert: {
          creado?: string
          fotos?: number
          id?: string
          token_hash: string
        }
        Update: {
          creado?: string
          fotos?: number
          id?: string
          token_hash?: string
        }
        Relationships: []
      }
      codigos: {
        Row: {
          acceso_id: string | null
          codigo: string
          compra_id: number | null
          creado: string
          expira: string
          fotos: number
          id: number
          ip_hash: string | null
          plataforma: string
          usado_en: string | null
        }
        Insert: {
          acceso_id?: string | null
          codigo: string
          compra_id?: number | null
          creado?: string
          expira: string
          fotos: number
          id?: number
          ip_hash?: string | null
          plataforma: string
          usado_en?: string | null
        }
        Update: {
          acceso_id?: string | null
          codigo?: string
          compra_id?: number | null
          creado?: string
          expira?: string
          fotos?: number
          id?: number
          ip_hash?: string | null
          plataforma?: string
          usado_en?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "codigos_acceso_id_fkey"
            columns: ["acceso_id"]
            isOneToOne: false
            referencedRelation: "accesos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "codigos_compra_id_fkey"
            columns: ["compra_id"]
            isOneToOne: false
            referencedRelation: "compras"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "codigos_plataforma_fkey"
            columns: ["plataforma"]
            isOneToOne: false
            referencedRelation: "plataformas"
            referencedColumns: ["id"]
          },
        ]
      }
      compras: {
        Row: {
          actualizado: string
          clave: string
          creado: string
          email: string
          estado: string
          evento: string | null
          hotmart_product_id: string | null
          id: number
          transaccion: string
          unidades: number
        }
        Insert: {
          actualizado?: string
          clave: string
          creado?: string
          email: string
          estado?: string
          evento?: string | null
          hotmart_product_id?: string | null
          id?: number
          transaccion: string
          unidades?: number
        }
        Update: {
          actualizado?: string
          clave?: string
          creado?: string
          email?: string
          estado?: string
          evento?: string | null
          hotmart_product_id?: string | null
          id?: number
          transaccion?: string
          unidades?: number
        }
        Relationships: []
      }
      config: {
        Row: {
          clave: string
          valor: string
        }
        Insert: {
          clave: string
          valor: string
        }
        Update: {
          clave?: string
          valor?: string
        }
        Relationships: []
      }
      intentos: {
        Row: {
          creado: string
          exito: boolean
          id: number
          ip_hash: string
          tipo: string
        }
        Insert: {
          creado?: string
          exito?: boolean
          id?: number
          ip_hash: string
          tipo: string
        }
        Update: {
          creado?: string
          exito?: boolean
          id?: number
          ip_hash?: string
          tipo?: string
        }
        Relationships: []
      }
      personajes_carita: {
        Row: {
          acceso_id: string
          actualizado: string
          genero: string
          intentos: number
          looks: Json
          looks_generados: number
          nombre: string | null
          slot: number
        }
        Insert: {
          acceso_id: string
          actualizado?: string
          genero: string
          intentos?: number
          looks?: Json
          looks_generados?: number
          nombre?: string | null
          slot: number
        }
        Update: {
          acceso_id?: string
          actualizado?: string
          genero?: string
          intentos?: number
          looks?: Json
          looks_generados?: number
          nombre?: string | null
          slot?: number
        }
        Relationships: [
          {
            foreignKeyName: "personajes_carita_acceso_id_fkey"
            columns: ["acceso_id"]
            isOneToOne: false
            referencedRelation: "accesos"
            referencedColumns: ["id"]
          },
        ]
      }
      plataformas: {
        Row: {
          clave_hotmart: string
          fotos: number
          id: string
          minutos_validez: number
          nombre: string
          token_hash: string
          verificar_compra: boolean
        }
        Insert: {
          clave_hotmart: string
          fotos: number
          id: string
          minutos_validez?: number
          nombre: string
          token_hash: string
          verificar_compra?: boolean
        }
        Update: {
          clave_hotmart?: string
          fotos?: number
          id?: string
          minutos_validez?: number
          nombre?: string
          token_hash?: string
          verificar_compra?: boolean
        }
        Relationships: []
      }
      productos_hotmart: {
        Row: {
          clave: string
          hotmart_product_id: string
          unidades: number
        }
        Insert: {
          clave: string
          hotmart_product_id: string
          unidades?: number
        }
        Update: {
          clave?: string
          hotmart_product_id?: string
          unidades?: number
        }
        Relationships: []
      }
      pruebas_ia: {
        Row: {
          creado: string
          id: number
          imagen: string | null
          nota: string | null
        }
        Insert: {
          creado?: string
          id?: number
          imagen?: string | null
          nota?: string | null
        }
        Update: {
          creado?: string
          id?: number
          imagen?: string | null
          nota?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      guardar_look_carita: {
        Args: { p_acceso: string; p_look: string; p_path: string; p_slot: number }
        Returns: undefined
      }
      sumar_fotos: {
        Args: { p_acceso: string; p_n: number }
        Returns: number
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
