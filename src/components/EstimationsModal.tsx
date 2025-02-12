import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

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

  useEffect(() => {
    if (isOpen) {
      fetchEstimations();
    }
  }, [isOpen, projectId]);

  const fetchEstimations = async () => {
    const { data: needs, error: needsError } = await supabase
      .from("necesidad")
      .select("necesidadid, nombrenecesidad")
      .eq("proyectoid", projectId);

    if (needsError) {
      console.error("Error fetching needs:", needsError);
      return;
    }

    const needsWithEstimations = await Promise.all(
      needs.map(async (need) => {
        // Obtener requerimientos con sus puntos de función
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

        // Obtener los 6 parámetros de estimación
        const { data: parametros, error: paramError } = await supabase
          .from("parametro_estimacion")
          .select("parametro_estimacionid, factor, factor_ia")
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

        const formattedRequirements = requirements.map((req) => {
          const puntosFuncion = req.punto_funcion || [];
          const pf = puntosFuncion.reduce(
            (sum, pf) => sum + (pf.cantidad_estimada || 0),
            0
          );

          // Calcular esfuerzo estimado multiplicando cada punto de función por los 6 factores
          const esfuerzoEstimado = puntosFuncion.reduce((total, pf) => {
            return (
              total +
              parametros.reduce((sum, param) => {
                const factorToUse = param.factor_ia || param.factor;
                return sum + pf.cantidad_estimada * factorToUse;
              }, 0)
            );
          }, 0);

          return {
            requerimientoid: req.requerimientoid,
            nombrerequerimiento: req.nombrerequerimiento,
            pf,
            esfuerzoEstimado,
            puntosFuncion,
          };
        });

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
  };

  const toggleNeed = (needId: number) => {
    setExpandedNeeds((prev) => ({
      ...prev,
      [needId]: !prev[needId],
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-4">
            <span>Project Estimations</span>
            <span className="text-sm text-muted-foreground">
              Esfuerzo total:{" "}
              {needsEstimations
                .reduce((sum, need) => sum + need.totalEsfuerzo, 0)
                .toFixed(2)}
            </span>
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-4 overflow-y-auto pr-2">
          {needsEstimations.map((need) => (
            <div key={need.necesidadid} className="border rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span className="font-medium">{need.nombrenecesidad}</span>
                <div className="flex items-center gap-4">
                  <div className="text-sm text-muted-foreground">
                    <div>Total PF: {need.totalPF.toFixed(2)}</div>
                    <div>Esfuerzo: {need.totalEsfuerzo.toFixed(2)}</div>
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
                        <div className="mb-1">PF: {req.pf.toFixed(2)}</div>
                        <div>Esfuerzo: {req.esfuerzoEstimado.toFixed(2)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
