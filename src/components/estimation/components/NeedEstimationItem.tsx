
import { useState } from "react";
import { ChevronDown, ChevronUp, AlertCircle } from "lucide-react";
import RequirementItem from "./RequirementItem";

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
  factores?: {
    [key: number]: {
      factor_ia: number;
      nombre: string;
    }
  };
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
            <AlertCircle 
              className="h-4 w-4 text-amber-500" 
              aria-label="Sin esfuerzo estimado" 
            />
          )}
        </div>
        <div className="flex flex-col items-end">
          <div className="flex items-center gap-2">
            <p className="text-sm">Puntos de función: {formatNumber(need.totalPF)}</p>
          </div>
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium">Esfuerzo: {formatNumber(need.totalEsfuerzo)} jornada</p>
            {hasAnyFunctionPoints && (
              <p className="text-xs text-muted-foreground">
                ({formatNumber(effortPerFP)} jornada/PF)
              </p>
            )}
            {expanded ? 
              <ChevronUp className="h-4 w-4" /> : 
              <ChevronDown className="h-4 w-4" />
            }
          </div>
        </div>
      </div>

      {expanded && (
        <div className="px-4 pb-2">
          {need.requirements.length > 0 ? (
            need.requirements.map((req) => (
              <RequirementItem
                key={req.requerimientoid}
                requirement={req}
                expanded={expandedRequirements.has(req.requerimientoid)}
                onToggle={() => toggleRequirement(req.requerimientoid)}
                formatNumber={formatNumber}
              />
            ))
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
