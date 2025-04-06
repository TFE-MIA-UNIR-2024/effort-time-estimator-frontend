
export interface ElementWithQuantity {
  punto_funcionid?: number;
  elemento_id: number;
  nombre: string;
  cantidad_estimada: number;
  cantidad_real: number | null;
  jornada_real: number | null;
  requerimiento?: string;
}
