import { Need, WeightFormData, Requirement } from "@/types/need";
import { PuntoFuncion } from "./componentTypes";

export interface FormData {
  codigorequerimiento: string;
  nombrerequerimiento: string;
  cuerpo: string;
}

export const emptyWeightForm: WeightFormData = {
  Tablas: 0,
  "Triggers/SP": 0,
  "Interfaces c/aplicativos": 0,
  Formularios: 0,
  "Subrutinas complejas": 0,
  "Interfaces con BD": 0,
  Reportes: 0,
  Componentes: 0,
  Javascript: 0,
  "Componentes Config. y Pruebas": 0,
  "Despliegue app movil": 0,
  QA: 0,
  PF: 0,
};

export interface NeedDetailsState {
  need: Need | null;
  requirements: Requirement[];
  loading: boolean;
  error: string | null;
  showForm: boolean;
  editingRequirement: Requirement | null;
  formData: FormData;
  aiLoading: boolean;
  progress: number;
  weightFormData: WeightFormData;
  selectedRequirement: Requirement | null;
  requirementPuntosFuncion: PuntoFuncion[];
  saveLoading: boolean;
  selectedParameters: Record<number, number>;
}
