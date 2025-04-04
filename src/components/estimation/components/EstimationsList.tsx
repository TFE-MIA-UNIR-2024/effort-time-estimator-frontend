
import { useState } from "react";
import NeedEstimationItem from "./NeedEstimationItem";

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

interface EstimationsListProps {
  needsEstimations: NeedEstimation[];
  formatNumber: (num: number) => string;
}

const EstimationsList = ({ needsEstimations, formatNumber }: EstimationsListProps) => {
  const [expandedNeeds, setExpandedNeeds] = useState<Set<number>>(new Set());

  const toggleNeed = (needId: number) => {
    setExpandedNeeds(prevExpanded => {
      const newExpanded = new Set(prevExpanded);
      if (newExpanded.has(needId)) {
        newExpanded.delete(needId);
      } else {
        newExpanded.add(needId);
      }
      return newExpanded;
    });
  };

  if (needsEstimations.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No hay necesidades o estimaciones disponibles</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {needsEstimations.map((need) => (
        <NeedEstimationItem
          key={need.necesidadid}
          need={need}
          expanded={expandedNeeds.has(need.necesidadid)}
          onToggle={() => toggleNeed(need.necesidadid)}
          formatNumber={formatNumber}
        />
      ))}
    </div>
  );
};

export default EstimationsList;
