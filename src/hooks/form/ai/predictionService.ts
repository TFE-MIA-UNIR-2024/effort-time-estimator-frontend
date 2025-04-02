
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

export async function getPredictions(elementIds: number[]): Promise<Record<number, number>> {
  try {
    console.log("Calling prediction endpoint with IDs:", elementIds);
    
    const response = await fetch("http://18.222.38.104:8000/predict", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        tipo_elemento_afectado_ids: elementIds
      }),
    });

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
    throw error;
  }
}
