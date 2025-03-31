
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useSaveFormData } from "./useSaveFormData";
import { useFetchFormData } from "./useFetchFormData";
import { useParametersState } from "./useParametersState";
import { useElementsState } from "./useElementsState";
import { useAIEstimationHandler } from "./useAIEstimationHandler";
import { Element } from "./types";

interface FormData {
  loading: boolean;
  parametros: Record<number, string>;
  elementos: Element[];
  tiposParametros: any[];
  dataExists: boolean;
  handleElementChange: (elementId: number, value: string) => void;
  handleParametroChange: (parametroId: number, value: string) => void;
  handleSave: () => Promise<boolean>;
  handleGenerateAIEstimation: () => Promise<void>;
  aiLoading: boolean;
}

// Define the elementosFields that will be used in the form
const elementosFields = [
  { id: 1, label: "Tablas" },
  { id: 2, label: "Triggers/SP" },
  { id: 3, label: "Interfaces c/aplicativos" },
  { id: 4, label: "Formularios" },
  { id: 5, label: "Subrutinas complejas" },
  { id: 6, label: "Interfaces con BD" },
  { id: 7, label: "Reportes" },
  { id: 8, label: "Componentes" },
  { id: 9, label: "Javascript" },
  { id: 10, label: "Componentes Config. y Pruebas" },
  { id: 11, label: "Despliegue app movil" },
  { id: 12, label: "QA" },
  { id: 13, label: "PF" },
];

export function useFormData(requerimientoId: number, isOpen: boolean): FormData {
  const { toast } = useToast();
  const { handleSave: saveFormDataFn } = useSaveFormData();
  
  // Use the modular hooks
  const { loading, parametros: fetchedParametros, elementos: fetchedElementos, tiposParametros, dataExists, requirement } = 
    useFetchFormData(requerimientoId, isOpen);
  
  const { parametros, handleParametroChange } = useParametersState();
  const { elementos, handleElementChange, setElementos } = useElementsState();
  const { aiLoading, handleGenerateAIEstimation: generateAIEstimation } = 
    useAIEstimationHandler(elementos, setElementos, elementosFields, requirement);

  // Sync state from fetched data
  useState(() => {
    if (!loading) {
      // Update local state with fetched data
      Object.keys(fetchedParametros).forEach(key => {
        handleParametroChange(Number(key), fetchedParametros[Number(key)]);
      });
      
      setElementos(fetchedElementos);
    }
  });

  const handleSave = async () => {
    try {
      const success = await saveFormDataFn({
        requerimientoId,
        parametros,
        elementos,
        dataExists
      });
      
      if (success) {
        toast({
          title: "Éxito",
          description: "Datos guardados correctamente",
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error saving form data:', error);
      toast({
        title: "Error",
        description: "No se pudo guardar los datos",
        variant: "destructive",
      });
      return false;
    }
  };

  // Wrapper for the AI estimation function to ensure it uses the current state
  const handleGenerateAIEstimation = async () => {
    await generateAIEstimation();
  };

  return {
    loading,
    parametros,
    elementos,
    tiposParametros,
    dataExists,
    handleElementChange,
    handleParametroChange,
    handleSave,
    handleGenerateAIEstimation,
    aiLoading
  };
}
