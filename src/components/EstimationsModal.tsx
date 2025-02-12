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

interface EstimationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: number;
}

interface NeedEstimation {
  necesidadid: number;
  nombrenecesidad: string;
  totalPF: number;
  totalEsfuerzo: number;
  requirements: {
    requerimientoid: number;
    nombrerequerimiento: string;
    pf: number;
    esfuerzoEstimado: number;
    puntosFuncion: Array<{
      cantidad_estimada: number;
      tipo_elemento_afectado_id: number;
    }>;
  }[];
}

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

  useEffect(() => {
    if (isOpen) {
      fetchEstimations();
    }
  }, [isOpen, projectId]);

  const fetchEstimations = async () => {
    setLoading(true);
    const { data: needs, error: needsError } = await supabase
      .from("necesidad")
      .select("necesidadid, nombrenecesidad")
      .eq("proyectoid", projectId);

    if (needsError) {
      console.error("Error fetching needs:", needsError);
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
              tipo_elemento_afectado_id
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

        const { data: parametros, error: paramError } = await supabase
          .from("parametro_estimacion")
          .select(
            `
            parametro_estimacionid, 
            factor, 
            factor_ia,
            tipo_parametro_estimacion (
              nombre,
              haselementosafectados
            )
          `
          )
          .limit(6);

        if (paramError) {
          console.error("Error fetching estimation parameters:", paramError);
          return {
            ...need,
            totalPF: 0,
            totalEsfuerzo: 0,
            requirements: [],
          };
        }

        const complejidadParam = parametros.find(
          (p) => p.tipo_parametro_estimacion?.nombre === "Complejidad"
        );

        const formattedRequirements = await Promise.all(
          requirements.map(async (req) => {
            const puntosFuncion = req.punto_funcion || [];
            const pf = puntosFuncion.reduce(
              (sum, pf) => sum + (pf.cantidad_estimada || 0),
              0
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
                    .eq(
                      "tipo_elemento_afectado_id",
                      pf.tipo_elemento_afectado_id
                    )
                    .eq(
                      "parametro_estimacion_id",
                      complejidadParam.parametro_estimacionid
                    )
                    .single();

                  if (elementoAfectado) {
                    factorComplejidad =
                      elementoAfectado.factor_ia ||
                      elementoAfectado.factor ||
                      1;
                  }
                }

                const factoresMultiplicativos = parametrosMultiplicar.reduce(
                  (sum, param) => {
                    const factorToUse = param.factor_ia || param.factor;
                    return (
                      sum +
                      pf.cantidad_estimada * factorToUse * factorComplejidad
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
              const factorToUse = param.factor_ia || param.factor;
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
    setLoading(false);
  };

  const toggleNeed = (needId: number) => {
    setExpandedNeeds((prev) => ({
      ...prev,
      [needId]: !prev[needId],
    }));
  };

  const renderSkeleton = () => (
    <>
      {[1, 2, 3].map((i) => (
        <div key={i} className="border rounded-lg p-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-24" />
            </div>
            <div className="flex items-center gap-4">
              <div>
                <Skeleton className="h-4 w-24 mb-1" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
          </div>
        </div>
      ))}
    </>
  );

  const calculateHours = (esfuerzo: number) => esfuerzo * 8;

  const renderContent = () => {
    const sortedNeeds = [...needsEstimations].sort((a, b) => {
      const aComplete = a.requirements.every((req) => req.pf > 0);
      const bComplete = b.requirements.every((req) => req.pf > 0);

      if (aComplete === bComplete) {
        return b.totalEsfuerzo - a.totalEsfuerzo;
      }
      return aComplete ? -1 : 1;
    });

    return (
      <>
        {sortedNeeds.map((need) => {
          const allEstimated = need.requirements.every((req) => req.pf > 0);
          return (
            <div key={need.necesidadid} className="border rounded-lg p-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{need.nombrenecesidad}</span>
                  <span className="text-xs text-muted-foreground">
                    ({need.requirements.length} requerimientos)
                  </span>
                  {need.requirements.length > 0 && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          {allEstimated ? (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-yellow-500" />
                          )}
                        </TooltipTrigger>
                        <TooltipContent>
                          {allEstimated
                            ? "Todos los requerimientos han sido estimados"
                            : "Hay requerimientos pendientes de estimar"}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-sm text-muted-foreground">
                    <div>
                      Total Cantidad de elementos: {need.totalPF.toFixed(2)}
                    </div>
                    <div>Esfuerzo: {need.totalEsfuerzo.toFixed(2)}</div>
                    <div>
                      Horas: {calculateHours(need.totalEsfuerzo).toFixed(2)}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleNeed(need.necesidadid)}
                  >
                    <ChevronDown
                      className={`h-4 w-4 transform transition-transform ${
                        expandedNeeds[need.necesidadid] ? "rotate-180" : ""
                      }`}
                    />
                  </Button>
                </div>
              </div>
              {expandedNeeds[need.necesidadid] && (
                <div className="mt-4 space-y-3">
                  {need.requirements.map((req) => (
                    <div
                      key={req.requerimientoid}
                      className="flex justify-between items-start gap-4 pl-4 py-2 text-sm border-b last:border-0"
                    >
                      <span className="flex-1">{req.nombrerequerimiento}</span>
                      <div className="text-muted-foreground text-right min-w-[120px]">
                        <div className="mb-1">
                          Cantidad de elementos: {req.pf.toFixed(2)}
                        </div>
                        <div className="mb-1">
                          Esfuerzo: {req.esfuerzoEstimado.toFixed(2)}
                        </div>
                        <div>
                          Horas:{" "}
                          {calculateHours(req.esfuerzoEstimado).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-4">
            <span>Project Estimations</span>
            <div className="text-sm text-muted-foreground flex flex-col">
              {loading ? (
                <>
                  <Skeleton className="h-4 w-32 mb-1" />
                  <Skeleton className="h-4 w-32" />
                </>
              ) : (
                <>
                  <span>
                    Esfuerzo total:{" "}
                    {needsEstimations
                      .reduce((sum, need) => sum + need.totalEsfuerzo, 0)
                      .toFixed(2)}
                  </span>
                  <span>
                    Esfuerzo (horas):{" "}
                    {calculateHours(
                      needsEstimations.reduce(
                        (sum, need) => sum + need.totalEsfuerzo,
                        0
                      )
                    ).toFixed(2)}
                  </span>
                </>
              )}
            </div>
          </DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto">
          <div className="space-y-4 p-1">
            {loading ? renderSkeleton() : renderContent()}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
