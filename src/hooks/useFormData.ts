
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
      console.log("Parametros from DB:", parametrosData);
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
      console.log("Fetching data for requerimiento:", requerimientoId);
      
      const { data, error } = await supabase
        .from('punto_funcion')
        .select('*')
        .eq('requerimientoid', requerimientoId);

      if (error) throw error;

      console.log("Punto funcion data received:", data);

      // We need to wait for parametrosDB to be populated
      if (parametrosDB.length === 0) {
        await fetchParametrosYElementos();
      }

      // Map parameter types to their expected values
      // These are the default values for each type of parameter
      const defaultValues: Record<number, string> = {
        1: "Funcional", // Tipo Función
        2: "Nuevo",     // Nuevo/Modificación
        3: "Baja",      // Complejidad
        4: "Interno",   // Tipo de Desarrollo
        5: "Web",       // Arquitectura
        6: "Java",      // Lenguajes
      };

      // Map parameter types to actual parameter IDs from the database
      const tipoToParametroId: Record<number, number> = {};
      const parametroIdToTipo: Record<number, number> = {};
      
      // Find the parameter IDs for each parameter type
      parametrosDB.forEach(param => {
        if (param.tipo_parametro_estimacionid >= 1 && param.tipo_parametro_estimacionid <= 6) {
          tipoToParametroId[param.tipo_parametro_estimacionid] = param.parametro_estimacionid;
          parametroIdToTipo[param.parametro_estimacionid] = param.tipo_parametro_estimacionid;
        }
      });

      console.log("Parameter type to ID mapping:", tipoToParametroId);
      console.log("Parameter ID to type mapping:", parametroIdToTipo);

      // Set default values for elements (all zeros)
      const defaultElems: Record<number, number> = {};
      for (let i = 1; i <= 13; i++) {
        defaultElems[i] = 0;
      }

      if (data && data.length > 0) {
        setDataExists(true);
        
        // Initialize with default values first
        const paramValues: Record<number, string> = {};
        const elemValues: Record<number, number> = { ...defaultElems };

        // For each of the 6 parameter types, set a default value
        Object.keys(tipoToParametroId).forEach(tipoKey => {
          const tipo = parseInt(tipoKey);
          const paramId = tipoToParametroId[tipo];
          paramValues[paramId] = defaultValues[tipo] || "";
        });

        data.forEach(item => {
          if (item.parametro_estimacionid) {
            // For parameters, find the name of the parameter from DB
            const param = parametrosDB.find(p => p.parametro_estimacionid === item.parametro_estimacionid);
            if (param) {
              // Store by parameter type ID for consistent UI display
              const tipoId = param.tipo_parametro_estimacionid;
              if (tipoId && tipoToParametroId[tipoId]) {
                paramValues[tipoToParametroId[tipoId]] = param.nombre;
              }
            }
          }
          if (item.tipo_elemento_afectado_id) {
            // For elements, store the numeric value
            elemValues[item.tipo_elemento_afectado_id] = item.cantidad_estimada !== null ? Number(item.cantidad_estimada) : 0;
          }
        });

        console.log("Processed parameters:", paramValues);
        console.log("Processed elements:", elemValues);

        setParametros(paramValues);
        setElementos(elemValues);
      } else {
        // No data exists, set default values
        setDataExists(false);
        
        // Create default parameters using real parameter IDs
        const paramValues: Record<number, string> = {};
        
        // Set default values for each parameter type using the actual DB IDs
        Object.keys(tipoToParametroId).forEach(tipoKey => {
          const tipo = parseInt(tipoKey);
          const paramId = tipoToParametroId[tipo];
          paramValues[paramId] = defaultValues[tipo] || "";
        });
        
        setParametros(paramValues);
        setElementos(defaultElems);
      }
    } catch (error) {
      console.error('Error fetching existing data:', error);
      // In case of error, still set default values
      const defaultElems: Record<number, number> = {};
      for (let i = 1; i <= 13; i++) {
        defaultElems[i] = 0;
      }
      
      setParametros({});
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

      // For parametros, we need to find the exact parameter ID by name and type
      for (const [paramId, value] of Object.entries(parametros)) {
        if (value) {
          // Get the type (1-6) for this parameter
          const tipo = getTypeForParameter(parseInt(paramId));
          
          // Find the exact parameter with this name and type
          const matchingParam = parametrosDB.find(p => 
            p.nombre === value && 
            p.tipo_parametro_estimacionid === tipo
          );

          if (matchingParam) {
            records.push({
              requerimientoid: requerimientoId,
              parametro_estimacionid: matchingParam.parametro_estimacionid,
              cantidad_estimada: 1, // We're storing a numeric value now
              tipo_elemento_afectado_id: null
            });
          } else {
            console.warn(`Could not find matching parameter for ${value} of type ${tipo}`);
            
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
                
              if (error) throw error;
              if (data && data[0]) {
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

  // Helper function to get the type (1-6) for a parameter
  const getTypeForParameter = (parametroId: number): number => {
    // Find the parameter in the DB
    const param = parametrosDB.find(p => p.parametro_estimacionid === parametroId);
    if (param) {
      return param.tipo_parametro_estimacionid;
    }
    
    // If not found by ID, try to infer type from the 1-6 range
    if (parametroId >= 1 && parametroId <= 6) {
      return parametroId;
    }
    
    return 0;
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
