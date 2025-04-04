
import { useState, useEffect } from "react";
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
  validateForm: () => boolean;
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
  const { 
    loading, 
    parametros: fetchedParametros, 
    elementos: fetchedElementos, 
    tiposParametros, 
    dataExists, 
    requirement 
  } = useFetchFormData(requerimientoId, isOpen);
  
  const { parametros, handleParametroChange, setParametros } = useParametersState();
  const { elementos, handleElementChange, setElementos } = useElementsState();
  const { aiLoading, handleGenerateAIEstimation: generateAIEstimation } = 
    useAIEstimationHandler(elementos, setElementos, elementosFields, requirement);

  // Reset and re-fetch data when requirement ID changes or form opens
  useEffect(() => {
    if (isOpen) {
      // Reset states when opening for a different requirement
      setParametros({});
      setElementos([]);
    }
  }, [requerimientoId, isOpen, setParametros, setElementos]);

  // Sync state from fetched data using useEffect
  useEffect(() => {
    if (!loading && fetchedParametros && fetchedElementos) {
      console.log(`For requirement ID ${requerimientoId}:`);
      console.log("Parameters fetched:", Object.keys(fetchedParametros).length);
      console.log("Elements fetched:", fetchedElementos.length);
      console.log("Parameter types fetched:", tiposParametros.length);
      
      // Update parameters state with fetched data
      setParametros(fetchedParametros);
      
      // Update elements state with fetched data
      if (fetchedElementos.length > 0) {
        console.log("Setting elementos:", fetchedElementos);
        setElementos(fetchedElementos);
      } else {
        // Reset elementos if none were fetched
        setElementos([]);
      }
    }
  }, [loading, fetchedParametros, fetchedElementos, tiposParametros, setParametros, setElementos, requerimientoId]);

  // Validate that all required parameters have values
  const validateForm = () => {
    // Check if all parameter types have values
    const missingParameters = tiposParametros.filter(
      (tipo) => !parametros[tipo.tipo_parametro_estimacionid]
    );

    if (missingParameters.length > 0) {
      const missingNames = missingParameters.map(p => p.nombre).join(", ");
      toast({
        title: "Validación",
        description: `Por favor seleccione valores para: ${missingNames}`,
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    // Validate form before saving
    if (!validateForm()) {
      return false;
    }

    try {
      console.log(`Saving form data for requirement ID ${requerimientoId}`);
      console.log("Parameters:", parametros);
      console.log("Elements:", elementos);
      
      const success = await saveFormDataFn({
        requerimientoId,
        parametros,
        elementos,
        dataExists,
        elementosFields
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
    aiLoading,
    validateForm
  };
}
