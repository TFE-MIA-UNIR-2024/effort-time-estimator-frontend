
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface DescriptionItem {
  titulo: string;
  description: string;
}

export const useRequirementsExtraction = () => {
  const [extracting, setExtracting] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const { toast } = useToast();

  const handleProgress = (value: number) => {
    setProgress(value);
  };

  async function getRequirementsTitles(prompt: string) {
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
            content:
              "You are an expert at structured data extraction. You will be given unstructured text from a research paper and should convert it into the given structure. Extract at least 10-20 titles.",
          },
          {
            role: "user",
            content: prompt,
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

    if (!response.ok) {
      const errorData = await response.json();
      console.error(errorData);
      throw new Error(`Error en la API de OpenAI: ${response.statusText}`);
    }

    const data = await response.json();
    console.log("Titles response:", data);

    // Asegúrate de que la respuesta contenga el contenido esperado
    if (
      !data.choices ||
      !data.choices[0] ||
      !data.choices[0].message ||
      !data.choices[0].message.content
    ) {
      throw new Error("Respuesta inesperada de la API de OpenAI.");
    }

    const parsed = JSON.parse(data.choices[0].message.content);
    return parsed.items;
  }

  async function getRequirementDescription(
    title: string,
    completeDocument: string
  ): Promise<string> {
    const apiKey = import.meta.env.VITE_API_KEY;
    
    // Check if API key is defined
    if (!apiKey) {
      throw new Error("API key not found. Please set the VITE_API_KEY environment variable.");
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

  const extractRequirements = async (
    needId: string,
    needBody: string
  ) => {
    try {
      setExtracting(true);
      setProgress(0);
      
      // Get titles from the document
      const titles = await getRequirementsTitles(needBody);
      setProgress(20);

      // Get descriptions for each title
      const descriptions: DescriptionItem[] = [];
      const totalTitles = titles.length;

      for (let i = 0; i < totalTitles; i++) {
        const item = titles[i];
        const description = await getRequirementDescription(item.title, needBody);
        descriptions.push({
          titulo: item.title,
          description,
        });
        setProgress(20 + Math.round(((i + 1) / totalTitles) * 70));
      }

      // Create new requirements with the extracted data
      const newRequirements = descriptions.map((item, index) => ({
        codigorequerimiento: `REQ-${String(index + 1).padStart(3, "0")}`,
        nombrerequerimiento: item.titulo,
        cuerpo: item.description,
        necesidadid: Number(needId),
        tiporequerimientoid: 1,
        fechacreacion: new Date().toISOString(),
      }));

      // Insert requirements into the database
      setProgress(90);
      const { error } = await supabase
        .from("requerimiento")
        .insert(newRequirements);
      
      if (error) throw error;

      setProgress(100);
      toast({
        title: "Éxito",
        description: `Se han extraído ${newRequirements.length} requerimientos con IA`,
      });
      
      return newRequirements;
    } catch (error: any) {
      console.error("Error extracting requirements:", error);
      
      // Check for specific error messages
      const errorMessage = error?.message || '';
      if (errorMessage.includes("API key not found")) {
        toast({
          title: "Error de configuración",
          description: "No se ha configurado la clave de API de OpenAI. Contacte al administrador del sistema.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "No se pudieron extraer los requerimientos con IA",
          variant: "destructive",
        });
      }
      
      return null;
    } finally {
      setExtracting(false);
    }
  };

  return {
    extractRequirements,
    extracting,
    progress
  };
};
