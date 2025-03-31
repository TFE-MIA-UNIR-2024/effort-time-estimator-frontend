
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { ElementWithQuantity } from "./types";

export const useRealQuantityData = (requerimientoId: number, open: boolean) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState<boolean>(true);
  const [elements, setElements] = useState<ElementWithQuantity[]>([]);
  const [requerimientoName, setRequerimientoName] = useState<string>("");

  useEffect(() => {
    if (open) {
      fetchExistingData();
    }
  }, [open, requerimientoId]);

  const fetchExistingData = async () => {
    try {
      setLoading(true);
      console.log("Fetching data for requerimiento:", requerimientoId);
      
      // First get the requirement name
      const { data: reqData, error: reqError } = await supabase
        .from('requerimiento')
        .select('nombrerequerimiento')
        .eq('requerimientoid', requerimientoId)
        .single();
      
      if (reqError) throw reqError;
      if (reqData) {
        setRequerimientoName(reqData.nombrerequerimiento);
      }

      // Then get punto_funcion data
      const { data, error } = await supabase
        .from('punto_funcion')
        .select(`
          punto_funcionid,
          cantidad_estimada,
          cantidad_real,
          tipo_elemento_afectado_id,
          tipo_elemento_afectado:tipo_elemento_afectado_id(
            nombre
          )
        `)
        .eq('requerimientoid', requerimientoId)
        .is('parametro_estimacionid', null) // Only get elemento records, not parametros
        .not('tipo_elemento_afectado_id', 'is', null);

      if (error) throw error;

      console.log("Punto funcion data received:", data);

      if (data && data.length > 0) {
        const formattedElements = data.map(item => ({
          elemento_id: item.punto_funcionid,
          nombre: item.tipo_elemento_afectado?.nombre || 'Unknown',
          cantidad_estimada: item.cantidad_estimada || 0,
          cantidad_real: item.cantidad_real,
          tipo_elemento_afectado_id: item.tipo_elemento_afectado_id,
          requerimiento: reqData?.nombrerequerimiento
        }));
        
        setElements(formattedElements);
      } else {
        setElements([]);
      }
    } catch (error) {
      console.error('Error fetching existing data:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos existentes.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleElementChange = (elementId: number, value: string) => {
    setElements(elements.map(element => 
      element.elemento_id === elementId 
        ? { ...element, cantidad_real: value === '' ? null : Number(value) } 
        : element
    ));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      console.log("Saving real quantities for elements:", elements);
      
      const updates = elements.map(element => ({
        punto_funcionid: element.elemento_id,
        cantidad_real: element.cantidad_real
      }));
      
      console.log("Updates to save:", updates);
      
      for (const update of updates) {
        const { error } = await supabase
          .from('punto_funcion')
          .update({ cantidad_real: update.cantidad_real })
          .eq('punto_funcionid', update.punto_funcionid);
          
        if (error) throw error;
      }
      
      toast({
        title: "Éxito",
        description: "Las cantidades reales se han guardado correctamente.",
      });
      
      return true;
    } catch (error) {
      console.error('Error saving real quantities:', error);
      toast({
        title: "Error",
        description: "No se pudieron guardar las cantidades reales.",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    elements,
    requerimientoName,
    handleElementChange,
    handleSave
  };
};
