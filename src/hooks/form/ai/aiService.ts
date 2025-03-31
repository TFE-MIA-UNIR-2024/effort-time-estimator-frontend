
import { callOpenAIAPI } from "./api-service";

interface TitleItem {
  title: string;
}

export async function extractTitlesFromDocument(documentContent: string): Promise<TitleItem[]> {
  try {
    console.log("Extracting titles from document...");
    const prompt = `
      You are an expert at structured data extraction. You will be given unstructured text from a research paper and should convert it into the given structure. Extract at least 10-20 titles.
      
      Document content:
      ${documentContent}
    `;

    const response = await callOpenAIAPI(prompt);
    console.log(`Extracted ${response.items.length} titles from document`);
    return response.items;
  } catch (error) {
    console.error("Error extracting titles:", error);
    throw error;
  }
}

export async function generateDescriptionForTitle(
  title: string,
  completeDocument: string
): Promise<string> {
  try {
    console.log(`Generating description for title: "${title}"`);
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

    const response = await callOpenAIAPI(prompt, "gpt-4o-mini");
    return response.items[0].description || response.items[0].content || "";
  } catch (error) {
    console.error("Error generating description:", error);
    throw error;
  }
}
