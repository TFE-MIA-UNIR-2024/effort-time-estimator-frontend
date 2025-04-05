
import { useState } from "react";
import { ChevronDown, ChevronUp, AlertCircle, Info } from "lucide-react";
import RequirementItem from "./RequirementItem";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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

interface NeedEstimationItemProps {
  need: {
    necesidadid: number;
    nombrenecesidad: string;
    totalPF: number;
    totalEsfuerzo: number;
    requirements: Requirement[];
  };
  expanded: boolean;
  onToggle: () => void;
  formatNumber: (num: number) => string;
}

const NeedEstimationItem = ({ need, expanded, onToggle, formatNumber }: NeedEstimationItemProps) => {
  const [expandedRequirements, setExpandedRequirements] = useState<Set<number>>(new Set());

  const toggleRequirement = (reqId: number) => {
    setExpandedRequirements(prevExpanded => {
      const newExpanded = new Set(prevExpanded);
      if (newExpanded.has(reqId)) {
        newExpanded.delete(reqId);
      } else {
        newExpanded.add(reqId);
      }
      return newExpanded;
    });
  };

  // Check if this need has any requirements with function points
  const hasAnyFunctionPoints = need.totalPF > 0;
  
  // Calculate effort per function point ratio
  const effortPerFP = hasAnyFunctionPoints ? (need.totalEsfuerzo / need.totalPF) : 0;

  return (
    <div className="border rounded-lg overflow-hidden shadow-sm">
      <div 
        className="flex justify-between items-center p-4 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center gap-2">
          <span className="font-medium truncate max-w-[200px]">
            {need.nombrenecesidad}
          </span>
          <span className="text-sm text-muted-foreground">
            ({need.requirements.length} requerimientos)
          </span>
          {need.totalEsfuerzo === 0 && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <AlertCircle 
                    className="h-4 w-4 text-amber-500 cursor-help" 
                  />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-sm">Sin esfuerzo estimado</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        <div className="flex flex-col items-end">
          <div className="flex items-center gap-2">
            <p className="text-sm">Puntos de función: {formatNumber(need.totalPF)}</p>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-sm">Suma de todos los elementos afectados</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium">Esfuerzo: {formatNumber(need.totalEsfuerzo)} hrs</p>
            {hasAnyFunctionPoints && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <p className="text-xs text-muted-foreground cursor-help">
                      ({formatNumber(effortPerFP)} hrs/PF)
                    </p>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-sm">Esfuerzo por punto de función</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            {expanded ? 
              <ChevronUp className="h-4 w-4" /> : 
              <ChevronDown className="h-4 w-4" />
            }
          </div>
        </div>
      </div>

      {expanded && (
        <div className="px-4 pb-4">
          {need.requirements.length > 0 ? (
            <>
              <div className="pt-3 pb-2">
                <div className="bg-blue-50 border border-blue-100 px-4 py-3 rounded-md">
                  <h4 className="text-sm font-medium text-blue-800 flex items-center mb-1">
                    <Info className="h-4 w-4 mr-2" />
                    Información del cálculo
                  </h4>
                  <p className="text-xs text-blue-700">
                    El cálculo se basa en la suma de esfuerzos por cada requerimiento. 
                    Cada requerimiento combina los elementos afectados multiplicados por 
                    sus factores correspondientes.
                  </p>
                </div>
              </div>
              {need.requirements.map((req) => (
                <RequirementItem
                  key={req.requerimientoid}
                  requirement={req}
                  expanded={expandedRequirements.has(req.requerimientoid)}
                  onToggle={() => toggleRequirement(req.requerimientoid)}
                  formatNumber={formatNumber}
                />
              ))}
            </>
          ) : (
            <div className="py-3 text-center text-sm text-muted-foreground">
              No hay requerimientos con estimaciones.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NeedEstimationItem;
