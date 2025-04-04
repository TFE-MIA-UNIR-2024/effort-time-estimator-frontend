
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { extractTitlesFromDocument, generateDescriptionForTitle } from "./openAiService";
import { RequirementItem, formatRequirementsForDatabase } from "./requirementFormatter";

export const useRequirementsExtraction = () => {
  const [isExtracting, setIsExtracting] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const { toast } = useToast();

  const extractRequirements = async (
    needId: string,
    needBody: string,
    onProgress: (progress: number) => void = setProgress
  ) => {
    try {
      setIsExtracting(true);
      onProgress(0);
      
      // Check if API key is defined
      const apiKey = "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";
      if (!apiKey) {
        throw new Error("API key not found. Please set the VITE_OPENAI_API_KEY environment variable.");
      }
      
      console.log("Starting requirement extraction process...");
      
      // Step 1: Extract titles from document
      const titles = await extractTitlesFromDocument(needBody);
      onProgress(20);
      console.log(`Extracted ${titles.length} titles`);

      // Step 2: Generate descriptions for each title
      const descriptions: RequirementItem[] = [];
      const totalTitles = titles.length;

      for (let i = 0; i < totalTitles; i++) {
        const item = titles[i];
        const description = await generateDescriptionForTitle(item.title, needBody);
        descriptions.push({
          titulo: item.title,
          description,
        });
        onProgress(20 + Math.round(((i + 1) / totalTitles) * 70));
        console.log(`Processed title ${i+1}/${totalTitles}`);
      }

      // Step 3: Format and save requirements
      const newRequirements = formatRequirementsForDatabase(descriptions, needId);

      console.log(`Creating ${newRequirements.length} new requirements in database`);
      onProgress(90);
      
      // Insert requirements into the database
      const { error } = await supabase
        .from("requerimiento")
        .insert(newRequirements);
        
      if (error) throw error;

      onProgress(100);
      console.log("Requirements created successfully");
      toast({
        title: "Éxito",
        description: `Se han extraído y guardado ${newRequirements.length} requerimientos.`,
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
          description: "Ha ocurrido un error al extraer los requerimientos",
          variant: "destructive",
        });
      }
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
