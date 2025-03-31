
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface ParametroEstimacion {
  parametro_estimacionid: number;
  nombre: string;
  tipo_parametro_estimacionid: number;
  descripcion?: string;
  factor?: number;
  factor_ia?: number;
  pesofactor?: number;
  fecha_de_creacion?: string;
}

export interface TipoParametroEstimacion {
  tipo_parametro_estimacionid: number;
  nombre: string;
  haselementosafectados: boolean;
  parametro_estimacion: ParametroEstimacion[];
}

export interface ElementoAfectado {
  tipo_elemento_afectadoid: number;
  nombre: string;
  factor?: number;
  factor_ia?: number;
}

export const useFormParameters = () => {
  const [loading, setLoading] = useState(true);
  const [parametrosGrouped, setParametrosGrouped] = useState<TipoParametroEstimacion[]>([]);
  const [parametrosDB, setParametrosDB] = useState<ParametroEstimacion[]>([]);
  const [elementosDB, setElementosDB] = useState<ElementoAfectado[]>([]);
  const [parametersMap, setParametersMap] = useState<Map<string, number>>(new Map());

  // Function to fetch all parameters and elements
  const fetchParametrosYElementos = async () => {
    setLoading(true);
    try {
      // Fetch parameters with their types
      const { data: tiposParametros, error: tiposError } = await supabase
        .from('tipo_parametro_estimacion')
        .select(`
          tipo_parametro_estimacionid,
          nombre,
          haselementosafectados,
          parametro_estimacion (
            parametro_estimacionid,
            nombre,
            tipo_parametro_estimacionid,
            descripcion,
            factor,
            factor_ia,
            pesofactor,
            fecha_de_creacion
          )
        `)
        .eq('fase_proyectoid', 2);
      
      if (tiposError) throw tiposError;

      // Fetch all parameters separately for the flat list
      const { data: parametros, error: parametrosError } = await supabase
        .from('parametro_estimacion')
        .select('*')
        .order('nombre');

      if (parametrosError) throw parametrosError;

      // Fetch elements
      const { data: elementos, error: elementosError } = await supabase
        .from('tipo_elemento_afectado')
        .select('*')
        .eq('activo', true)
        .order('nombre');

      if (elementosError) throw elementosError;

      // Set the grouped data
      setParametrosGrouped(tiposParametros || []);
      
      // Set the flat data
      setParametrosDB(parametros || []);
      setElementosDB(elementos || []);
      
      // Create a map for quick parameter lookup by name and type
      const paramMap = new Map<string, number>();
      parametros?.forEach(param => {
        const key = `${param.nombre}:${param.tipo_parametro_estimacionid}`;
        paramMap.set(key, param.parametro_estimacionid);
      });
      setParametersMap(paramMap);
      
      console.log("Parameters fetched:", parametros?.length || 0);
      console.log("Elements fetched:", elementos?.length || 0);
      console.log("Parameter types fetched:", tiposParametros?.length || 0);
    } catch (error) {
      console.error('Error fetching parameters:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get the type for a parameter based on its ID
  const getTypeForParameter = (parametroId: number): number => {
    const param = parametrosDB.find(p => p.parametro_estimacionid === parametroId);
    return param?.tipo_parametro_estimacionid || 0;
  };

  // Get the parameter ID by name and type
  const getParameterIdByNameAndType = (name: string, typeId: number): number | null => {
    const key = `${name}:${typeId}`;
    const id = parametersMap.get(key);
    
    if (id) {
      console.log(`Found parameter ID ${id} for ${name} (type ${typeId})`);
      return id;
    }
    
    // Fallback to linear search if map lookup fails
    const param = parametrosDB.find(p => 
      p.nombre === name && 
      p.tipo_parametro_estimacionid === typeId
    );
    
    if (param) {
      console.log(`Found parameter ID ${param.parametro_estimacionid} through linear search for ${name} (type ${typeId})`);
      return param.parametro_estimacionid;
    }
    
    console.log(`Parameter not found for ${name} (type ${typeId})`);
    return null;
  };

  // Initialize component by fetching data
  useEffect(() => {
    fetchParametrosYElementos();
  }, []);

  return {
    loading,
    parametrosDB,
    parametrosGrouped,
    elementosDB,
    fetchParametrosYElementos,
    getTypeForParameter,
    getParameterIdByNameAndType
  };
};
