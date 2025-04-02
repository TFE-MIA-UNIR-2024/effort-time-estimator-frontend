
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

// Default values to use when API is unavailable
const DEFAULT_PREDICTIONS = {
  2: 2, // Triggers/SP
  7: 3, // Reportes
  12: 4 // QA
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
    
    elementIds.forEach(id => {
      fallbackPredictions[id] = DEFAULT_PREDICTIONS[id as keyof typeof DEFAULT_PREDICTIONS] || 2;
    });
    
    return fallbackPredictions;
  }
}
