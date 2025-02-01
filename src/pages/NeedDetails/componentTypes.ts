import { Need, Requirement } from "@/types/need";

export interface PuntoFuncion {
  requerimientoid: number;
  tipo_elemento_afectado_id: number;
  cantidad_estimada?: number;
  cantidad_estim?: number;
  tipo_elemento_afectado?: {
    activo: boolean;
  };
}

export interface RequirementWithId extends Requirement {
  requerimientoid: number;
}

export type WeightFormDataRecord = {
  [K in keyof typeof tipoElementoMap]: number;
};

export const tipoElementoMap = {
  Tablas: 1,
  "Triggers/SP": 2,
  "Interfaces c/aplicativos": 3,
  Formularios: 4,
  "Subrutinas complejas": 5,
  "Interfaces con BD": 6,
  Reportes: 7,
  Componentes: 8,
  Javascript: 9,
  "Componentes Config. y Pruebas": 10,
  "Despliegue app movil": 11,
  QA: 12,
  PF: 13,
} as const;
