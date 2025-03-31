
import { DetailItem, TitleItem, WeightFormData } from "./types";

export async function getRequirementsDetails(
  titles: TitleItem[],
  completeDocument: string
): Promise<DetailItem[]> {
  const prompt = `
    Eres un experto en extracción de datos estructurados. 
    Se te proporcionará una lista de títulos. 
    Para cada título, genera un objeto con la siguiente estructura:

    {
      "titulo": "Nombre del título",
      "description": "Descripción detallada del título",
      "tablas": <cantidad>,
      "triggersSP": <cantidad>,
      "interfacesAplicativos": <cantidad>,
      "formularios": <cantidad>,
      "subrutinasComplejas": <cantidad>,
      "interfacesBD": <cantidad>,
      "reportes": <cantidad>,
      "componentes": <cantidad>,
      "javascript": <cantidad>,
      "componentesConfigPruebas": <cantidad>,
      "despliegueAppMovil": <cantidad>,
      "qa": <cantidad>,
      "pf": <cantidad>
    }

    Donde cada uno de los siguientes campos:
      tablas,
      triggersSP,
      interfacesAplicativos,
      formularios,
      subrutinasComplejas,
      interfacesBD,
      reportes,
      componentes,
      javascript,
      componentesConfigPruebas,
      despliegueAppMovil,
      qa,
      pf

    Debe ser un **número entero** que represente la cantidad de veces que necesitara desarrollar cada uno
    de esos siguientes tipos de campos. Asigna estos valores de acuerdo con la
    complejidad que consideres para un desarrollador senior.

    Asegúrate de que los campos "difficulty" y "technologies" utilicen 
    solo las opciones proporcionadas.

    Lista de títulos:
    ${titles.map((item, index) => `${index + 1}. ${item.title}`).join("\n")}

    los titulos fueron generados a partir del siguiente document,
    este documento contiene la información completa de las necesidades del cliente:
    ${completeDocument}
  `;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${import.meta.env.VITE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini-2024-07-18", // Asegúrate de que el nombre del modelo sea correcto
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

  const parsed: { items: DetailItem[] } = JSON.parse(
    data.choices[0].message.content
  );

  return parsed.items;
}

export const generateWeights = async (
  title: string,
  body: string
): Promise<WeightFormData> => {
  const details = await getRequirementsDetails([{ title }], body);

  if (!details || details.length === 0) {
    throw new Error("No weights generated");
  }

  const weights = details[0];
  return {
    Tablas: weights.tablas,
    "Triggers/SP": weights.triggersSP,
    "Interfaces c/aplicativos": weights.interfacesAplicativos,
    Formularios: weights.formularios,
    "Subrutinas complejas": weights.subrutinasComplejas,
    "Interfaces con BD": weights.interfacesBD,
    Reportes: weights.reportes,
    Componentes: weights.componentes,
    Javascript: weights.javascript,
    "Componentes Config. y Pruebas": weights.componentesConfigPruebas,
    "Despliegue app movil": weights.despliegueAppMovil,
    QA: weights.qa,
    PF: weights.pf,
  };
};

export const useAIEstimation = () => {
  return { generateWeights };
};
