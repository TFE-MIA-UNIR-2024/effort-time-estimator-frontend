
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useSaveFormData } from "./useSaveFormData";
import { useAIEstimation } from "./useAIEstimation";

interface FormData {
  loading: boolean;
  parametros: any[];
  elementos: any[];
  tiposParametros: any[];
  dataExists: boolean;
  handleElementChange: (elementId: number, value: number) => void;
  handleParametroChange: (parametroId: number, value: number) => void;
  handleSave: () => Promise<boolean>;
  handleGenerateAIEstimation: () => Promise<void>;
  aiLoading: boolean;
}

export function useFormData(requerimientoId: number, isOpen: boolean): FormData {
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAILoading] = useState(false);
  const [parametros, setParametros] = useState<any[]>([]);
  const [elementos, setElementos] = useState<any[]>([]);
  const [tiposParametros, setTiposParametros] = useState<any[]>([]);
  const [requirement, setRequirement] = useState<any>(null);
  const [dataExists, setDataExists] = useState(false);
  const { toast } = useToast();
  const { saveFormData } = useSaveFormData();
  const { generateWeights } = useAIEstimation();

  useEffect(() => {
    if (isOpen && requerimientoId) {
      fetchData();
    }
  }, [isOpen, requerimientoId]);

  const fetchData = async () => {
    setLoading(true);
    try {
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
      
      // Fetch existing data
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
      
      // Format parameters
      const initialParametros = tiposData.map((tipo: any) => ({
        tipo_parametro_estimacionid: tipo.tipo_parametro_estimacionid,
        nombre: tipo.nombre,
        haselementosafectados: tipo.haselementosafectados,
        parametro_estimacion: tipo.parametro_estimacion,
        value: null
      }));
      
      // If we have existing data, update parameters with values
      if (existingData && existingData.length > 0) {
        setDataExists(true);
        
        // Group by parametro_estimacionid
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
        
        // Update parameters with values
        initialParametros.forEach((param: any) => {
          for (const selectedParam of param.parametro_estimacion) {
            const existingParam = groupedByParametro.parameters[selectedParam.parametro_estimacionid];
            if (existingParam) {
              param.value = selectedParam.parametro_estimacionid;
              break;
            }
          }
        });
        
        // Fetch element names for elements that have data
        const elementIds = Object.keys(groupedByParametro.elements);
        if (elementIds.length > 0) {
          const { data: elementNames, error: elementError } = await supabase
            .from('elemento_afectado')
            .select('elemento_afectadoid, nombre')
            .in('elemento_afectadoid', elementIds);
          
          if (elementError) throw elementError;
          
          // Create elements array with values
          const initialElementos = elementNames?.map((elem: any) => {
            const elemData = groupedByParametro.elements[elem.elemento_afectadoid][0];
            return {
              elemento_id: elem.elemento_afectadoid,
              nombre: elem.nombre,
              cantidad_estimada: elemData.cantidad_estimada,
              cantidad_real: elemData.cantidad_real,
              tipo_elemento_afectado_id: elemData.tipo_elemento_afectado_id,
              punto_funcionid: elemData.punto_funcionid
            };
          }) || [];
          
          setElementos(initialElementos);
        }
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

  const handleElementChange = (elementId: number, value: number) => {
    setElementos(prev => 
      prev.map(elem => 
        elem.elemento_id === elementId 
          ? { ...elem, cantidad_estimada: value } 
          : elem
      )
    );
  };

  const handleParametroChange = (parametroId: number, value: number) => {
    setParametros(prev => 
      prev.map(param => 
        param.tipo_parametro_estimacionid === parametroId 
          ? { ...param, value } 
          : param
      )
    );
  };

  const handleSave = async () => {
    try {
      const success = await saveFormData({
        requerimientoId,
        parametros,
        elementos,
        dataExists
      });
      
      if (success) {
        toast({
          title: "Éxito",
          description: "Datos guardados correctamente",
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error saving form data:', error);
      toast({
        title: "Error",
        description: "No se pudo guardar los datos",
        variant: "destructive",
      });
      return false;
    }
  };

  const handleGenerateAIEstimation = async () => {
    if (!requirement) {
      toast({
        title: "Error",
        description: "No se pudo obtener la información del requerimiento",
        variant: "destructive",
      });
      return;
    }

    setAILoading(true);
    try {
      const weights = await generateWeights(
        requirement.nombrerequerimiento,
        requirement.cuerpo || ""
      );

      // Update elementos based on weights
      const newElementos = elementosFields.map((field, index) => {
        const existingElement = elementos.find(e => e.nombre === field.label);
        const value = weights[field.label] || 0;

        return existingElement 
          ? { ...existingElement, cantidad_estimada: value }
          : {
              elemento_id: field.id,
              nombre: field.label,
              cantidad_estimada: value,
              cantidad_real: null,
              tipo_elemento_afectado_id: field.id,
              requerimiento: requirement.nombrerequerimiento
            };
      });

      setElementos(newElementos);
      
      toast({
        title: "Éxito",
        description: "Esfuerzos estimados con IA",
      });
    } catch (error) {
      console.error("Error generating AI estimation:", error);
      toast({
        title: "Error",
        description: "No se pudo generar la estimación con IA",
        variant: "destructive",
      });
    } finally {
      setAILoading(false);
    }
  };

  return {
    loading,
    parametros,
    elementos,
    tiposParametros,
    dataExists,
    handleElementChange,
    handleParametroChange,
    handleSave,
    handleGenerateAIEstimation,
    aiLoading
  };
}

// Define the elementosFields that will be used in the form
const elementosFields = [
  { id: 1, label: "Tablas" },
  { id: 2, label: "Triggers/SP" },
  { id: 3, label: "Interfaces c/aplicativos" },
  { id: 4, label: "Formularios" },
  { id: 5, label: "Subrutinas complejas" },
  { id: 6, label: "Interfaces con BD" },
  { id: 7, label: "Reportes" },
  { id: 8, label: "Componentes" },
  { id: 9, label: "Javascript" },
  { id: 10, label: "Componentes Config. y Pruebas" },
  { id: 11, label: "Despliegue app movil" },
  { id: 12, label: "QA" },
  { id: 13, label: "PF" },
];
