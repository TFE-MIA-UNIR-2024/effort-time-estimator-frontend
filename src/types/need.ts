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

export interface Requirement {
  requerimientoid: number;
  codigorequerimiento: string;
  nombrerequerimiento: string;
  necesidadid: number;
  tiporequerimientoid: number;
  fechacreacion: string;
  cuerpo: string;
}
