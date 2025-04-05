
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
    
    // Create a base weights object with all values set to 0
    const weights: WeightFormData = {
      "Tablas": 0,
      "Triggers/SP": 0,
      "Interfaces c/aplicativos": 0,
      "Formularios": 0,
      "Subrutinas complejas": 0,
      "Interfaces con BD": 0,
      "Reportes": 0,
      "Componentes": 0,
      "Javascript": 0,
      "Componentes Config. y Pruebas": 0,
      "Despliegue app movil": 0,
      "QA": 0,
      "PF": 0
    };
    
    // Update weights with predicted values ONLY for the selected IDs
    Object.entries(predictionMap).forEach(([id, value]) => {
      const numericId = Number(id);
      const label = idToLabel[numericId];
      if (label && (predictionIds.includes(numericId) || !selectedIds)) {
        weights[label] = value;
      }
    });
    
    console.log("Final generated weights:", weights);
    
    // PF is a special case that should always have a value of 5 unless explicitly set otherwise
    if (selectedIds?.includes(13) || !selectedIds) {
      weights["PF"] = predictionMap[13] !== undefined ? predictionMap[13] : 5;
    }
    
    return weights;
  } catch (error) {
    console.error("Error generating weights:", error);
    
    // If there's an error, return default values ONLY for selected IDs, others set to 0
    const defaultWeights: WeightFormData = {
      "Tablas": 0,
      "Triggers/SP": 0,
      "Interfaces c/aplicativos": 0,
      "Formularios": 0,
      "Subrutinas complejas": 0,
      "Interfaces con BD": 0,
      "Reportes": 0,
      "Componentes": 0,
      "Javascript": 0,
      "Componentes Config. y Pruebas": 0,
      "Despliegue app movil": 0,
      "QA": 0,
      "PF": 0
    };
    
    // Set default values only for selected IDs
    if (selectedIds) {
      selectedIds.forEach(id => {
        const label = ALL_ELEMENT_IDS.includes(id) ? 
          Object.entries(idToLabel).find(([key, val]) => Number(key) === id)?.[1] : null;
        
        if (label) {
          defaultWeights[label] = id === 13 ? 5 : DEFAULT_PREDICTION_IDS.includes(id) ? 
            (id === 2 ? 2 : id === 4 ? 3 : id === 7 ? 2 : id === 8 ? 3 : id === 12 ? 4 : 1) : 1;
        }
      });
    } else {
      // If no selectedIds provided, use defaults for common elements
      defaultWeights["Tablas"] = 1;
      defaultWeights["Triggers/SP"] = 2;
      defaultWeights["Interfaces c/aplicativos"] = 1;
      defaultWeights["Formularios"] = 3;
      defaultWeights["Subrutinas complejas"] = 2;
      defaultWeights["Interfaces con BD"] = 1;
      defaultWeights["Reportes"] = 2;
      defaultWeights["Componentes"] = 3;
      defaultWeights["Javascript"] = 2;
      defaultWeights["Componentes Config. y Pruebas"] = 1;
      defaultWeights["QA"] = 4;
      defaultWeights["PF"] = 5;
    }
    
    return defaultWeights;
  }
};

export const useWeightsGenerator = () => {
  return {
    generateWeights
  };
};
