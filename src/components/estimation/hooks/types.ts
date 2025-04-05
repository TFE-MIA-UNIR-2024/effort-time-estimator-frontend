
export interface ParametroEstimacion {
  parametro_estimacionid: number;
  nombre: string;
  factor?: number;
  factor_ia?: number;
  tipo_parametro_estimacion: {
    nombre: string;
    haselementosafectados: boolean;
  };
}

export interface PuntoFuncion {
  cantidad_estimada: number | null;
  tipo_elemento_afectado_id: number | null;
  tipo_elemento_afectado: {
    nombre: string;
  } | null;
  factor_multiplicativo?: number;
}

export interface Need {
  necesidadid: number;
  nombrenecesidad: string;
}

export interface Requirement {
  requerimientoid: number;
  nombrerequerimiento: string;
  pf: number;
  esfuerzoEstimado: number;
  puntosFuncion: PuntoFuncion[];
  factores?: {
    [key: number]: {
      factor_ia: number;
      nombre: string;
    }
  };
}

export interface NeedEstimation extends Need {
  totalPF: number;
  totalEsfuerzo: number;
  requirements: Requirement[];
}
