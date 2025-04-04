
interface PredictionRequest {
  tipo_elemento_afectado_ids: number[];
}

interface PredictionItem {
  tipo_elemento_afectado_id: number;
  cantidad_estimada_predicha: number;
}

interface PredictionResponse {
  predicciones: PredictionItem[];
}

// Default values to use when API is unavailable - enhanced with values for all IDs
const DEFAULT_PREDICTIONS = {
  1: 1, // Tablas
  2: 2, // Triggers/SP
  3: 1, // Interfaces c/aplicativos
  4: 3, // Formularios
  5: 2, // Subrutinas complejas
  6: 1, // Interfaces con BD
  7: 3, // Reportes
  8: 2, // Componentes
  9: 2, // Javascript
  10: 1, // Componentes Config. y Pruebas
  11: 0, // Despliegue app movil
  12: 4, // QA
  13: 5  // PF
};

export async function getPredictions(elementIds: number[]): Promise<Record<number, number>> {
  try {
    console.log("Calling prediction endpoint with IDs:", elementIds);
    
    // Set a timeout to handle slow connections
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch("https://remotion-predictor.onrender.com/predict", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        tipo_elemento_afectado_ids: elementIds
      }),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Prediction API Error:", errorText);
      throw new Error(`Error en la API de predicción: ${response.statusText}`);
    }

    const data = await response.json() as PredictionResponse;
    console.log("Prediction response received:", data);
    
    // Convert the array of predictions to a map of id -> predicted value
    const predictionMap: Record<number, number> = {};
    data.predicciones.forEach(prediction => {
      predictionMap[prediction.tipo_elemento_afectado_id] = prediction.cantidad_estimada_predicha;
    });
    
    return predictionMap;
  } catch (error) {
    console.error("Error calling prediction API:", error);
    
    // Return default values when API is not available
    console.log("Using default predictions as fallback");
    const fallbackPredictions: Record<number, number> = {};
    
    // Include all default values for IDs 1-13 instead of just requested IDs
    for (let i = 1; i <= 13; i++) {
      fallbackPredictions[i] = DEFAULT_PREDICTIONS[i as keyof typeof DEFAULT_PREDICTIONS] || 1;
    }
    
    return fallbackPredictions;
  }
}
