
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface DescriptionItem {
  titulo: string;
  description: string;
}

export const useRequirementsExtraction = () => {
  const [isExtracting, setIsExtracting] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const getRequirementsTitles = async (prompt: string) => {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${import.meta.env.VITE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini-2024-07-18",
        messages: [
          {
            role: "system",
            content:
              "You are an expert at structured data extraction. You will be given unstructured text from a research paper and should convert it into the given structure. At least 10-20 titles.",
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

    const data = await response.json();
    console.log(data);

    if (!response.ok) {
      throw new Error(data.error?.message || "OpenAI API request failed");
    }

    const parsed = JSON.parse(data.choices[0].message.content);
    return parsed.items;
  };

  const getRequirementDescription = async (
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
  };

  const extractRequirements = async (
    needId: string,
    needBody: string,
    onProgress: (progress: number) => void = setProgress
  ) => {
    try {
      setIsExtracting(true);
      onProgress(0);
      
      const titles = await getRequirementsTitles(needBody);
      onProgress(20);

      const descriptions: DescriptionItem[] = [];
      const totalTitles = titles.length;

      for (let i = 0; i < totalTitles; i++) {
        const item = titles[i];
        const description = await getRequirementDescription(item.title, needBody);
        descriptions.push({
          titulo: item.title,
          description,
        });
        onProgress(20 + Math.round(((i + 1) / totalTitles) * 80));
      }

      const newRequirements = descriptions.map((item, index) => ({
        codigorequerimiento: `REQ-${String(index + 1).padStart(3, "0")}`,
        nombrerequerimiento: item.titulo,
        cuerpo: item.description,
        necesidadid: Number(needId),
        tiporequerimientoid: 1,
        fechacreacion: new Date().toISOString(),
      }));

      const { error } = await supabase
        .from("requerimiento")
        .insert(newRequirements);
        
      if (error) throw error;

      onProgress(100);
      toast({
        title: "Éxito",
        description: `Se han extraído y guardado ${newRequirements.length} requerimientos.`,
      });
      
      return newRequirements;
    } catch (error) {
      console.error("Error extracting requirements:", error);
      toast({
        title: "Error",
        description: "Ha ocurrido un error al extraer los requerimientos",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsExtracting(false);
    }
  };

  return {
    extractRequirements,
    isExtracting,
    progress,
  };
};
