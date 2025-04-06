
import { supabase } from "@/integrations/supabase/client";
import { 
  ParametroEstimacion, 
  Need, 
  Requirement, 
  NeedEstimation, 
  PuntoFuncion 
} from "./types";

// Fetch parameters from the database
export const fetchParameters = async (): Promise<ParametroEstimacion[] | null> => {
  const { data, error } = await supabase
    .from("parametro_estimacion")
    .select(
      `
      parametro_estimacionid,
      nombre,
      factor,
      factor_ia,
      tipo_parametro_estimacion (
        nombre,
        haselementosafectados
      )
    `
    )
    .limit(100);

  if (error) {
    console.error("Error fetching parameters:", error);
    return null;
  }

  return data;
};

// Fetch needs for a project
export const fetchNeedsForProject = async (projectId: number): Promise<Need[] | null> => {
  const { data, error } = await supabase
    .from("necesidad")
    .select("necesidadid, nombrenecesidad")
    .eq("proyectoid", projectId);

  if (error) {
    console.error("Error fetching needs:", error);
    return null;
  }

  return data;
};

// Fetch requirements with estimation details for a need
export const fetchRequirementsForNeed = async (needId: number): Promise<any[] | null> => {
  const { data, error } = await supabase
    .from("requerimiento")
    .select(
      `
      requerimientoid,
      nombrerequerimiento,
      punto_funcion (
        punto_funcionid,
        cantidad_estimada,
        tipo_elemento_afectado_id,
        tipo_elemento_afectado (
          nombre
        ),
        jornada_estimada
      )
    `
    )
    .eq("necesidadid", needId);

  if (error) {
    console.error("Error fetching requirements:", error);
    return null;
  }

  return data;
};

// Fetch element factors from database
export const fetchElementFactors = async (
  elementIds: number[],
  complejidadParamId?: number
): Promise<Record<number, {factor_ia: number, nombre: string}>> => {
  if (!elementIds.length || !complejidadParamId) {
    return {};
  }
  
  try {
    const { data, error } = await supabase
      .from("elemento_afectado")
      .select("tipo_elemento_afectadoid, factor, factor_ia, nombre")
      .eq("parametro_estimacionid", complejidadParamId)
      .in("tipo_elemento_afectadoid", elementIds);
    
    if (error) {
      console.error("Error fetching element factors:", error);
      return {};
    }
    
    // Create a map of element ID to factor
    const factorsMap: Record<number, {factor_ia: number, nombre: string}> = {};
    
    if (data) {
      data.forEach(elem => {
        const factorValue = elem.factor_ia || elem.factor || 1;
        factorsMap[elem.tipo_elemento_afectadoid] = {
          factor_ia: factorValue,
          nombre: elem.nombre
        };
      });
    }
    
    return factorsMap;
  } catch (error) {
    console.error("Error in fetchElementFactors:", error);
    return {};
  }
};

// Calculate estimation factors for a specific punto_funcion (simplified - only multiplicative)
export const calculateEstimationFactors = async (
  pf: PuntoFuncion,
  parametros: ParametroEstimacion[],
  complejidadParam: ParametroEstimacion | undefined,
  factorsMap: Record<number, {factor_ia: number, nombre: string}>
): Promise<number> => {
  if (!pf.tipo_elemento_afectado_id || !pf.cantidad_estimada) {
    return 0;
  }
  
  let factorComplejidad = 1;

  // Use pre-fetched factors if available
  if (pf.tipo_elemento_afectado_id && factorsMap[pf.tipo_elemento_afectado_id]) {
    factorComplejidad = factorsMap[pf.tipo_elemento_afectado_id].factor_ia;
  }
  // Fallback to fetching from database
  else if (complejidadParam) {
    const { data: elementoAfectado } = await supabase
      .from("elemento_afectado")
      .select("factor, factor_ia")
      .eq(
        "tipo_elemento_afectadoid",
        pf.tipo_elemento_afectado_id
      )
      .eq(
        "parametro_estimacionid",
        complejidadParam.parametro_estimacionid
      )
      .maybeSingle();

    if (elementoAfectado) {
      factorComplejidad =
        elementoAfectado.factor_ia ||
        elementoAfectado.factor ||
        1;
    }
  }

  const parametrosMultiplicar = parametros.filter(
    (p) =>
      p.tipo_parametro_estimacion?.haselementosafectados
  );

  const factoresMultiplicativos = parametrosMultiplicar.reduce(
    (sum, param) => {
      const factorToUse = param.factor_ia || param.factor || 0;
      return (
        sum +
        (pf.cantidad_estimada || 0) * factorToUse * factorComplejidad
      );
    },
    0
  );

  return factoresMultiplicativos;
};

