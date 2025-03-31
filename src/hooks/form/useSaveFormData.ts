
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { ParametroEstimacion } from "./useFormParameters";

export const useSaveFormData = (
  requerimientoId: number,
  parametros: Record<number, string>,
  elementos: Record<number, number>,
  parametrosDB: ParametroEstimacion[],
  getTypeForParameter: (parametroId: number) => number,
  getParameterIdByNameAndType: (name: string, typeId: number) => number | null
) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    setLoading(true);
    try {
      console.log("Saving form data for requerimiento:", requerimientoId);
      console.log("Parameters to save:", parametros);
      console.log("Elements to save:", elementos);
      
      // First, delete existing data for this requerimiento
      const { error: deleteError } = await supabase
        .from('punto_funcion')
        .delete()
        .eq('requerimientoid', requerimientoId);

      if (deleteError) throw deleteError;
      console.log("Deleted existing punto_funcion records");

      // Process each parameter by type (1-6)
      const parameterEntries = Object.entries(parametros);
      console.log("Parameter entries to process:", parameterEntries);
      
      // Prepare an array to store all inserts
      const inserts = [];

      // Process each parameter
      for (const [typeIdStr, paramName] of parameterEntries) {
        const typeId = parseInt(typeIdStr);
        
        if (!paramName || paramName.trim() === '') {
          console.log(`Skipping empty parameter for type ${typeId}`);
          continue;
        }
        
        console.log(`Processing parameter: ${paramName} of type ${typeId}`);
        
        // Get the parametro_estimacionid for this name and type
        let parametroId = getParameterIdByNameAndType(paramName, typeId);
        
        if (parametroId === null) {
          console.log(`Parameter "${paramName}" not found in DB for type ${typeId}, will create it`);
          
          // Fix: Convert Date to ISO string for fecha_de_creacion
          const { data: newParam, error: paramInsertError } = await supabase
            .from('parametro_estimacion')
            .insert({
              nombre: paramName,
              tipo_parametro_estimacionid: typeId,
              fecha_de_creacion: new Date().toISOString()
            })
            .select('parametro_estimacionid')
            .single();
          
          if (paramInsertError) {
            console.error('Error creating parameter:', paramInsertError);
            throw paramInsertError;
          }
          
          if (newParam) {
            parametroId = newParam.parametro_estimacionid;
            console.log(`Created new parameter with ID: ${parametroId}`);
          } else {
            console.warn(`Failed to create parameter: ${paramName}`);
            continue;
          }
        }
        
        // Create punto_funcion record for this parameter
        inserts.push({
          requerimientoid: requerimientoId,
          parametro_estimacionid: parametroId,
          cantidad_estimada: 0  // Default value
        });
      }
      
      // Process each elemento
      for (const [elementoIdStr, cantidad] of Object.entries(elementos)) {
        const elementoId = parseInt(elementoIdStr);
        
        if (cantidad <= 0) {
          console.log(`Skipping elemento ${elementoId} with zero or negative quantity`);
          continue;
        }
        
        // Create punto_funcion record for this elemento
        inserts.push({
          requerimientoid: requerimientoId,
          tipo_elemento_afectado_id: elementoId,
          cantidad_estimada: cantidad
        });
      }
      
      console.log("Records to insert:", inserts);
      
      if (inserts.length > 0) {
        const { error: insertError } = await supabase
          .from('punto_funcion')
          .insert(inserts);

        if (insertError) throw insertError;
        console.log("Inserted new punto_funcion records");
      } else {
        console.log("No records to insert");
      }

      return true;
    } catch (error) {
      console.error('Error saving form data:', error);
      toast({
        title: "Error",
        description: "No se pudieron guardar los parámetros.",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    handleSave
  };
};
