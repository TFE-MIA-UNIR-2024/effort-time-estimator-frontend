
/**
 * Module for generating descriptions for requirement titles
 */
import { getOpenAIApiKey, createOpenAIHeaders, handleAPIError, validateResponseStructure } from "./openAiClient";

/**
 * Call OpenAI API to generate a detailed description for a requirement title
 */
export async function generateDescriptionForTitle(
  title: string,
  completeDocument: string
): Promise<string> {
  try {
    console.log(`Generating description for title: "${title}"`);
    
    // Get API key and create headers
    const apiKey = getOpenAIApiKey();
    const headers = createOpenAIHeaders(apiKey);
    
    // Create prompt
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

    // Make API request
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers,
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: prompt,
          },
        ],
        temperature: 0.7,
      }),
    });

    // Check if response is not ok
    if (!response.ok) {
      const errorData = await response.json();
      return handleAPIError(response, errorData);
    }

    // Parse response
    const data = await response.json();
    validateResponseStructure(data);
    
    // Extract and return description
    const description = data.choices[0].message.content.trim();
    return description;
  } catch (error) {
    console.error("Error generating description:", error);
    throw error;
  }
}
