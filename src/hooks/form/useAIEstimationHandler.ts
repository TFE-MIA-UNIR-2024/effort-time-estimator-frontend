
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

  const handleGenerateAIEstimation = async () => {
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
      const weights = await generateWeights(
        requirement.nombrerequerimiento,
        requirement.cuerpo || ""
      );

      // Update elementos based on weights
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

      setElementos(newElementos);
      
      toast({
        title: "Éxito",
        description: "Esfuerzos estimados con IA",
      });
    } catch (error: any) {
      console.error("Error generating AI estimation:", error);
      
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
          description: "No se pudo generar la estimación con IA",
          variant: "destructive",
        });
      }
    } finally {
      setAILoading(false);
    }
  };

  return {
    aiLoading,
    handleGenerateAIEstimation
  };
}
