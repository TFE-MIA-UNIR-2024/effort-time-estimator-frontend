
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
  const [dataExists, setDataExists] = useState(false);

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

      // Set default values for parameters (1-6)
      const defaultParams: Record<number, string> = {
        1: "Funcional", // Tipo Función
        2: "Nuevo",     // Nuevo/Modificación
        3: "Baja",      // Complejidad
        4: "Interno",   // Tipo de Desarrollo
        5: "Web",       // Arquitectura
        6: "Java",      // Lenguajes
      };

      // Set default values for elements (all zeros)
      const defaultElems: Record<number, number> = {};
      for (let i = 1; i <= 13; i++) {
        defaultElems[i] = 0;
      }

      if (data && data.length > 0) {
        setDataExists(true);
        const paramValues: Record<number, string> = { ...defaultParams };
        const elemValues: Record<number, number> = { ...defaultElems };

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
      } else {
        // No data exists, set default values
        setDataExists(false);
        setParametros(defaultParams);
        setElementos(defaultElems);
      }
    } catch (error) {
      console.error('Error fetching existing data:', error);
      // In case of error, still set default values
      const defaultParams: Record<number, string> = {
        1: "Funcional",
        2: "Nuevo",
        3: "Baja",
        4: "Interno",
        5: "Web",
        6: "Java",
      };
      
      const defaultElems: Record<number, number> = {};
      for (let i = 1; i <= 13; i++) {
        defaultElems[i] = 0;
      }
      
      setParametros(defaultParams);
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
      setDataExists(true);
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
    dataExists,
    handleElementChange,
    handleParametroChange,
    handleSave
  };
};
