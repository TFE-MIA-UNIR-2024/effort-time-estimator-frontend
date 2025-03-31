
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
    getTypeForParameter 
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
  } = useSaveFormData(requerimientoId, parametros, elementos, parametrosDB, getTypeForParameter);

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

      // We need to wait for parametrosDB to be populated
      if (parametrosDB.length === 0) {
        await fetchParametrosYElementos();
      }

      // Map parameter types to their expected values
      // These are the default values for each type of parameter
      const defaultValues: Record<number, string> = {
        1: "Funcional", // Tipo Función
        2: "Nuevo",     // Nuevo/Modificación
        3: "Baja",      // Complejidad
        4: "Interno",   // Tipo de Desarrollo
        5: "Web",       // Arquitectura
        6: "Java",      // Lenguajes
      };

      // Map parameter types to actual parameter IDs from the database
      const tipoToParametroId: Record<number, number> = {};
      const parametroIdToTipo: Record<number, number> = {};
      
      // Find the parameter IDs for each parameter type
      parametrosDB.forEach(param => {
        if (param.tipo_parametro_estimacionid >= 1 && param.tipo_parametro_estimacionid <= 6) {
          tipoToParametroId[param.tipo_parametro_estimacionid] = param.parametro_estimacionid;
          parametroIdToTipo[param.parametro_estimacionid] = param.tipo_parametro_estimacionid;
        }
      });

      console.log("Parameter type to ID mapping:", tipoToParametroId);
      console.log("Parameter ID to type mapping:", parametroIdToTipo);

      // Set default values for elements (all zeros)
      const defaultElems: Record<number, number> = {};
      for (let i = 1; i <= 13; i++) {
        defaultElems[i] = 0;
      }

      if (data && data.length > 0) {
        setDataExists(true);
        
        // Initialize with default values first
        const paramValues: Record<number, string> = {};
        const elemValues: Record<number, number> = { ...defaultElems };

        // For each of the 6 parameter types, set a default value
        Object.keys(tipoToParametroId).forEach(tipoKey => {
          const tipo = parseInt(tipoKey);
          const paramId = tipoToParametroId[tipo];
          paramValues[paramId] = defaultValues[tipo] || "";
        });

        data.forEach(item => {
          if (item.parametro_estimacionid) {
            // For parameters, find the name of the parameter from DB
            const param = parametrosDB.find(p => p.parametro_estimacionid === item.parametro_estimacionid);
            if (param) {
              // Store by parameter type ID for consistent UI display
              const tipoId = param.tipo_parametro_estimacionid;
              if (tipoId && tipoToParametroId[tipoId]) {
                paramValues[tipoToParametroId[tipoId]] = param.nombre;
              }
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
        
        // Create default parameters using real parameter IDs
        const paramValues: Record<number, string> = {};
        
        // Set default values for each parameter type using the actual DB IDs
        Object.keys(tipoToParametroId).forEach(tipoKey => {
          const tipo = parseInt(tipoKey);
          const paramId = tipoToParametroId[tipo];
          paramValues[paramId] = defaultValues[tipo] || "";
        });
        
        setParametros(paramValues);
        setElementos(defaultElems);
      }
    } catch (error) {
      console.error('Error fetching existing data:', error);
      // In case of error, still set default values
      const defaultElems: Record<number, number> = {};
      for (let i = 1; i <= 13; i++) {
        defaultElems[i] = 0;
      }
      
      setParametros({});
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
    setParametros({
      ...parametros,
      [id]: value
    });
  };

  const handleSave = async () => {
    const success = await saveForm();
    if (success) {
      setDataExists(true);
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
