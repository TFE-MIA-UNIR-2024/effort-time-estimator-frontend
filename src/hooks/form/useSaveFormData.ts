
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Element } from "./types";
import { useFormParameters } from "./useFormParameters";

interface SaveFormDataParams {
  requerimientoId: number;
  parametros: Record<number, string>;
  elementos: Element[];
  dataExists: boolean;
  elementosFields: { id: number; label: string }[];
}

export const useSaveFormData = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { getParameterIdByNameAndType } = useFormParameters();

  const handleSave = async ({ requerimientoId, parametros, elementos, dataExists, elementosFields }: SaveFormDataParams) => {
    setLoading(true);
    try {
      console.log("Saving form data for requerimiento:", requerimientoId);
      console.log("Parameters to save:", parametros);
      console.log("Elements to save:", elementos);
      
      if (!requerimientoId || isNaN(requerimientoId)) {
        throw new Error(`Invalid requerimiento ID: ${requerimientoId}`);
      }
      
      // First, delete existing data for this requerimiento
      const { error: deleteError } = await supabase
        .from('punto_funcion')
        .delete()
        .eq('requerimientoid', requerimientoId);

      if (deleteError) throw deleteError;
      console.log("Deleted existing punto_funcion records");

      // Prepare an array to store all inserts
      const inserts = [];

      // Process each parameter
      for (const [tipoParametroId, paramName] of Object.entries(parametros)) {
        if (!paramName) {
          console.log(`Skipping empty parameter for type ${tipoParametroId}`);
          continue;
        }
        
        // Find the parameter ID for this name and type
        const parametroId = getParameterIdByNameAndType(paramName, parseInt(tipoParametroId));
        
        if (!parametroId) {
          console.log(`Could not find parameter ID for ${paramName} of type ${tipoParametroId}`);
          continue;
        }
        
        console.log(`Processing parameter: ${paramName} (ID: ${parametroId}) of type ${tipoParametroId}`);
        
        // Create punto_funcion record for this parameter
        inserts.push({
          requerimientoid: requerimientoId,
          parametro_estimacionid: parametroId,
          cantidad_estimada: 0  // Default value
        });
      }
      
      // Get a set of all IDs from 1 to 13 to ensure complete coverage
      const allElementIds = new Set(Array.from({length: 13}, (_, i) => i + 1));
      
      // Process each elemento from elementos array
      elementos.forEach(elemento => {
        const elementoId = elemento.tipo_elemento_afectado_id || elemento.elemento_id;
        
        if (elementoId && elemento.cantidad_estimada !== undefined && elemento.cantidad_estimada !== null) {
          // Create punto_funcion record for this elemento
          inserts.push({
            requerimientoid: requerimientoId,
            tipo_elemento_afectado_id: elementoId,
            cantidad_estimada: elemento.cantidad_estimada,
            cantidad_real: elemento.cantidad_real
          });
          
          // Remove this ID from the set of IDs to fill
          allElementIds.delete(elementoId);
        }
      });
      
      // Fill in any missing elementos from elementosFields to ensure all IDs 1-13 are included
      allElementIds.forEach(elementId => {
        inserts.push({
          requerimientoid: requerimientoId,
          tipo_elemento_afectado_id: elementId,
          cantidad_estimada: 0  // Default value for missing elements
        });
      });
      
      console.log(`Inserting ${inserts.length} records for requirement ID ${requerimientoId}`);
      
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
