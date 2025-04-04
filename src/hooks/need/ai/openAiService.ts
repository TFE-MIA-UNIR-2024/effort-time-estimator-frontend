
/**
 * Service module for handling OpenAI API calls
 */

/**
 * Call OpenAI API to extract requirement titles from a document
 */
export async function extractTitlesFromDocument(document: string) {
  // Check if API key is defined
  const apiKey = "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"
  if (!apiKey) {
    throw new Error("API key not found. Please set the VITE_OPENAI_API_KEY environment variable.");
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
          content:
            "You are an expert at structured data extraction. You will be given unstructured text from a research paper and should convert it into the given structure. Extract at least 10-20 titles.",
        },
        {
          role: "user",
          content: document,
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

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error?.message || "OpenAI API request failed");
  }

  const parsed = JSON.parse(data.choices[0].message.content);
  return parsed.items;
}

/**
 * Call OpenAI API to generate a detailed description for a requirement title
 */
export async function generateDescriptionForTitle(
  title: string,
  completeDocument: string
): Promise<string> {
  // Check if API key is defined
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("API key not found. Please set the VITE_OPENAI_API_KEY environment variable.");
  }
  
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
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: prompt,
        },
      ],
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    throw new Error(`Error en la API de OpenAI: ${response.statusText}`);
  }

  const data = await response.json();

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
