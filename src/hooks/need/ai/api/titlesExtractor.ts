/**
 * Module for extracting requirement titles from document content
 */
import {
  getOpenAIApiKey,
  createOpenAIHeaders,
  handleAPIError,
  validateResponseStructure,
} from "./openAiClient";

export interface TitleItem {
  title: string;
}

/**
 * Call OpenAI API to extract requirement titles from a document
 */
export async function extractTitlesFromDocument(
  document: string
): Promise<TitleItem[]> {
  try {
    console.log("Extracting titles from document...");

    // Get API key and create headers
    const apiKey = getOpenAIApiKey();
    const headers = createOpenAIHeaders(apiKey);

    // Make API request
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers,
      body: JSON.stringify({
        model: "gpt-4o-mini",
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

    // Check if response is not ok
    if (!response.ok) {
      const errorData = await response.json();
      return handleAPIError(response, errorData);
    }

    // Parse response
    const data = await response.json();
    validateResponseStructure(data);

    // Extract and return titles
    const parsed = JSON.parse(data.choices[0].message.content);
    console.log(`Extracted ${parsed.items.length} titles from document`);
    return parsed.items;
  } catch (error) {
    console.error("Error extracting titles:", error);
    throw error;
  }
}
