import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Element } from "./types";
import { useAIEstimation } from "./useAIEstimation";
import { useFormParameters } from "./useFormParameters";

export function useAIEstimationHandler(
  elementos: Element[],
  setElementos: (elementos: Element[]) => void,
  elementosFields: { id: number; label: string }[],
  requirement: any,
  parametros?: Record<number, string>
) {
  const [aiLoading, setAILoading] = useState(false);
  const { toast } = useToast();
  const { generateWeights } = useAIEstimation();
  const { getParameterIdByNameAndType } = useFormParameters();

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
      
      // Convert parameter values to their IDs
      const parameterIds: number[] = [];
      
      if (parametros) {
        // Extract the selected parameter estimation IDs from the parametros object
        Object.entries(parametros).forEach(([typeId, paramValue]) => {
          if (paramValue) {
            // Find the corresponding parameter ID in the form's state
            const paramId = getParameterIdFromTypeAndValue(Number(typeId), paramValue);
            if (paramId) {
              parameterIds.push(paramId);
            }
          }
        });
      }
      
      console.log("Using parameter IDs:", parameterIds);
      
      const weights = await generateWeights(
        requirement.nombrerequerimiento,
        requirement.cuerpo || "",
        selectedIds,
        parameterIds
      );

      // If we received a proper response with weights
      if (weights && Object.keys(weights).length > 0) {
        console.log("AI generated weights:", weights);

        // Ensure all element fields from 1 to 13 are included in the new elementos
        const newElementos = elementosFields.map((field) => {
          const existingElement = elementos.find(e => 
            e.elemento_id === field.id || e.tipo_elemento_afectado_id === field.id
          );
          
          // If this element ID is in selectedIds (or selectedIds is undefined), use the AI prediction
          // Otherwise, set the value to zero
          const value = selectedIds 
            ? (selectedIds.includes(field.id) ? weights[field.label] || 0 : 0)
            : weights[field.label] || 0;

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
        console.log("Elements set to zero:", elementosFields.filter(field => 
          !selectedIds?.includes(field.id)).map(field => field.label));
        
        setElementos(newElementos);
        
        toast({
          title: "Éxito",
          description: "Esfuerzos estimados con IA",
        });
      } else {
        throw new Error("No se recibieron predicciones válidas del servidor");
      }
    } catch (error: any) {
      console.error("Error generating AI estimation:", error);
      
      // More specific error messages for different error types
      if (error.message && error.message.includes("Failed to fetch")) {
        toast({
          title: "Error de conexión",
          description: "No se pudo conectar al servidor de predicciones. Verifique su conexión a internet o inténtelo más tarde.",
          variant: "destructive",
        });
      } else if (error.message && error.message.includes("CORS")) {
        toast({
          title: "Error de acceso",
          description: "El servidor de predicciones no permite solicitudes desde esta aplicación. Contacte al administrador.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "No se pudo generar la estimación con IA: " + (error?.message || "Error desconocido"),
          variant: "destructive",
        });
      }
      
      // Important: We're not setting default values anymore when there's an error
    } finally {
      setAILoading(false);
    }
  };

  // Helper function to find parameter estimation ID from its type and value
  const getParameterIdFromTypeAndValue = (typeId: number, paramValue: string): number | null => {
    // This would typically involve looking up the parameter ID from some service
    console.log(`Looking up parameter ID for type ${typeId} and value "${paramValue}"`);
    
    // Use the properly imported function instead of require
    const paramId = getParameterIdByNameAndType(paramValue, typeId);
    
    console.log(`Found parameter ID ${paramId} for type ${typeId} and value "${paramValue}"`);
    return paramId;
  };

  return {
    aiLoading,
    handleGenerateAIEstimation
  };
}
