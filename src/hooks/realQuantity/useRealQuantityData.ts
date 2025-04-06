
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { ElementWithQuantity } from "./types";

export function useRealQuantityData(requerimientoId: number, isOpen: boolean) {
  const [elements, setElements] = useState<ElementWithQuantity[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && requerimientoId) {
      loadRealQuantityData();
    }
  }, [isOpen, requerimientoId]);

  const loadRealQuantityData = async () => {
    setLoading(true);
    try {
      // Join punto_funcion with requerimiento to get the requirement name
      const { data: requirementData, error: requirementError } = await supabase
        .from('requerimiento')
        .select('nombrerequerimiento')
        .eq('requerimientoid', requerimientoId)
        .single();

      if (requirementError) throw requirementError;
      
      // Get the estimated and real quantities for this requirement
      const { data, error } = await supabase
        .from('punto_funcion')
        .select('*')
        .eq('requerimientoid', requerimientoId)
        .not('tipo_elemento_afectado_id', 'is', null);

      if (error) throw error;

      // Map the data to our ElementWithQuantity type
      const mappedElements = data.map((item: any) => ({
        punto_funcionid: item.punto_funcionid,
        elemento_id: item.tipo_elemento_afectado_id,
        nombre: getElementName(item.tipo_elemento_afectado_id),
        cantidad_estimada: item.cantidad_estimada || 0,
        cantidad_real: item.cantidad_real,
        jornada_real: item.jornada_real,
        requerimiento: requirementData?.nombrerequerimiento
      }));

      setElements(mappedElements);
    } catch (error) {
      console.error("Error loading real quantity data:", error);
      toast({
        title: "Error",
        description: "No se pudo cargar los datos de cantidades reales",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleElementChange = (elementId: number, value: string, field: 'cantidad_real' | 'jornada_real') => {
    const numericValue = value === "" ? null : parseFloat(value);
    
    setElements(prev => {
      return prev.map(element => {
        if (element.elemento_id === elementId) {
          return {
            ...element,
            [field]: numericValue
          };
        }
        return element;
      });
    });
  };

  const handleSave = async () => {
    try {
      const updates = elements.map(element => ({
        punto_funcionid: element.punto_funcionid,
        cantidad_real: element.cantidad_real,
        jornada_real: element.jornada_real
      }));

      console.log("Saving real quantities:", updates);

      // Update all elements in a transaction using the newly created function
      const { error } = await supabase.rpc('update_real_quantities', {
        updates
      });

      if (error) throw error;

      toast({
        title: "Éxito",
        description: "Cantidades reales guardadas correctamente",
      });
      
      return true;
    } catch (error) {
      console.error('Error saving real quantities:', error);
      toast({
        title: "Error",
        description: "No se pudieron guardar las cantidades reales",
        variant: "destructive",
      });
      return false;
    }
  };

  // Helper function to get element name by ID
  const getElementName = (id: number): string => {
    const elementMap: Record<number, string> = {
      1: "Tablas",
      2: "Triggers/SP",
      3: "Interfaces c/aplicativos",
      4: "Formularios",
      5: "Subrutinas complejas",
      6: "Interfaces con BD",
      7: "Reportes",
      8: "Componentes",
      9: "Javascript",
      10: "Componentes Config. y Pruebas",
      11: "Despliegue app movil",
      12: "QA", 
      13: "PF"
    };
    
    return elementMap[id] || `Elemento ${id}`;
  };

  return {
    loading,
    elements,
    handleElementChange,
    handleSave
  };
}
