
export interface TitleItem {
  title: string;
}

export interface DetailItem {
  tablas: number;
  triggersSP: number;
  interfacesAplicativos: number;
  formularios: number;
  subrutinasComplejas: number;
  interfacesBD: number;
  reportes: number;
  componentes: number;
  javascript: number;
  componentesConfigPruebas: number;
  despliegueAppMovil: number;
  qa: number;
  pf: number;
}

export interface WeightFormData {
  "Tablas": number;
  "Triggers/SP": number;
  "Interfaces c/aplicativos": number;
  "Formularios": number;
  "Subrutinas complejas": number;
  "Interfaces con BD": number;
  "Reportes": number;
  "Componentes": number;
  "Javascript": number;
  "Componentes Config. y Pruebas": number;
  "Despliegue app movil": number;
  "QA": number;
  "PF": number;
}

// Add element type for consistency
export interface Element {
  elemento_id: number;
  nombre: string;
  cantidad_estimada: number;
  cantidad_real: number | null;
  tipo_elemento_afectado_id: number;
  punto_funcionid?: number;
}
