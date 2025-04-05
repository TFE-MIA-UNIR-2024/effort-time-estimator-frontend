
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Element } from "./types";
import { useAIEstimation } from "./useAIEstimation";

export function useAIEstimationHandler(
  elementos: Element[],
  setElementos: (elementos: Element[]) => void,
  elementosFields: { id: number; label: string }[],
  requirement: any
) {
  const [aiLoading, setAILoading] = useState(false);
  const { toast } = useToast();
  const { generateWeights } = useAIEstimation();

  const handleGenerateAIEstimation = async (selectedIds?: number[]) => {
    if (!requirement) {
      toast({
        title: "Error",
        description: "No se pudo obtener la información del requerimiento",
        variant: "destructive",
      });
      return;
    }

    setAILoading(true);
    try {
      console.log("Generating AI estimation for requirement:", requirement.nombrerequerimiento);
      console.log("Using selected element IDs:", selectedIds || "all elements");
      
      const weights = await generateWeights(
        requirement.nombrerequerimiento,
        requirement.cuerpo || "",
        selectedIds
      );

      console.log("AI generated weights:", weights);

      // Ensure all element fields from 1 to 13 are included in the new elementos
      const newElementos = elementosFields.map((field) => {
        const existingElement = elementos.find(e => 
          e.elemento_id === field.id || e.tipo_elemento_afectado_id === field.id
        );
        const value = weights[field.label] || 0;

        return existingElement 
          ? { ...existingElement, cantidad_estimada: value }
          : {
              elemento_id: field.id,
              nombre: field.label,
              cantidad_estimada: value,
              cantidad_real: null,
              tipo_elemento_afectado_id: field.id
            };
      });

      console.log("New elementos after AI generation:", newElementos);
      console.log("Total AI-generated elementos:", newElementos.length);
      
      setElementos(newElementos);
      
      toast({
        title: "Éxito",
        description: "Esfuerzos estimados con IA",
      });
    } catch (error: any) {
      console.error("Error generating AI estimation:", error);
      
      toast({
        title: "Error",
        description: "No se pudo generar la estimación con IA. " + (error?.message || "Intentando con predicciones por defecto."),
        variant: "destructive",
      });
    } finally {
      setAILoading(false);
    }
  };

  return {
    aiLoading,
    handleGenerateAIEstimation
  };
}
