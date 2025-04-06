
export interface Prediction {
  tipo_elemento_afectado_id: number;
  cantidad_estimada_predicha: number;
}

export interface PredictionResponse {
  predicciones: Prediction[];
}

export async function getPredictions(
  requirementTitle: string,
  requirementBody: string,
  selectedElementIds?: number[],
  parameterEstimationIds?: number[]
): Promise<Record<string, number>> {
  try {
    // If there are no selected element IDs, return empty predictions
    if (selectedElementIds && selectedElementIds.length === 0) {
      console.log("No elements selected for prediction");
      return {};
    }

    const endpoint = "http://18.222.38.104:8000/predict";
    
    // Construct request body according to the new API format
    const requestBody = {
      parametro_estimacion_ids: parameterEstimationIds || [],
      tipo_elemento_afectado_ids: selectedElementIds || []
    };

    console.log("Calling prediction endpoint with selected IDs:", selectedElementIds);
    console.log("Parameter estimation IDs being sent:", parameterEstimationIds);
    
    // Adding a timeout to the fetch request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
    
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API error: ${response.status} - ${errorText}`);
    }

    const data: PredictionResponse = await response.json();
    console.log("Received prediction response:", data);

    // Map the element names to their predictions using elementFields
    const elementMap: Record<number, string> = {
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
      13: "PF"
    };

    const weights: Record<string, number> = {};
    
    // Initialize all fields to 0 first
    Object.values(elementMap).forEach(name => {
      weights[name] = 0;
    });
    
    // Fill in the predictions we received
    data.predicciones.forEach(prediction => {
      const elementName = elementMap[prediction.tipo_elemento_afectado_id];
      if (elementName) {
        weights[elementName] = prediction.cantidad_estimada_predicha;
      }
    });

    return weights;
  } catch (error: any) {
    console.error("Error calling prediction API:", error);
    
    // Re-throw the error so the caller can handle it appropriately
    throw error;
  }
}
