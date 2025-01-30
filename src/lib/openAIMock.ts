// enums.ts

export enum Difficulty {
  MuyBaja = "muy baja",
  Baja = "baja",
  Media = "media",
  Alta = "alta",
  MuyAlta = "muy alta",
}

export enum Technology {
  React = "React",
  Supabase = "Supabase",
  NodeJS = "Node.js",
  TypeScript = "TypeScript",
  // Añade más tecnologías según necesites
}

export async function getRequirementsTitles(prompt: string) {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${import.meta.env.VITE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini-2024-07-18", // Verifica que el nombre del modelo sea correcto
      messages: [
        {
          role: "system",
          content:
            "You are an expert at structured data extraction. You will be given unstructured text from a research paper and should convert it into the given structure. At least 10-20 titles.",
        },
        {
          role: "user",
          content: prompt, // Reemplaza 'prompt' con el texto no estructurado
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "titles_with_descriptions",
          schema: {
            type: "object",
            properties: {
              items: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    title: { type: "string" },
                  },
                  required: ["title"],
                  additionalProperties: false, // Añadido para cumplir con el requisito
                },
              },
            },
            required: ["items"],
            additionalProperties: false, // Asegura que no haya propiedades adicionales en el objeto raíz
          },
          strict: true,
        },
      },
    }),
  });

  const data = await response.json();

  console.log(data);

  const parsed = JSON.parse(data.choices[0].message.content);
  if (!response.ok) {
    throw new Error(data.error?.message || "OpenAI API request failed");
  }

  return parsed.items;
}

export interface TitleItem {
  title: string;
}

export interface DetailItem {
  titulo: string;
  description: string;
  tablasListas: number;
  triggersSP: number;
  interfacesCApp: number;
  formulariosVentanas: number;
  workflowsAlertas: number;
  interfacesBD: number;
  reportes: number;
  componentes: number;
  javascript: number;
  componentesConfigPruebas: number;
  despliegueAppMovil: number;
}

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
      "tablasListas": <peso fibonacci>,
      "triggersSP": <peso fibonacci>,
      "interfacesCApp": <peso fibonacci>,
      "formulariosVentanas": <peso fibonacci>,
      "workflowsAlertas": <peso fibonacci>,
      "interfacesBD": <peso fibonacci>,
      "reportes": <peso fibonacci>,
      "componentes": <peso fibonacci>,
      "javascript": <peso fibonacci>,
      "componentesConfigPruebas": <peso fibonacci>,
      "despliegueAppMovil": <peso fibonacci>
    }

    Donde cada uno de los siguientes campos:
      tablasListas,
      triggersSP,
      interfacesCApp,
      formulariosVentanas,
      workflowsAlertas,
      interfacesBD,
      reportes,
      componentes,
      javascript,
      componentesConfigPruebas,
      despliegueAppMovil

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
                    titulo: { type: "string" },
                    description: { type: "string" },
                    tablasListas: { type: "integer" },
                    triggersSP: { type: "integer" },
                    interfacesCApp: { type: "integer" },
                    formulariosVentanas: { type: "integer" },
                    workflowsAlertas: { type: "integer" },
                    interfacesBD: { type: "integer" },
                    reportes: { type: "integer" },
                    componentes: { type: "integer" },
                    javascript: { type: "integer" },
                    componentesConfigPruebas: { type: "integer" },
                    despliegueAppMovil: { type: "integer" },
                  },
                  required: [
                    "titulo",
                    "description",
                    "difficulty",
                    "technologies",
                    "tablasListas",
                    "triggersSP",
                    "interfacesCApp",
                    "formulariosVentanas",
                    "workflowsAlertas",
                    "interfacesBD",
                    "reportes",
                    "componentes",
                    "javascript",
                    "componentesConfigPruebas",
                    "despliegueAppMovil",
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
    throw new Error(`Error en la API de OpenAI: ${response.statusText}`);
  }

  const data = await response.json();

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

export interface DescriptionItem {
  titulo: string;
  description: string;
}

export async function getRequirementDescriptions(
  titles: TitleItem[],
  completeDocument: string
): Promise<DescriptionItem[]> {
  const descriptions: DescriptionItem[] = [];

  for (const [index, item] of titles.entries()) {
    const prompt = `
      Eres un experto en extracción de datos estructurados.
      Se te proporcionará un título y un documento completo.
      Además, debes considerar que este título es uno de al menos 20 títulos extraídos previamente del mismo documento.

      A partir de esto, genera una descripción detallada para el título proporcionado.

      Título (${index + 1}/${titles.length}):
      "${item.title}"

      Documento completo:
      ${completeDocument}

      La descripción debe ser clara, concisa y cubrir todos los aspectos relevantes del título basado en la información del documento.
      Asegúrate de mantener la coherencia con las descripciones de los otros títulos extraídos.
    `;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${import.meta.env.VITE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4", // Asegúrate de que el nombre del modelo sea correcto
        messages: [
          {
            role: "system",
            content: prompt,
          },
        ],
        temperature: 0.7, // Puedes ajustar la temperatura según tus necesidades
      }),
    });

    if (!response.ok) {
      throw new Error(`Error en la API de OpenAI: ${response.statusText}`);
    }

    const data = await response.json();

    // Asegúrate de que la respuesta contenga el contenido esperado
    if (
      !data.choices ||
      !data.choices[0] ||
      !data.choices[0].message ||
      !data.choices[0].message.content
    ) {
      throw new Error("Respuesta inesperada de la API de OpenAI.");
    }

    const description = data.choices[0].message.content.trim();

    descriptions.push({
      titulo: item.title,
      description,
    });
  }

  return descriptions;
}

export async function getRequirementDescription(
  title: string,
  completeDocument: string
): Promise<string> {
  const prompt = `
    Eres un experto en extracción de datos estructurados.
    Se te proporcionará un título y un documento completo.
    Además, debes considerar que este título es uno de al menos 20 títulos extraídos previamente del mismo documento.

    A partir de esto, genera una descripción detallada para el título proporcionado.

    Título:
    "${title}"

    Documento completo:
    ${completeDocument}

    La descripción debe ser clara, concisa y cubrir todos los aspectos relevantes del título basado en la información del documento.
    Asegúrate de mantener la coherencia con las descripciones de los otros títulos extraídos.
  `;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${import.meta.env.VITE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4", // Asegúrate de que el nombre del modelo sea correcto
      messages: [
        {
          role: "system",
          content: prompt,
        },
      ],
      temperature: 0.7, // Puedes ajustar la temperatura según tus necesidades
    }),
  });

  if (!response.ok) {
    throw new Error(`Error en la API de OpenAI: ${response.statusText}`);
  }

  const data = await response.json();

  // Asegúrate de que la respuesta contenga el contenido esperado
  if (
    !data.choices ||
    !data.choices[0] ||
    !data.choices[0].message ||
    !data.choices[0].message.content
  ) {
    throw new Error("Respuesta inesperada de la API de OpenAI.");
  }

  const description = data.choices[0].message.content.trim();

  return description;
}
