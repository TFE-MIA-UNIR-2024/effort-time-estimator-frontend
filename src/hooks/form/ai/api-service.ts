
export async function callOpenAIAPI(prompt: string, model: string = "gpt-4o-mini-2024-07-18"): Promise<any> {
  try {
    // Check if API key is defined
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("API key not found. Please set the VITE_OPENAI_API_KEY environment variable.");
    }
    
    console.log(`Calling OpenAI API with model: ${model}`);
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: "system",
            content: prompt,
          },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "requirements_detailed",
            schema: {
              type: "object",
              properties: {
                items: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      title: { type: "string" },
                      description: { type: "string" },
                      tablas: { type: "integer" },
                      triggersSP: { type: "integer" },
                      interfacesAplicativos: { type: "integer" },
                      formularios: { type: "integer" },
                      subrutinasComplejas: { type: "integer" },
                      interfacesBD: { type: "integer" },
                      reportes: { type: "integer" },
                      componentes: { type: "integer" },
                      javascript: { type: "integer" },
                      componentesConfigPruebas: { type: "integer" },
                      despliegueAppMovil: { type: "integer" },
                      qa: { type: "integer" },
                      pf: { type: "integer" },
                    },
                    required: [
                      "title",
                      "description",
                      "tablas",
                      "triggersSP",
                      "interfacesAplicativos",
                      "formularios",
                      "subrutinasComplejas",
                      "interfacesBD",
                      "reportes",
                      "componentes",
                      "javascript",
                      "componentesConfigPruebas",
                      "despliegueAppMovil",
                      "qa",
                      "pf",
                    ],
                    additionalProperties: false,
                  },
                },
              },
              required: ["items"],
              additionalProperties: false,
            },
            strict: true,
          },
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("OpenAI API Error:", errorData);
      throw new Error(`Error en la API de OpenAI: ${response.statusText}`);
    }

    const data = await response.json();
    console.log("API response received successfully");
    
    // Ensure the response contains the expected content
    if (
      !data.choices ||
      !data.choices[0] ||
      !data.choices[0].message ||
      !data.choices[0].message.content
    ) {
      throw new Error("Respuesta inesperada de la API de OpenAI.");
    }

    return JSON.parse(data.choices[0].message.content);
  } catch (error) {
    console.error("Error calling OpenAI API:", error);
    throw error;
  }
}
