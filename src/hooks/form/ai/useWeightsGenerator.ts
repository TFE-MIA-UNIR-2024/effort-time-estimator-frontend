
import { DetailItem, WeightFormData } from "../types";
import { getRequirementsDetails } from "./useRequirementsDetails";

export const generateWeights = async (
  title: string,
  body: string
): Promise<WeightFormData> => {
  const details = await getRequirementsDetails([{ title }], body);

  if (!details || details.length === 0) {
    throw new Error("No weights generated");
  }

  const weights = details[0];
  return {
    Tablas: weights.tablas,
    "Triggers/SP": weights.triggersSP,
    "Interfaces c/aplicativos": weights.interfacesAplicativos,
    Formularios: weights.formularios,
    "Subrutinas complejas": weights.subrutinasComplejas,
    "Interfaces con BD": weights.interfacesBD,
    Reportes: weights.reportes,
    Componentes: weights.componentes,
    Javascript: weights.javascript,
    "Componentes Config. y Pruebas": weights.componentesConfigPruebas,
    "Despliegue app movil": weights.despliegueAppMovil,
    QA: weights.qa,
    PF: weights.pf,
  };
};

export const useWeightsGenerator = () => {
  return {
    generateWeights
  };
};
