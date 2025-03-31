
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Element } from "./types";

interface SaveFormDataParams {
  requerimientoId: number;
  parametros: any[];
  elementos: Element[];
  dataExists: boolean;
}

export const useSaveFormData = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSave = async ({ requerimientoId, parametros, elementos, dataExists }: SaveFormDataParams) => {
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
      for (const param of parametros) {
        if (!param.value) {
          console.log(`Skipping empty parameter for type ${param.tipo_parametro_estimacionid}`);
          continue;
        }
        
        console.log(`Processing parameter: ${param.value} of type ${param.tipo_parametro_estimacionid}`);
        
        // Create punto_funcion record for this parameter
        inserts.push({
          requerimientoid: requerimientoId,
          parametro_estimacionid: param.value,
          cantidad_estimada: 0  // Default value
        });
      }
      
      // Process each elemento
      for (const elemento of elementos) {
        if (elemento.cantidad_estimada <= 0) {
          console.log(`Skipping elemento ${elemento.elemento_id} with zero or negative quantity`);
          continue;
        }
        
        // Create punto_funcion record for this elemento
        inserts.push({
          requerimientoid: requerimientoId,
          tipo_elemento_afectado_id: elemento.tipo_elemento_afectado_id || elemento.elemento_id,
          cantidad_estimada: elemento.cantidad_estimada
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
