export interface EstimationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: number;
}

export interface NeedEstimation {
  necesidadid: number;
  nombrenecesidad: string;
  totalPF: number;
  totalEsfuerzo: number;
  requirements: RequirementEstimation[];
}

export interface RequirementEstimation {
  requerimientoid: number;
  nombrerequerimiento: string;
  pf: number;
  esfuerzoEstimado: number;
  puntosFuncion: PuntoFuncion[];
}

export interface PuntoFuncion {
  cantidad_estimada: number;
  tipo_elemento_afectado_id: number;
  tipo_elemento_afectado: {
    nombre: string;
  };
}

export interface ParametroEstimacion {
  parametro_estimacionid: number;
  nombre: string;
  tipo_parametro_estimacion: {
    nombre: string;
    haselementosafectados?: boolean;
  };
  factor?: number;
  factor_ia?: number;
}
