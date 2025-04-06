
import { getPredictions } from "./predictionService";

export const useWeightsGenerator = () => {
  const generateWeights = async (
    requirementTitle: string,
    requirementBody: string,
    selectedElementIds?: number[],
    parameterIds: number[] = []
  ) => {
    try {
      console.log("Generating weights for requirement:", requirementTitle);
      
      // Get element IDs to predict
      const elementIdsToPredict = selectedElementIds || Array.from({ length: 13 }, (_, i) => i + 1);
      
      // Get predictions from API, now with parameter IDs
      const predictions = await getPredictions(elementIdsToPredict, parameterIds);
      
      // Convert predictions to the expected format
      const weights: { [key: string]: number } = {};
      
      // Map of element IDs to labels
      const elementLabels: Record<number, string> = {
        1: "Tablas",
        2: "Triggers/SP",
        3: "Interfaces c/aplicativos",
        4: "Formularios",
        5: "Subrutinas complejas",
        6: "Interfaces con BD",
        7: "Reportes",
        8: "Componentes",
        9: "Javascript",
        10: "Componentes Config. y Pruebas",
        11: "Despliegue app movil",
        12: "QA",
        13: "PF",
      };
      
      // Process the predictions
      Object.entries(predictions).forEach(([id, value]) => {
        const label = elementLabels[Number(id)];
        if (label) {
          weights[label] = value;
        }
      });
      
      console.log("Generated weights:", weights);
      return weights;
    } catch (error) {
      console.error("Error generating weights:", error);
      throw error;
    }
  };

  return {
    generateWeights,
  };
};
