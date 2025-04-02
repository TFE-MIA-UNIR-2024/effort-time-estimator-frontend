
import { WeightFormData } from "../types";
import { getPredictions } from "./predictionService";

// All element IDs that should be included in the response
const ALL_ELEMENT_IDS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];

// Selected IDs for prediction based on the image example
const PREDICTION_IDS = [2, 7, 12]; // Triggers/SP, Reportes, QA

export const generateWeights = async (
  title: string,
  body: string
): Promise<WeightFormData> => {
  try {
    const predictionMap = await getPredictions(PREDICTION_IDS);
    
    // Map element IDs to their labels
    const idToLabel: Record<number, string> = {
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
    
    // Create weights object with default values of 0 for all elements
    const weights: WeightFormData = {};
    
    // Initialize all elements with 0
    ALL_ELEMENT_IDS.forEach(id => {
      const label = idToLabel[id];
      if (label) {
        weights[label] = 0;
      }
    });
    
    // Update weights with predicted values where available
    Object.entries(predictionMap).forEach(([id, value]) => {
      const numericId = Number(id);
      const label = idToLabel[numericId];
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

export const useWeightsGenerator = () => {
  return {
    generateWeights
  };
};
