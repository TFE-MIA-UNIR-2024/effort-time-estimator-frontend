export interface ParametroEstimacion {
  tipo_parametro_estimacionid: number;
  nombre: string;
  haselementosafectados: boolean;
  parametro_estimacion: { nombre: string, parametro_estimacionid: number }[]; // Include the related parameters with their names and ids
}
