
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Element } from "./types";

interface FetchDataResult {
  loading: boolean;
  parametros: Record<number, string>;
  elementos: Element[];
  tiposParametros: any[];
  dataExists: boolean;
  requirement: any;
}

export function useFetchFormData(requerimientoId: number, isOpen: boolean): FetchDataResult {
  const [loading, setLoading] = useState(true);
  const [parametros, setParametros] = useState<Record<number, string>>({});
  const [elementos, setElementos] = useState<Element[]>([]);
  const [tiposParametros, setTiposParametros] = useState<any[]>([]);
  const [dataExists, setDataExists] = useState(false);
  const [requirement, setRequirement] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && requerimientoId) {
      // Reset all state variables when opening for a new requirement ID
      setParametros({});
      setElementos([]);
      setDataExists(false);
      setRequirement(null);
      
      fetchData();
    }
  }, [isOpen, requerimientoId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      console.log("Fetching data for requirement ID:", requerimientoId);
      
      // Fetch requirement details
      const { data: reqData, error: reqError } = await supabase
        .from('requerimiento')
        .select('*')
        .eq('requerimientoid', requerimientoId)
        .single();

      if (reqError) throw reqError;
      setRequirement(reqData);

      // Fetch parameter types
      const { data: tiposData, error: tiposError } = await supabase
        .from('tipo_parametro_estimacion')
        .select(`
          tipo_parametro_estimacionid,
          nombre,
          haselementosafectados,
          parametro_estimacion (
            parametro_estimacionid,
            nombre
          )
        `)
        .eq('fase_proyectoid', 2);
      
      if (tiposError) throw tiposError;
      setTiposParametros(tiposData || []);
      
      // Fetch existing data for THIS specific requirement
      const { data: existingData, error: existingError } = await supabase
        .from('punto_funcion')
        .select(`
          punto_funcionid,
          parametro_estimacionid,
          tipo_elemento_afectado_id,
          cantidad_estimada,
          cantidad_real
        `)
        .eq('requerimientoid', requerimientoId);
      
      if (existingError) throw existingError;
      
      console.log(`Retrieved ${existingData?.length || 0} punto_funcion records for requirement ID ${requerimientoId}`);
      
      // Initialize parameters as an empty object
      const initialParametros: Record<number, string> = {};
      
      // If we have existing data, update parameters with values
      if (existingData && existingData.length > 0) {
        setDataExists(true);
        
        // Group by parametro_estimacionid and tipo_elemento_afectado_id
        const groupedByParametro = existingData.reduce((acc: any, item: any) => {
          if (!item.tipo_elemento_afectado_id) {
            acc.parameters[item.parametro_estimacionid] = item;
          } else {
            if (!acc.elements[item.tipo_elemento_afectado_id]) {
              acc.elements[item.tipo_elemento_afectado_id] = [];
            }
            acc.elements[item.tipo_elemento_afectado_id].push(item);
          }
          return acc;
        }, { parameters: {}, elements: {} });
        
        // Process parameters
        for (const tipoParametro of tiposData || []) {
          for (const param of tipoParametro.parametro_estimacion) {
            const existingParam = groupedByParametro.parameters[param.parametro_estimacionid];
            if (existingParam) {
              initialParametros[tipoParametro.tipo_parametro_estimacionid] = param.nombre;
            }
          }
        }
        
        // Fetch element names for elements that have data
        const elementIds = Object.keys(groupedByParametro.elements).map(Number);
        if (elementIds.length > 0) {
          const { data: elementNames, error: elementError } = await supabase
            .from('tipo_elemento_afectado')
            .select('tipo_elemento_afectadoid, nombre')
            .in('tipo_elemento_afectadoid', elementIds);
          
          if (elementError) throw elementError;
          
          // Create elements array with values
          const initialElementos = elementIds.map(elementId => {
            const elementData = groupedByParametro.elements[elementId];
            const elementName = elementNames?.find((elem: any) => elem.tipo_elemento_afectadoid === elementId);
            
            if (!elementName) {
              console.warn(`Could not find element name for ID ${elementId}`);
              return null;
            }
            
            return {
              elemento_id: elementId,
              nombre: elementName.nombre,
              cantidad_estimada: elementData[0].cantidad_estimada,
              cantidad_real: elementData[0].cantidad_real,
              tipo_elemento_afectado_id: elementId,
              punto_funcionid: elementData[0].punto_funcionid
            };
          }).filter(Boolean);
          
          console.log(`Created ${initialElementos.length} elementos for requirement ID ${requerimientoId}`);
          setElementos(initialElementos);
        } else {
          // Clear elementos if there are no element records
          setElementos([]);
        }
      } else {
        // No existing data found, reset state
        setDataExists(false);
        setParametros({});
        setElementos([]);
      }
      
      setParametros(initialParametros);
    } catch (error) {
      console.error('Error fetching form data:', error);
      toast({
        title: "Error",
        description: "No se pudo cargar los datos del formulario",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    parametros,
    elementos,
    tiposParametros,
    dataExists,
    requirement
  };
}
