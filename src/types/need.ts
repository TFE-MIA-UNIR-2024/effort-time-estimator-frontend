export interface Need {
  necesidadid: number;
  codigonecesidad: string;
  nombrenecesidad: string;
  proyectoid: number;
  fechacreacion: string;
  cuerpo: string;
  url: string;
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

export interface Requirement {
  requerimientoid: number;
  codigorequerimiento: string;
  nombrerequerimiento: string;
  necesidadid: number;
  tiporequerimientoid: number;
  fechacreacion: string;
  cuerpo: string;
}
