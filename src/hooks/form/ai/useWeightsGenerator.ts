
import { WeightFormData } from "../types";
import { getPredictions } from "./predictionService";

// All element IDs that should be included in the response - explicitly ensure IDs 1-13
const ALL_ELEMENT_IDS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];

// Default selected IDs for prediction if none are provided
const DEFAULT_PREDICTION_IDS = [2, 4, 7, 8, 12]; // Triggers/SP, Formularios, Reportes, Componentes, QA

export const generateWeights = async (
  title: string,
  body: string,
  selectedIds?: number[]
): Promise<WeightFormData> => {
  try {
    console.log("Generating weights for title:", title);
    
    // Use provided selectedIds or default to a predefined set
    const predictionIds = selectedIds || DEFAULT_PREDICTION_IDS;
    console.log("Using prediction IDs:", predictionIds);
    
    // Get predictions for selected element types
    const predictionMap = await getPredictions(predictionIds);
    console.log("Predictions received:", predictionMap);
    
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
    
    // Create weights object with all required properties initialized to default values
    const weights: WeightFormData = {
      "Tablas": 1,
      "Triggers/SP": 2,
      "Interfaces c/aplicativos": 1,
      "Formularios": 3,
      "Subrutinas complejas": 2,
      "Interfaces con BD": 1,
      "Reportes": 2,
      "Componentes": 3,
      "Javascript": 2,
      "Componentes Config. y Pruebas": 1,
      "Despliegue app movil": 0,
      "QA": 4,
      "PF": 5
    };
    
    // Update weights with predicted values where available
    Object.entries(predictionMap).forEach(([id, value]) => {
      const numericId = Number(id);
      const label = idToLabel[numericId];
      if (label) {
        weights[label] = value;
      }
    });
    
    console.log("Final generated weights:", weights);
    
    // Ensure all 13 elements have values
    ALL_ELEMENT_IDS.forEach(id => {
      const label = idToLabel[id];
      if (label && weights[label] === undefined) {
        weights[label] = id === 13 ? 5 : Math.floor(Math.random() * 5) + 1; // Default values
      }
    });
    
    return weights;
  } catch (error) {
    console.error("Error generating weights:", error);
    
    // If there's an error, return default values for all 13 elements
    const defaultWeights: WeightFormData = {
      "Tablas": 1,
      "Triggers/SP": 2,
      "Interfaces c/aplicativos": 1,
      "Formularios": 3,
      "Subrutinas complejas": 2,
      "Interfaces con BD": 1,
      "Reportes": 2,
      "Componentes": 3,
      "Javascript": 2,
      "Componentes Config. y Pruebas": 1,
      "Despliegue app movil": 0,
      "QA": 4,
      "PF": 5
    };
    
    return defaultWeights;
  }
};

export const useWeightsGenerator = () => {
  return {
    generateWeights
  };
};
