
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
        cantidad_estimada,
        tipo_elemento_afectado_id,
        tipo_elemento_afectado (
          nombre
        )
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

// Calculate estimation factors for a specific punto_funcion (simplified - only multiplicative)
export const calculateEstimationFactors = async (
  pf: PuntoFuncion,
  parametros: ParametroEstimacion[],
  complejidadParam: ParametroEstimacion | undefined
): Promise<number> => {
  if (!pf.tipo_elemento_afectado_id || !pf.cantidad_estimada) {
    return 0;
  }
  
  let factorComplejidad = 1;

  if (complejidadParam) {
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

  return Promise.all(
    requirements.map(async (req) => {
      const puntosFuncion = req.punto_funcion || [];
      
      // Calculate total function points
      const pf = puntosFuncion.reduce(
        (sum, pf) => sum + (pf.cantidad_estimada || 0),
        0
      );
      
      // If no function points, set effort to zero
      if (pf === 0 || puntosFuncion.length === 0) {
        return {
          requerimientoid: req.requerimientoid,
          nombrerequerimiento: req.nombrerequerimiento,
          pf: 0,
          esfuerzoEstimado: 0,
          puntosFuncion: [],
        };
      }

      const esfuerzoMultiplicativo = await Promise.all(
        puntosFuncion.map(async (pf) => 
          calculateEstimationFactors(pf, parametros, complejidadParam)
        )
      );

      const totalEsfuerzo = esfuerzoMultiplicativo.reduce(
        (a, b) => a + b,
        0
      );

      return {
        requerimientoid: req.requerimientoid,
        nombrerequerimiento: req.nombrerequerimiento,
        pf,
        esfuerzoEstimado: totalEsfuerzo,
        puntosFuncion,
      };
    })
  );
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
