
import { WeightFormData } from "../types";
import { getPredictions } from "./predictionService";

// Selected IDs for prediction based on the image example
const PREDICTION_IDS = [2, 7, 12]; // Triggers/SP, Reportes, QA

export const generateWeights = async (
  title: string,
  body: string
): Promise<WeightFormData> => {
  try {
    const predictionMap = await getPredictions(PREDICTION_IDS);
    
    // Create weights object with default values of 0
    const weights: WeightFormData = {
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
    
    // Update weights with predicted values
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
