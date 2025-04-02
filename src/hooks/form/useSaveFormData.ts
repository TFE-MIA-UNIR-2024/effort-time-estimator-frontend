
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
  elementosFields: { id: number; label: string }[]; // Add this parameter
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
      
      // Create a map of elements by ID for easy lookup
      const elementosMap = new Map<number, Element>();
      elementos.forEach(elemento => {
        const id = elemento.tipo_elemento_afectado_id || elemento.elemento_id;
        elementosMap.set(id, elemento);
      });
      
      // Process each elemento from elementosFields to ensure all are included
      elementosFields.forEach(field => {
        const elemento = elementosMap.get(field.id) || {
          elemento_id: field.id,
          nombre: field.label,
          cantidad_estimada: 0,
          cantidad_real: null,
          tipo_elemento_afectado_id: field.id
        };
        
        // Create punto_funcion record for this elemento
        inserts.push({
          requerimientoid: requerimientoId,
          tipo_elemento_afectado_id: elemento.tipo_elemento_afectado_id || elemento.elemento_id,
          cantidad_estimada: elemento.cantidad_estimada
        });
      });
      
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