// Process requirements for a need and calculate estimations (simplified - no additive)
export const processRequirements = async (
  requirements: any[],
  parametros: ParametroEstimacion[]
): Promise<Requirement[]> => {
  const complejidadParam = parametros?.find(
    (p) => p.tipo_parametro_estimacion?.nombre === "Complejidad"
  );
  
  // Get all unique element IDs for batch fetching factors
  const allElementIds: number[] = [];
  requirements.forEach(req => {
    (req.punto_funcion || []).forEach((pf: any) => {
      if (pf.tipo_elemento_afectado_id && !allElementIds.includes(pf.tipo_elemento_afectado_id)) {
        allElementIds.push(pf.tipo_elemento_afectado_id);
      }
    });
  });
  
  // Pre-fetch all element factors in one go
  const allFactors = await fetchElementFactors(
    allElementIds, 
    complejidadParam?.parametro_estimacionid
  );

  const processedRequirements: Requirement[] = [];
  const workdayUpdates: { punto_funcionid: number, jornada_estimada: number }[] = [];

  for (const req of requirements) {
    const puntosFuncion = req.punto_funcion || [];
    
    // Calculate total function points
    const pf = puntosFuncion.reduce(
      (sum, pf) => sum + (pf.cantidad_estimada || 0),
      0
    );
    
    // If no function points, set effort to zero
    if (pf === 0 || puntosFuncion.length === 0) {
      processedRequirements.push({
        requerimientoid: req.requerimientoid,
        nombrerequerimiento: req.nombrerequerimiento,
        pf: 0,
        esfuerzoEstimado: 0,
        puntosFuncion: [],
        factores: {}
      });
      continue;
    }

    // Calculate effort for each function point using pre-fetched factors
    const calculatedEfforts = await Promise.all(
      puntosFuncion.map(async (pf) => {
        const effort = await calculateEstimationFactors(pf, parametros, complejidadParam, allFactors);
        
        // Add punto_funcion to updates array if calculated effort differs from stored value
        if (pf.punto_funcionid && (pf.jornada_estimada === null || pf.jornada_estimada === undefined || Math.abs(pf.jornada_estimada - effort) > 0.001)) {
          workdayUpdates.push({
            punto_funcionid: pf.punto_funcionid,
            jornada_estimada: effort
          });
        }
        
        return effort;
      })
    );

    const totalEsfuerzo = calculatedEfforts.reduce(
      (a, b) => a + b,
      0
    );

    processedRequirements.push({
      requerimientoid: req.requerimientoid,
      nombrerequerimiento: req.nombrerequerimiento,
      pf,
      esfuerzoEstimado: totalEsfuerzo,
      puntosFuncion,
      factores: allFactors
    });
  }

  // Update the jornada_estimada values in the database if we have updates
  if (workdayUpdates.length > 0) {
    await updateEstimatedWorkdays(workdayUpdates);
  }

  return processedRequirements;
};

// Update the jornada_estimada values in the database
export const updateEstimatedWorkdays = async (
  updates: { punto_funcionid: number, jornada_estimada: number }[]
): Promise<boolean> => {
  try {
    console.log(`Updating estimated workdays for ${updates.length} function points`);
    
    // Use the RPC function to update all records in one call
    const { data, error } = await supabase.rpc('update_estimated_workdays', {
      updates: updates
    });

    if (error) {
      console.error("Error updating estimated workdays:", error);
      return false;
    }

    console.log("Successfully updated estimated workdays");
    return true;
  } catch (error) {
    console.error("Exception updating estimated workdays:", error);
    return false;
  }
};

// Fetch requirements with estimations for all needs
export const fetchRequirementsWithEstimations = async (
  needs: Need[],
  parametros: ParametroEstimacion[]
): Promise<NeedEstimation[]> => {
  return Promise.all(
    needs.map(async (need) => {
      const requirements = await fetchRequirementsForNeed(need.necesidadid);
      
      if (!requirements) {
        return {
          ...need,
          totalPF: 0,
          totalEsfuerzo: 0,
          requirements: [],
        };
      }

      const formattedRequirements = await processRequirements(requirements, parametros);

      const totalPF = formattedRequirements.reduce(
        (sum, req) => sum + req.pf,
        0
      );

      const totalEsfuerzo = formattedRequirements.reduce(
        (sum, req) => sum + req.esfuerzoEstimado,
        0
      );

      return {
        ...need,
        totalPF,
        totalEsfuerzo,
        requirements: formattedRequirements,
      };
    })
  );
};
