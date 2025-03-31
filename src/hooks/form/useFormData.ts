
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useFormParameters } from "./useFormParameters";
import { useFormState } from "./useFormState";
import { useSaveFormData } from "./useSaveFormData";

export const useFormData = (requerimientoId: number, open: boolean) => {
  const { toast } = useToast();
  const { 
    loading: parametersLoading, 
    parametrosDB, 
    elementosDB, 
    fetchParametrosYElementos,
    getTypeForParameter,
    getParameterIdByNameAndType
  } = useFormParameters();
  
  const {
    parametros,
    elementos,
    dataExists,
    setParametros,
    setElementos,
    setDataExists
  } = useFormState();

  const {
    loading: saveLoading,
    handleSave: saveForm
  } = useSaveFormData(requerimientoId, parametros, elementos, parametrosDB, getTypeForParameter, getParameterIdByNameAndType);

  const loading = parametersLoading || saveLoading;

  useEffect(() => {
    if (open) {
      fetchParametrosYElementos();
      fetchExistingData();
    }
  }, [open, requerimientoId]);

  const fetchExistingData = async () => {
    try {
      console.log("Fetching data for requerimiento:", requerimientoId);
      
      const { data, error } = await supabase
        .from('punto_funcion')
        .select('*')
        .eq('requerimientoid', requerimientoId);

      if (error) throw error;

      console.log("Punto funcion data received:", data);

      // Wait for parametrosDB to be populated
      if (parametrosDB.length === 0) {
        await fetchParametrosYElementos();
      }

      console.log("ParametrosDB loaded:", parametrosDB);

      // Create default elements (all zeros)
      const defaultElems: Record<number, number> = {};
      for (let i = 1; i <= 13; i++) {
        defaultElems[i] = 0;
      }

      if (data && data.length > 0) {
        setDataExists(true);
        
        // Initialize with empty values
        const paramValues: Record<number, string> = {};
        const elemValues: Record<number, number> = { ...defaultElems };

        data.forEach(item => {
          if (item.parametro_estimacionid) {
            // For parameters, find the name of the parameter from DB
            const param = parametrosDB.find(p => p.parametro_estimacionid === item.parametro_estimacionid);
            if (param) {
              // Get the type for storage
              const tipoId = param.tipo_parametro_estimacionid;
              // Store by type ID for consistent UI display
              paramValues[tipoId] = param.nombre;
              console.log(`Loaded parameter: ${param.nombre} for type ${tipoId}`);
            }
          }
          if (item.tipo_elemento_afectado_id) {
            // For elements, store the numeric value
            elemValues[item.tipo_elemento_afectado_id] = item.cantidad_estimada !== null ? Number(item.cantidad_estimada) : 0;
          }
        });

        console.log("Processed parameters:", paramValues);
        console.log("Processed elements:", elemValues);

        setParametros(paramValues);
        setElementos(elemValues);
      } else {
        // No data exists, set default values
        setDataExists(false);
        
        // Create default empty parameters
        const paramValues: Record<number, string> = {};
        // Default to empty strings for all parameter types
        for (let i = 1; i <= 6; i++) {
          paramValues[i] = "";
        }
        
        setParametros(paramValues);
        setElementos(defaultElems);
      }
    } catch (error) {
      console.error('Error fetching existing data:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos existentes.",
        variant: "destructive"
      });
      
      // In case of error, still set default values
      const defaultElems: Record<number, number> = {};
      for (let i = 1; i <= 13; i++) {
        defaultElems[i] = 0;
      }
      
      // Create default empty parameters
      const paramValues: Record<number, string> = {};
      // Default to empty strings for all parameter types
      for (let i = 1; i <= 6; i++) {
        paramValues[i] = "";
      }
      
      setParametros(paramValues);
      setElementos(defaultElems);
    }
  };

  const handleElementChange = (id: number, value: string) => {
    setElementos({
      ...elementos,
      [id]: parseInt(value) || 0
    });
  };

  const handleParametroChange = (id: number, value: string) => {
    console.log(`Parameter changed: type=${id}, value=${value}`);
    setParametros({
      ...parametros,
      [id]: value
    });
  };

  const handleSave = async () => {
    console.log("Saving parameters:", parametros);
    const success = await saveForm();
    if (success) {
      setDataExists(true);
      toast({
        title: "Éxito",
        description: "Los parámetros se han guardado correctamente.",
      });
    }
    return success;
  };

  return {
    loading,
    parametros,
    elementos,
    parametrosDB,
    elementosDB,
    dataExists,
    handleElementChange,
    handleParametroChange,
    handleSave
  };
};
