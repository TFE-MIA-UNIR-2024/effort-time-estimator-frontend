
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface ParametroEstimacion {
  parametro_estimacionid: number;
  nombre: string;
  factor: number | null;
  factor_ia: number | null;
  tipo_parametro_estimacion: {
    nombre: string;
    haselementosafectados: boolean;
  } | null;
}

interface PuntoFuncion {
  cantidad_estimada: number | null;
  tipo_elemento_afectado_id: number | null;
  tipo_elemento_afectado: {
    nombre: string;
  } | null;
}

interface Requirement {
  requerimientoid: number;
  nombrerequerimiento: string;
  pf: number;
  esfuerzoEstimado: number;
  puntosFuncion: PuntoFuncion[];
}

interface NeedEstimation {
  necesidadid: number;
  nombrenecesidad: string;
  totalPF: number;
  totalEsfuerzo: number;
  requirements: Requirement[];
}

export const useEstimationCalculation = (projectId: number, open: boolean) => {
  const [needsEstimations, setNeedsEstimations] = useState<NeedEstimation[]>([]);
  const [parametros, setParametros] = useState<ParametroEstimacion[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalProjectHours, setTotalProjectHours] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();

  const fetchEstimations = useCallback(async () => {
    setLoading(true);
    try {
      // Obtener parámetros primero
      const { data: parametrosData, error: paramError } = await supabase
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

      if (paramError) throw paramError;
      setParametros(parametrosData || []);

      const { data: needs, error: needsError } = await supabase
        .from("necesidad")
        .select("necesidadid, nombrenecesidad")
        .eq("proyectoid", projectId);

      if (needsError) {
        console.error("Error fetching needs:", needsError);
        toast({
          title: "Error",
          description: "No se pudieron cargar las necesidades",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      if (!needs || needs.length === 0) {
        setNeedsEstimations([]);
        setLoading(false);
        return;
      }

      const needsWithEstimations = await Promise.all(
        needs.map(async (need) => {
          const { data: requirements, error: reqError } = await supabase
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
            .eq("necesidadid", need.necesidadid);

          if (reqError) {
            console.error("Error fetching requirements:", reqError);
            return {
              ...need,
              totalPF: 0,
              totalEsfuerzo: 0,
              requirements: [],
            };
          }

          const complejidadParam = parametrosData?.find(
            (p) => p.tipo_parametro_estimacion?.nombre === "Complejidad"
          );

          const formattedRequirements = await Promise.all(
            (requirements || []).map(async (req) => {
              const puntosFuncion = req.punto_funcion || [];
              const pf = puntosFuncion.reduce(
                (sum, pf) => sum + (pf.cantidad_estimada || 0),
                0
              );

              const parametrosMultiplicar = parametrosData?.filter(
                (p) =>
                  p.tipo_parametro_estimacion?.haselementosafectados &&
                  p.tipo_parametro_estimacion?.nombre !== "Complejidad"
              ) || [];
              
              const parametrosSumar = parametrosData?.filter(
                (p) => !p.tipo_parametro_estimacion?.haselementosafectados
              ) || [];

              const esfuerzoMultiplicativo = await Promise.all(
                puntosFuncion.map(async (pf) => {
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
                })
              );

              const totalEsfuerzoMultiplicativo = esfuerzoMultiplicativo.reduce(
                (a, b) => a + b,
                0
              );

              const esfuerzoAditivo = parametrosSumar.reduce((sum, param) => {
                const factorToUse = param.factor_ia || param.factor || 0;
                return sum + factorToUse;
              }, 0);

              const esfuerzoEstimado =
                totalEsfuerzoMultiplicativo + esfuerzoAditivo;

              return {
                requerimientoid: req.requerimientoid,
                nombrerequerimiento: req.nombrerequerimiento,
                pf,
                esfuerzoEstimado,
                puntosFuncion,
              };
            })
          );

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

      setNeedsEstimations(needsWithEstimations);
      
      // Calculate project total
      const projectTotal = needsWithEstimations.reduce(
        (sum, need) => sum + need.totalEsfuerzo, 
        0
      );
      setTotalProjectHours(projectTotal);
      
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las estimaciones",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [projectId, toast]);

  useEffect(() => {
    if (open) {
      fetchEstimations();
    }
  }, [open, fetchEstimations]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchEstimations();
  };

  // Format number to always show with 2 decimal places
  const formatNumber = (num: number) => {
    return num.toFixed(2);
  };

  return {
    needsEstimations,
    loading,
    refreshing,
    totalProjectHours,
    handleRefresh,
    formatNumber
  };
};
