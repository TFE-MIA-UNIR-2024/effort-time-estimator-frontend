export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      compromiso_proyecto: {
        Row: {
          codigomatriz: string | null
          compromiso_proyectoid: number
          fasematriz: string | null
          proyectoid: number | null
        }
        Insert: {
          codigomatriz?: string | null
          compromiso_proyectoid?: number
          fasematriz?: string | null
          proyectoid?: number | null
        }
        Update: {
          codigomatriz?: string | null
          compromiso_proyectoid?: number
          fasematriz?: string | null
          proyectoid?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "compromiso_proyecto_proyectoid_fkey"
            columns: ["proyectoid"]
            isOneToOne: false
            referencedRelation: "proyecto"
            referencedColumns: ["proyectoid"]
          },
        ]
      }
      criterio_evaluacion: {
        Row: {
          codigocriterio: string | null
          criterio_evaluacionid: number
          nombrecriterio: string | null
          pesocriterio: number | null
          puntaje: number | null
          rol_personalid: number | null
          tipocriterio: number | null
          valormaximoindividual: number | null
        }
        Insert: {
          codigocriterio?: string | null
          criterio_evaluacionid?: number
          nombrecriterio?: string | null
          pesocriterio?: number | null
          puntaje?: number | null
          rol_personalid?: number | null
          tipocriterio?: number | null
          valormaximoindividual?: number | null
        }
        Update: {
          codigocriterio?: string | null
          criterio_evaluacionid?: number
          nombrecriterio?: string | null
          pesocriterio?: number | null
          puntaje?: number | null
          rol_personalid?: number | null
          tipocriterio?: number | null
          valormaximoindividual?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "criterio_evaluacion_rol_personalid_fkey"
            columns: ["rol_personalid"]
            isOneToOne: false
            referencedRelation: "rol_personal"
            referencedColumns: ["rol_personalid"]
          },
        ]
      }
      elemento_afectado: {
        Row: {
          elemento_afectadoid: number
          factor: number | null
          factor_ia: number | null
          nombre: string | null
          parametro_estimacionid: number | null
          tipo_elemento_afectadoid: number | null
        }
        Insert: {
          elemento_afectadoid?: number
          factor?: number | null
          factor_ia?: number | null
          nombre?: string | null
          parametro_estimacionid?: number | null
          tipo_elemento_afectadoid?: number | null
        }
        Update: {
          elemento_afectadoid?: number
          factor?: number | null
          factor_ia?: number | null
          nombre?: string | null
          parametro_estimacionid?: number | null
          tipo_elemento_afectadoid?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "elemento_afectado_parametro_estimacionid_fkey"
            columns: ["parametro_estimacionid"]
            isOneToOne: false
            referencedRelation: "parametro_estimacion"
            referencedColumns: ["parametro_estimacionid"]
          },
          {
            foreignKeyName: "elemento_afectado_tipo_elemento_afectadoid_fkey"
            columns: ["tipo_elemento_afectadoid"]
            isOneToOne: false
            referencedRelation: "tipo_elemento_afectado"
            referencedColumns: ["tipo_elemento_afectadoid"]
          },
        ]
      }
      estimacion_detalle: {
        Row: {
          descripcion: string | null
          esfuerzo: number | null
          estimacion_detalleid: number
          estimacion_esfuerzo_construccionid: number | null
        }
        Insert: {
          descripcion?: string | null
          esfuerzo?: number | null
          estimacion_detalleid?: number
          estimacion_esfuerzo_construccionid?: number | null
        }
        Update: {
          descripcion?: string | null
          esfuerzo?: number | null
          estimacion_detalleid?: number
          estimacion_esfuerzo_construccionid?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "estimacion_detalle_estimacion_esfuerzo_construccionid_fkey"
            columns: ["estimacion_esfuerzo_construccionid"]
            isOneToOne: false
            referencedRelation: "estimacion_esfuerzo_construccion"
            referencedColumns: ["estimacion_esfuerzo_construccionid"]
          },
        ]
      }
      estimacion_esfuerzo_construccion: {
        Row: {
          cantidad_objeto_estimado: number | null
          cantidad_objeto_real: number | null
          esfuerzo_adicional: number | null
          esfuerzo_real: number | null
          estimacion_esfuerzo_construccionid: number
          fechacreacion: string | null
          justificacion_esfuerzoadicional: string | null
          objeto_afectado: string | null
          proyectoid: number | null
          punto_funcionid: number | null
        }
        Insert: {
          cantidad_objeto_estimado?: number | null
          cantidad_objeto_real?: number | null
          esfuerzo_adicional?: number | null
          esfuerzo_real?: number | null
          estimacion_esfuerzo_construccionid?: number
          fechacreacion?: string | null
          justificacion_esfuerzoadicional?: string | null
          objeto_afectado?: string | null
          proyectoid?: number | null
          punto_funcionid?: number | null
        }
        Update: {
          cantidad_objeto_estimado?: number | null
          cantidad_objeto_real?: number | null
          esfuerzo_adicional?: number | null
          esfuerzo_real?: number | null
          estimacion_esfuerzo_construccionid?: number
          fechacreacion?: string | null
          justificacion_esfuerzoadicional?: string | null
          objeto_afectado?: string | null
          proyectoid?: number | null
          punto_funcionid?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "estimacion_esfuerzo_construccion_proyectoid_fkey"
            columns: ["proyectoid"]
            isOneToOne: false
            referencedRelation: "proyecto"
            referencedColumns: ["proyectoid"]
          },
          {
            foreignKeyName: "estimacion_esfuerzo_construccion_punto_funcionid_fkey"
            columns: ["punto_funcionid"]
            isOneToOne: false
            referencedRelation: "punto_funcion"
            referencedColumns: ["punto_funcionid"]
          },
        ]
      }
      estimacion_esfuerzo_testing: {
        Row: {
          esfuerzoestimadototal: number | null
          esfuerzorealtesting: number | null
          estimacion_esfuerzo_testingid: number
        }
        Insert: {
          esfuerzoestimadototal?: number | null
          esfuerzorealtesting?: number | null
          estimacion_esfuerzo_testingid?: number
        }
        Update: {
          esfuerzoestimadototal?: number | null
          esfuerzorealtesting?: number | null
          estimacion_esfuerzo_testingid?: number
        }
        Relationships: []
      }
      estimacion_proyecto: {
        Row: {
          codigoestimacion: string | null
          estimacion_proyectoid: number
          faseestimacion: string | null
          fecharequerimiento: string | null
        }
        Insert: {
          codigoestimacion?: string | null
          estimacion_proyectoid?: number
          faseestimacion?: string | null
          fecharequerimiento?: string | null
        }
        Update: {
          codigoestimacion?: string | null
          estimacion_proyectoid?: number
          faseestimacion?: string | null
          fecharequerimiento?: string | null
        }
        Relationships: []
      }
      evaluacion_personal: {
        Row: {
          codigoevaluacion: string | null
          evaluacion_personalid: number
          proyectoid: number | null
          puntajecriterio: number | null
          tipoevaluacion: string | null
        }
        Insert: {
          codigoevaluacion?: string | null
          evaluacion_personalid?: number
          proyectoid?: number | null
          puntajecriterio?: number | null
          tipoevaluacion?: string | null
        }
        Update: {
          codigoevaluacion?: string | null
          evaluacion_personalid?: number
          proyectoid?: number | null
          puntajecriterio?: number | null
          tipoevaluacion?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "evaluacion_personal_proyectoid_fkey"
            columns: ["proyectoid"]
            isOneToOne: false
            referencedRelation: "proyecto"
            referencedColumns: ["proyectoid"]
          },
        ]
      }
      fase_proyecto: {
        Row: {
          codigofase: string | null
          fase_proyectoid: number
          mostrar_en_estimacion: boolean | null
          nombrefase: string | null
        }
        Insert: {
          codigofase?: string | null
          fase_proyectoid?: number
          mostrar_en_estimacion?: boolean | null
          nombrefase?: string | null
        }
        Update: {
          codigofase?: string | null
          fase_proyectoid?: number
          mostrar_en_estimacion?: boolean | null
          nombrefase?: string | null
        }
        Relationships: []
      }
      justificacion_fase: {
        Row: {
          estimacion_proyectoid: number | null
          justificacion_faseid: number
          justificacionfaseestimado: number | null
          justificacionfasereal: number | null
        }
        Insert: {
          estimacion_proyectoid?: number | null
          justificacion_faseid?: number
          justificacionfaseestimado?: number | null
          justificacionfasereal?: number | null
        }
        Update: {
          estimacion_proyectoid?: number | null
          justificacion_faseid?: number
          justificacionfaseestimado?: number | null
          justificacionfasereal?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "justificacion_fase_estimacion_proyectoid_fkey"
            columns: ["estimacion_proyectoid"]
            isOneToOne: false
            referencedRelation: "estimacion_proyecto"
            referencedColumns: ["estimacion_proyectoid"]
          },
        ]
      }
      matriz_trazabilidad: {
        Row: {
          codigomatriz: string | null
          fasematriz: string | null
          matriz_trazabilidadid: number
          proyectoid: number | null
        }
        Insert: {
          codigomatriz?: string | null
          fasematriz?: string | null
          matriz_trazabilidadid?: number
          proyectoid?: number | null
        }
        Update: {
          codigomatriz?: string | null
          fasematriz?: string | null
          matriz_trazabilidadid?: number
          proyectoid?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "matriz_trazabilidad_proyectoid_fkey"
            columns: ["proyectoid"]
            isOneToOne: false
            referencedRelation: "proyecto"
            referencedColumns: ["proyectoid"]
          },
        ]
      }
      necesidad: {
        Row: {
          codigonecesidad: string | null
          cuerpo: string | null
          fechacreacion: string | null
          necesidadid: number
          nombrenecesidad: string | null
          proyectoid: number | null
          url: string | null
        }
        Insert: {
          codigonecesidad?: string | null
          cuerpo?: string | null
          fechacreacion?: string | null
          necesidadid?: number
          nombrenecesidad?: string | null
          proyectoid?: number | null
          url?: string | null
        }
        Update: {
          codigonecesidad?: string | null
          cuerpo?: string | null
          fechacreacion?: string | null
          necesidadid?: number
          nombrenecesidad?: string | null
          proyectoid?: number | null
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "necesidad_proyectoid_fkey"
            columns: ["proyectoid"]
            isOneToOne: false
            referencedRelation: "proyecto"
            referencedColumns: ["proyectoid"]
          },
        ]
      }
      opcionsistema: {
        Row: {
          codigoopcion: string | null
          nombreopcionsistema: string | null
          opcionsistemaid: number
        }
        Insert: {
          codigoopcion?: string | null
          nombreopcionsistema?: string | null
          opcionsistemaid?: number
        }
        Update: {
          codigoopcion?: string | null
          nombreopcionsistema?: string | null
          opcionsistemaid?: number
        }
        Relationships: []
      }
      parametro_estimacion: {
        Row: {
          descripcion: string | null
          factor: number | null
          factor_ia: number | null
          fecha_de_creacion: string | null
          nombre: string | null
          parametro_estimacionid: number
          pesofactor: number | null
          tipo_parametro_estimacionid: number | null
        }
        Insert: {
          descripcion?: string | null
          factor?: number | null
          factor_ia?: number | null
          fecha_de_creacion?: string | null
          nombre?: string | null
          parametro_estimacionid?: number
          pesofactor?: number | null
          tipo_parametro_estimacionid?: number | null
        }
        Update: {
          descripcion?: string | null
          factor?: number | null
          factor_ia?: number | null
          fecha_de_creacion?: string | null
          nombre?: string | null
          parametro_estimacionid?: number
          pesofactor?: number | null
          tipo_parametro_estimacionid?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "parametro_estimacion_tipo_parametro_estimacionid_fkey"
            columns: ["tipo_parametro_estimacionid"]
            isOneToOne: false
            referencedRelation: "tipo_parametro_estimacion"
            referencedColumns: ["tipo_parametro_estimacionid"]
          },
        ]
      }
      parametro_sistema_estimacion_interface: {
        Row: {
          codigoparametrosistema: string | null
          parametro_sistema_estimacion_interfaceid: number
          tipoparametro: string | null
          usuario_sistemaid: number | null
          valorparametro: string | null
        }
        Insert: {
          codigoparametrosistema?: string | null
          parametro_sistema_estimacion_interfaceid?: number
          tipoparametro?: string | null
          usuario_sistemaid?: number | null
          valorparametro?: string | null
        }
        Update: {
          codigoparametrosistema?: string | null
          parametro_sistema_estimacion_interfaceid?: number
          tipoparametro?: string | null
          usuario_sistemaid?: number | null
          valorparametro?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "parametro_sistema_estimacion_interface_usuario_sistemaid_fkey"
            columns: ["usuario_sistemaid"]
            isOneToOne: false
            referencedRelation: "usuario_sistema"
            referencedColumns: ["usuario_sistemaid"]
          },
        ]
      }
      perfil_sistema: {
        Row: {
          codigoperfil: string | null
          nombre: string | null
          opcionesacceso: string | null
          perfil_sistemaid: number
        }
        Insert: {
          codigoperfil?: string | null
          nombre?: string | null
          opcionesacceso?: string | null
          perfil_sistemaid?: number
        }
        Update: {
          codigoperfil?: string | null
          nombre?: string | null
          opcionesacceso?: string | null
          perfil_sistemaid?: number
        }
        Relationships: []
      }
      personal: {
        Row: {
          apellidospersonal: string | null
          codigopersonal: string | null
          nombrespersonal: string | null
          personalid: number
          rol_personalid: number | null
          usuario_sistemaid: number | null
        }
        Insert: {
          apellidospersonal?: string | null
          codigopersonal?: string | null
          nombrespersonal?: string | null
          personalid?: number
          rol_personalid?: number | null
          usuario_sistemaid?: number | null
        }
        Update: {
          apellidospersonal?: string | null
          codigopersonal?: string | null
          nombrespersonal?: string | null
          personalid?: number
          rol_personalid?: number | null
          usuario_sistemaid?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "personal_rol_personalid_fkey"
            columns: ["rol_personalid"]
            isOneToOne: false
            referencedRelation: "rol_personal"
            referencedColumns: ["rol_personalid"]
          },
          {
            foreignKeyName: "personal_usuario_sistemaid_fkey"
            columns: ["usuario_sistemaid"]
            isOneToOne: false
            referencedRelation: "usuario_sistema"
            referencedColumns: ["usuario_sistemaid"]
          },
        ]
      }
      proyecto: {
        Row: {
          fase_proyectoid: number | null
          nombreproyecto: string | null
          proyectoid: number
        }
        Insert: {
          fase_proyectoid?: number | null
          nombreproyecto?: string | null
          proyectoid?: number
        }
        Update: {
          fase_proyectoid?: number | null
          nombreproyecto?: string | null
          proyectoid?: number
        }
        Relationships: [
          {
            foreignKeyName: "proyecto_fase_proyectoid_fkey"
            columns: ["fase_proyectoid"]
            isOneToOne: false
            referencedRelation: "fase_proyecto"
            referencedColumns: ["fase_proyectoid"]
          },
        ]
      }
      punto_funcion: {
        Row: {
          cantidad_estimada: number | null
          cantidad_real: number | null
          estimacion_esfuerzo_testingid: number | null
          estimacion_proyectoid: number | null
          jornada_estimada: number | null
          jornada_real: number | null
          parametro_estimacionid: number | null
          punto_funcionid: number
          requerimientoid: number | null
          tipo_elemento_afectado_id: number | null
        }
        Insert: {
          cantidad_estimada?: number | null
          cantidad_real?: number | null
          estimacion_esfuerzo_testingid?: number | null
          estimacion_proyectoid?: number | null
          jornada_estimada?: number | null
          jornada_real?: number | null
          parametro_estimacionid?: number | null
          punto_funcionid?: number
          requerimientoid?: number | null
          tipo_elemento_afectado_id?: number | null
        }
        Update: {
          cantidad_estimada?: number | null
          cantidad_real?: number | null
          estimacion_esfuerzo_testingid?: number | null
          estimacion_proyectoid?: number | null
          jornada_estimada?: number | null
          jornada_real?: number | null
          parametro_estimacionid?: number | null
          punto_funcionid?: number
          requerimientoid?: number | null
          tipo_elemento_afectado_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "punto_funcion_estimacion_esfuerzo_testingid_fkey"
            columns: ["estimacion_esfuerzo_testingid"]
            isOneToOne: false
            referencedRelation: "estimacion_esfuerzo_testing"
            referencedColumns: ["estimacion_esfuerzo_testingid"]
          },
          {
            foreignKeyName: "punto_funcion_estimacion_proyectoid_fkey"
            columns: ["estimacion_proyectoid"]
            isOneToOne: false
            referencedRelation: "estimacion_proyecto"
            referencedColumns: ["estimacion_proyectoid"]
          },
          {
            foreignKeyName: "punto_funcion_parametro_estimacionid_fkey"
            columns: ["parametro_estimacionid"]
            isOneToOne: false
            referencedRelation: "parametro_estimacion"
            referencedColumns: ["parametro_estimacionid"]
          },
          {
            foreignKeyName: "punto_funcion_requerimientoid_fkey"
            columns: ["requerimientoid"]
            isOneToOne: false
            referencedRelation: "requerimiento"
            referencedColumns: ["requerimientoid"]
          },
          {
            foreignKeyName: "punto_funcion_tipo_elemento_afectado_id_fkey"
            columns: ["tipo_elemento_afectado_id"]
            isOneToOne: false
            referencedRelation: "tipo_elemento_afectado"
            referencedColumns: ["tipo_elemento_afectadoid"]
          },
        ]
      }
      requerimiento: {
        Row: {
          codigorequerimiento: string | null
          cuerpo: string | null
          fechacreacion: string | null
          necesidadid: number | null
          nombrerequerimiento: string | null
          requerimientoid: number
          tiporequerimientoid: number | null
        }
        Insert: {
          codigorequerimiento?: string | null
          cuerpo?: string | null
          fechacreacion?: string | null
          necesidadid?: number | null
          nombrerequerimiento?: string | null
          requerimientoid?: number
          tiporequerimientoid?: number | null
        }
        Update: {
          codigorequerimiento?: string | null
          cuerpo?: string | null
          fechacreacion?: string | null
          necesidadid?: number | null
          nombrerequerimiento?: string | null
          requerimientoid?: number
          tiporequerimientoid?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "requerimiento_necesidadid_fkey"
            columns: ["necesidadid"]
            isOneToOne: false
            referencedRelation: "necesidad"
            referencedColumns: ["necesidadid"]
          },
          {
            foreignKeyName: "requerimiento_tiporequerimientoid_fkey"
            columns: ["tiporequerimientoid"]
            isOneToOne: false
            referencedRelation: "tiporequerimiento"
            referencedColumns: ["tiporequerimientoid"]
          },
        ]
      }
      resultado_evaluacion: {
        Row: {
          criterio_evaluacionid: number | null
          evaluacion_personalid: number | null
          resultado_evaluacionid: number
          resultadoevaluacion: string | null
        }
        Insert: {
          criterio_evaluacionid?: number | null
          evaluacion_personalid?: number | null
          resultado_evaluacionid?: number
          resultadoevaluacion?: string | null
        }
        Update: {
          criterio_evaluacionid?: number | null
          evaluacion_personalid?: number | null
          resultado_evaluacionid?: number
          resultadoevaluacion?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "resultado_evaluacion_criterio_evaluacionid_fkey"
            columns: ["criterio_evaluacionid"]
            isOneToOne: false
            referencedRelation: "criterio_evaluacion"
            referencedColumns: ["criterio_evaluacionid"]
          },
          {
            foreignKeyName: "resultado_evaluacion_evaluacion_personalid_fkey"
            columns: ["evaluacion_personalid"]
            isOneToOne: false
            referencedRelation: "evaluacion_personal"
            referencedColumns: ["evaluacion_personalid"]
          },
        ]
      }
      rol_personal: {
        Row: {
          codigorol: string | null
          nombrerol: string | null
          rol_personalid: number
        }
        Insert: {
          codigorol?: string | null
          nombrerol?: string | null
          rol_personalid?: number
        }
        Update: {
          codigorol?: string | null
          nombrerol?: string | null
          rol_personalid?: number
        }
        Relationships: []
      }
      tareas_testing: {
        Row: {
          descripcion: string | null
          esfuerzo: number | null
          estimacion_esfuerzo_testingid: number | null
          tareas_testingid: number
        }
        Insert: {
          descripcion?: string | null
          esfuerzo?: number | null
          estimacion_esfuerzo_testingid?: number | null
          tareas_testingid?: number
        }
        Update: {
          descripcion?: string | null
          esfuerzo?: number | null
          estimacion_esfuerzo_testingid?: number | null
          tareas_testingid?: number
        }
        Relationships: [
          {
            foreignKeyName: "tareas_testing_estimacion_esfuerzo_testingid_fkey"
            columns: ["estimacion_esfuerzo_testingid"]
            isOneToOne: false
            referencedRelation: "estimacion_esfuerzo_testing"
            referencedColumns: ["estimacion_esfuerzo_testingid"]
          },
        ]
      }
      tipo_elemento_afectado: {
        Row: {
          activo: boolean | null
          fase_proyectoid: number | null
          nombre: string | null
          tipo_elemento_afectadoid: number
        }
        Insert: {
          activo?: boolean | null
          fase_proyectoid?: number | null
          nombre?: string | null
          tipo_elemento_afectadoid?: number
        }
        Update: {
          activo?: boolean | null
          fase_proyectoid?: number | null
          nombre?: string | null
          tipo_elemento_afectadoid?: number
        }
        Relationships: [
          {
            foreignKeyName: "tipo_elemento_afectado_fase_proyectoid_fkey"
            columns: ["fase_proyectoid"]
            isOneToOne: false
            referencedRelation: "fase_proyecto"
            referencedColumns: ["fase_proyectoid"]
          },
        ]
      }
      tipo_parametro_estimacion: {
        Row: {
          fase_proyectoid: number | null
          haselementosafectados: boolean | null
          nombre: string | null
          tipo_parametro_estimacionid: number
        }
        Insert: {
          fase_proyectoid?: number | null
          haselementosafectados?: boolean | null
          nombre?: string | null
          tipo_parametro_estimacionid?: number
        }
        Update: {
          fase_proyectoid?: number | null
          haselementosafectados?: boolean | null
          nombre?: string | null
          tipo_parametro_estimacionid?: number
        }
        Relationships: [
          {
            foreignKeyName: "tipo_parametro_estimacion_fase_proyectoid_fkey"
            columns: ["fase_proyectoid"]
            isOneToOne: false
            referencedRelation: "fase_proyecto"
            referencedColumns: ["fase_proyectoid"]
          },
        ]
      }
      tiporequerimiento: {
        Row: {
          descripcion: string | null
          tiporequerimientoid: number
        }
        Insert: {
          descripcion?: string | null
          tiporequerimientoid?: number
        }
        Update: {
          descripcion?: string | null
          tiporequerimientoid?: number
        }
        Relationships: []
      }
      usuario_sistema: {
        Row: {
          bloqueo: boolean | null
          codigousuario: string | null
          contrasena: string | null
          usuario_sistemaid: number
        }
        Insert: {
          bloqueo?: boolean | null
          codigousuario?: string | null
          contrasena?: string | null
          usuario_sistemaid?: number
        }
        Update: {
          bloqueo?: boolean | null
          codigousuario?: string | null
          contrasena?: string | null
          usuario_sistemaid?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
