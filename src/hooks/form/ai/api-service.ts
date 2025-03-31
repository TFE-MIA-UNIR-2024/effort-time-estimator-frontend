
import { DetailItem, TitleItem } from "../types";

export async function callOpenAIAPI(prompt: string): Promise<any> {
  const apiKey = import.meta.env.VITE_API_KEY;
  
  // Check if API key is defined
  if (!apiKey) {
    throw new Error("API key not found. Please set the VITE_API_KEY environment variable.");
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini-2024-07-18",
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
    console.log(errorData);
    throw new Error(`Error en la API de OpenAI: ${response.statusText}`);
  }

  const data = await response.json();
  console.log(data);

  // Asegúrate de que la respuesta contenga el contenido esperado
  if (
    !data.choices ||
    !data.choices[0] ||
    !data.choices[0].message ||
    !data.choices[0].message.content
  ) {
    throw new Error("Respuesta inesperada de la API de OpenAI.");
  }

  return JSON.parse(data.choices[0].message.content);
}
