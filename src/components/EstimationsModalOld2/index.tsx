import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ChevronDown, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import {
  EstimationsModalProps,
  NeedEstimation,
  ParametroEstimacion,
} from "./types";
import { calculateHours } from "./helpers";

export function EstimationsModal({
  isOpen,
  onClose,
  projectId,
}: EstimationsModalProps) {
  const [needsEstimations, setNeedsEstimations] = useState<NeedEstimation[]>(
    []
  );
  const [expandedNeeds, setExpandedNeeds] = useState<Record<number, boolean>>(
    {}
  );
  const [loading, setLoading] = useState(true);
  const [expandedDetails, setExpandedDetails] = useState<
    Record<number, boolean>
  >({});
  const [parametros, setParametros] = useState<ParametroEstimacion[]>([]);
  const [parametrosPorRequerimiento, setParametrosPorRequerimiento] = useState<
    Record<number, ParametroEstimacion[]>
  >({});

  const fetchEstimations = async () => {
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
        .limit(6);

      if (paramError) throw paramError;
      setParametros(parametrosData);

      const { data: needs, error: needsError } = await supabase
        .from("necesidad")
        .select("necesidadid, nombrenecesidad")
        .eq("proyectoid", projectId);

      if (needsError) throw needsError;

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

          if (reqError) throw reqError;

          const formattedRequirements = await Promise.all(
            requirements.map(async (req) => {
              // ... existente lógica de procesamiento de requerimientos ...
              return {
                requerimientoid: req.requerimientoid,
                nombrerequerimiento: req.nombrerequerimiento,
                pf: calculatePF(req.punto_funcion),
                esfuerzoEstimado: await calculateEsfuerzo(
                  req.punto_funcion,
                  parametrosData
                ),
                puntosFuncion: req.punto_funcion || [],
              };
            })
          );

          return {
            ...need,
            totalPF: formattedRequirements.reduce(
              (sum, req) => sum + req.pf,
              0
            ),
            totalEsfuerzo: formattedRequirements.reduce(
              (sum, req) => sum + req.esfuerzoEstimado,
              0
            ),
            requirements: formattedRequirements,
          };
        })
      );

      setNeedsEstimations(needsWithEstimations);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculatePF = (puntosFuncion: any[]) => {
    return (
      puntosFuncion?.reduce(
        (sum, pf) => sum + (pf.cantidad_estimada || 0),
        0
      ) || 0
    );
  };

  const calculateEsfuerzo = async (
    puntosFuncion: any[],
    parametros: ParametroEstimacion[]
  ) => {
    const complejidadParam = parametros.find(
      (p) => p.tipo_parametro_estimacion?.nombre === "Complejidad"
    );

    const parametrosMultiplicar = parametros.filter(
      (p) =>
        p.tipo_parametro_estimacion?.haselementosafectados &&
        p.tipo_parametro_estimacion?.nombre !== "Complejidad"
    );

    const parametrosSumar = parametros.filter(
      (p) => !p.tipo_parametro_estimacion?.haselementosafectados
    );

    const esfuerzoMultiplicativo = await Promise.all(
      puntosFuncion.map(async (pf) => {
        let factorComplejidad = 1;

        if (complejidadParam) {
          const { data: elementoAfectado } = await supabase
            .from("elemento_afectado")
            .select("factor, factor_ia")
            .eq("tipo_elemento_afectado_id", pf.tipo_elemento_afectado_id)
            .eq(
              "parametro_estimacion_id",
              complejidadParam.parametro_estimacionid
            )
            .single();

          if (elementoAfectado) {
            factorComplejidad =
              elementoAfectado.factor_ia || elementoAfectado.factor || 1;
          }
        }

        return parametrosMultiplicar.reduce((sum, param) => {
          const factorToUse = param.factor_ia || param.factor;
          return sum + pf.cantidad_estimada * factorToUse * factorComplejidad;
        }, 0);
      })
    );

    const totalEsfuerzoMultiplicativo = esfuerzoMultiplicativo.reduce(
      (a, b) => a + b,
      0
    );
    const esfuerzoAditivo = parametrosSumar.reduce((sum, param) => {
      const factorToUse = param.factor_ia || param.factor;
      return sum + factorToUse;
    }, 0);

    return totalEsfuerzoMultiplicativo + esfuerzoAditivo;
  };

  useEffect(() => {
    if (isOpen) {
      fetchEstimations();
    }
  }, [isOpen, projectId]);

  // ... resto del componente (toggleNeed, toggleDetails, renderSkeleton, renderContent) igual que antes ...

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[80vh] flex flex-col">
        {/* ... contenido existente ... */}
      </DialogContent>
    </Dialog>
  );
}
