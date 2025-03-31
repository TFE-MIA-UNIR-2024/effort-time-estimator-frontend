
export interface ElementWithQuantity {
  elemento_id: number;
  nombre: string;
  cantidad_estimada: number;
  cantidad_real: number | null;
  tipo_elemento_afectado_id?: number;
  requerimiento?: string;
}
