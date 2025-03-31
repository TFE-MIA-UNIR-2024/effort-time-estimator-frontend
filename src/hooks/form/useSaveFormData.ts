
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { ParametroEstimacion } from "./useFormParameters";

export const useSaveFormData = (
  requerimientoId: number,
  parametros: Record<number, string>,
  elementos: Record<number, number>,
  parametrosDB: ParametroEstimacion[],
  getTypeForParameter: (parametroId: number) => number
) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      console.log("Saving form for requerimiento:", requerimientoId);
      console.log("Parametros to save:", parametros);
      
      // First delete existing records
      const { error: deleteError } = await supabase
        .from('punto_funcion')
        .delete()
        .eq('requerimientoid', requerimientoId);

      if (deleteError) throw deleteError;

      const records = [];

      // For each parameter type, find the matching parameter in DB or create a new one
      for (const [paramId, value] of Object.entries(parametros)) {
        if (value) {
          // Get the type (1-6) for this parameter
          const tipo = getTypeForParameter(parseInt(paramId));
          console.log(`Processing parameter: ${value} with type ${tipo}`);
          
          // Find the exact parameter with this name and type
          const matchingParam = parametrosDB.find(p => 
            p.nombre === value && 
            p.tipo_parametro_estimacionid === tipo
          );

          if (matchingParam) {
            // Found existing parameter - use it
            records.push({
              requerimientoid: requerimientoId,
              parametro_estimacionid: matchingParam.parametro_estimacionid,
              cantidad_estimada: 1,
              tipo_elemento_afectado_id: null
            });
            console.log(`Using existing parameter: ${value} with id ${matchingParam.parametro_estimacionid}`);
          } else {
            console.log(`Could not find matching parameter for ${value} of type ${tipo}, creating new one`);
            
            // Insert parameters that don't exist in the DB
            try {
              const { data, error } = await supabase
                .from('parametro_estimacion')
                .insert({
                  nombre: value,
                  tipo_parametro_estimacionid: tipo,
                  fecha_de_creacion: new Date().toISOString()
                })
                .select();
                
              if (error) {
                console.error('Error inserting parameter:', error);
                // Try to find if the parameter already exists with a different case or trailing spaces
                const similarParams = parametrosDB.filter(p => 
                  p.nombre.toLowerCase().trim() === value.toLowerCase().trim() && 
                  p.tipo_parametro_estimacionid === tipo
                );
                
                if (similarParams.length > 0) {
                  const param = similarParams[0];
                  records.push({
                    requerimientoid: requerimientoId,
                    parametro_estimacionid: param.parametro_estimacionid,
                    cantidad_estimada: 1,
                    tipo_elemento_afectado_id: null
                  });
                  console.log(`Used similar parameter: ${param.nombre} with id ${param.parametro_estimacionid}`);
                } else {
                  throw error;
                }
              } else if (data && data[0]) {
                records.push({
                  requerimientoid: requerimientoId,
                  parametro_estimacionid: data[0].parametro_estimacionid,
                  cantidad_estimada: 1,
                  tipo_elemento_afectado_id: null
                });
                console.log(`Created new parameter: ${value} with id ${data[0].parametro_estimacionid}`);
              }
            } catch (insertError) {
              console.error('Error inserting parameter:', insertError);
              // Continue with other parameters even if one fails
            }
          }
        }
      }

      // For elementos, we already have numeric values
      for (const [elemId, cantidad] of Object.entries(elementos)) {
        if (cantidad >= 0) { // Include zero values
          records.push({
            requerimientoid: requerimientoId,
            tipo_elemento_afectado_id: parseInt(elemId),
            cantidad_estimada: cantidad,
            parametro_estimacionid: null
          });
        }
      }

      if (records.length > 0) {
        console.log('Saving records:', records);
        const { error: insertError } = await supabase
          .from('punto_funcion')
          .insert(records);

        if (insertError) {
          console.error('Error inserting records:', insertError);
          throw insertError;
        }
      }

      toast({
        title: "Éxito",
        description: "Formulario guardado correctamente",
      });
      return true;
    } catch (error) {
      console.error('Error saving form:', error);
      toast({
        title: "Error",
        description: "No se pudo guardar el formulario",
        variant: "destructive",
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
