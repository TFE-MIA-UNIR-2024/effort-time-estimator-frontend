import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface ParametroEstimacion {
  parametro_estimacionid: number;
  nombre: string;
  tipo_parametro_estimacionid: number;
}

interface TipoElementoAfectado {
  tipo_elemento_afectadoid: number;
  nombre: string;
}

export const useFormData = (requerimientoId: number, open: boolean) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [parametros, setParametros] = useState<Record<number, string>>({});
  const [elementos, setElementos] = useState<Record<number, number>>({});
  const [parametrosDB, setParametrosDB] = useState<ParametroEstimacion[]>([]);
  const [elementosDB, setElementosDB] = useState<TipoElementoAfectado[]>([]);

  useEffect(() => {
    if (open) {
      fetchParametrosYElementos();
      fetchExistingData();
    }
  }, [open, requerimientoId]);

  const fetchParametrosYElementos = async () => {
    try {
      const { data: parametrosData, error: parametrosError } = await supabase
        .from('parametro_estimacion')
        .select('*');

      if (parametrosError) throw parametrosError;
      setParametrosDB(parametrosData || []);

      const { data: elementosData, error: elementosError } = await supabase
        .from('tipo_elemento_afectado')
        .select('*');

      if (elementosError) throw elementosError;
      setElementosDB(elementosData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos",
        variant: "destructive",
      });
    }
  };

  const fetchExistingData = async () => {
    try {
      const { data, error } = await supabase
        .from('punto_funcion')
        .select('*')
        .eq('requerimientoid', requerimientoId);

      if (error) throw error;

      if (data && data.length > 0) {
        const paramValues: Record<number, string> = {};
        const elemValues: Record<number, number> = {};

        data.forEach(item => {
          if (item.parametro_estimacionid) {
            // Find matching parameter
            paramValues[item.parametro_estimacionid] = String(item.cantidad_estimada);
          }
          if (item.tipo_elemento_afectado_id) {
            // Store numeric value (even zero)
            elemValues[item.tipo_elemento_afectado_id] = item.cantidad_estimada !== null ? Number(item.cantidad_estimada) : 0;
          }
        });

        setParametros(paramValues);
        setElementos(elemValues);
      }
    } catch (error) {
      console.error('Error fetching existing data:', error);
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
    setLoading(true);
    try {
      // First delete existing records
      const { error: deleteError } = await supabase
        .from('punto_funcion')
        .delete()
        .eq('requerimientoid', requerimientoId);

      if (deleteError) throw deleteError;

      const records = [];

      // For parametros, store numeric values when possible to match the DB column type
      for (const [paramId, value] of Object.entries(parametros)) {
        if (value) {
          // Try to convert the value to a number if possible, otherwise keep it as is
          let cantidad;
          const numericValue = Number(value);
          
          // If it's a valid number, use it
          if (!isNaN(numericValue)) {
            cantidad = numericValue;
          } else {
            // For storing string values in the DB, set cantidad to 1 (default value)
            // and use the paramId to reference the parameter
            cantidad = 1;
          }
          
          records.push({
            requerimientoid: requerimientoId,
            parametro_estimacionid: parseInt(paramId),
            cantidad_estimada: cantidad,
            tipo_elemento_afectado_id: null
          });
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

        if (insertError) throw insertError;
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
    parametros,
    elementos,
    parametrosDB,
    elementosDB,
    handleElementChange,
    handleParametroChange,
    handleSave
  };
};
