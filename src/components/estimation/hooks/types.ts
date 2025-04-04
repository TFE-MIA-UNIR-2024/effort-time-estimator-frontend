
export interface ParametroEstimacion {
  parametro_estimacionid: number;
  nombre: string;
  factor: number | null;
  factor_ia: number | null;
  tipo_parametro_estimacion: {
    nombre: string;
    haselementosafectados: boolean;
  } | null;
}

export interface PuntoFuncion {
  cantidad_estimada: number | null;
  tipo_elemento_afectado_id: number | null;
  tipo_elemento_afectado: {
    nombre: string;
  } | null;
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
}

export interface NeedEstimation extends Need {
  totalPF: number;
  totalEsfuerzo: number;
  requirements: Requirement[];
}
