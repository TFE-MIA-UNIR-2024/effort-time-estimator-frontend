
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface ParametroEstimacion {
  parametro_estimacionid: number;
  nombre: string;
  tipo_parametro_estimacionid: number;
}

export interface TipoElementoAfectado {
  tipo_elemento_afectadoid: number;
  nombre: string;
}

export const useFormParameters = () => {
  const [loading, setLoading] = useState(false);
  const [parametrosDB, setParametrosDB] = useState<ParametroEstimacion[]>([]);
  const [elementosDB, setElementosDB] = useState<TipoElementoAfectado[]>([]);

  const fetchParametrosYElementos = async () => {
    setLoading(true);
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
      return { error };
    } finally {
      setLoading(false);
    }
    return { parametrosDB, elementosDB };
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
    parametrosDB,
    elementosDB,
    fetchParametrosYElementos,
    getTypeForParameter
  };
};
