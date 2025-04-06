import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  extractTitlesFromDocument,
  generateDescriptionForTitle,
} from "./aiService";
import {
  RequirementItem,
  formatRequirementsForDatabase,
} from "./requirementFormatter";

export const useRequirementsExtraction = () => {
  const [extracting, setExtracting] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const { toast } = useToast();

  const extractRequirements = async (needId: string, needBody: string) => {
    try {
      setExtracting(true);
      setProgress(0);

      // Check if API key is defined
      const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
      if (!apiKey) {
        throw new Error(
          "API key not found. Please set the VITE_OPENAI_API_KEY environment variable."
        );
      }

      console.log("Starting requirement extraction process...");

      // Step 1: Extract titles from document
      const titles = await extractTitlesFromDocument(needBody);
      setProgress(20);
      console.log(`Extracted ${titles.length} titles`);

      // Step 2: Generate descriptions for each title
      const descriptions: RequirementItem[] = [];
      const totalTitles = titles.length;

      for (let i = 0; i < totalTitles; i++) {
        const item = titles[i];
        const description = await generateDescriptionForTitle(
          item.title,
          needBody
        );
        descriptions.push({
          titulo: item.title,
          description,
        });
        setProgress(20 + Math.round(((i + 1) / totalTitles) * 70));
        console.log(`Processed title ${i + 1}/${totalTitles}`);
      }

      // Step 3: Format and save requirements
      const newRequirements = formatRequirementsForDatabase(
        descriptions,
        needId
      );

      console.log(
        `Creating ${newRequirements.length} new requirements in database`
      );
      setProgress(90);

      // Insert requirements into the database
      const { error } = await supabase
        .from("requerimiento")
        .insert(newRequirements);

      if (error) throw error;

      setProgress(100);
      console.log("Requirements created successfully");
      toast({
        title: "Éxito",
        description: `Se han extraído ${newRequirements.length} requerimientos con IA`,
      });

      return newRequirements;
    } catch (error: any) {
      console.error("Error extracting requirements:", error);

      // Check for specific error messages
      const errorMessage = error?.message || "";
      if (errorMessage.includes("API key not found")) {
        toast({
          title: "Error de configuración",
          description:
            "No se ha configurado la clave de API de OpenAI. Contacte al administrador del sistema.",
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
    progress,
  };
};
