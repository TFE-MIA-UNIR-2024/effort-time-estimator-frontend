
import { ChevronDown, ChevronUp, HelpCircle } from "lucide-react";
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

interface RequirementItemProps {
  requirement: {
    requerimientoid: number;
    nombrerequerimiento: string;
    pf: number;
    esfuerzoEstimado: number;
    puntosFuncion: PuntoFuncion[];
  };
  expanded: boolean;
  onToggle: () => void;
  formatNumber: (num: number) => string;
}

const RequirementItem = ({ requirement, expanded, onToggle, formatNumber }: RequirementItemProps) => {
  // Calculate effort per function point for this requirement (if there are PF)
  const effortPerFP = requirement.pf > 0 ? (requirement.esfuerzoEstimado / requirement.pf) : 0;

  return (
    <div className="border-t pt-2 mt-2">
      <div 
        className="flex justify-between items-center py-2 cursor-pointer hover:bg-gray-50 px-2 rounded transition-colors"
        onClick={onToggle}
      >
        <div>
          <p className="font-medium truncate max-w-[300px]">{requirement.nombrerequerimiento}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex flex-col items-end">
            <p className="text-sm">PF: {formatNumber(requirement.pf)}</p>
            <div className="flex items-center">
              <p className="text-sm font-medium">Esfuerzo: {formatNumber(requirement.esfuerzoEstimado)} hrs</p>
              {requirement.pf > 0 && (
                <p className="text-xs text-muted-foreground ml-1">
                  ({formatNumber(effortPerFP)} hrs/PF)
                </p>
              )}
            </div>
          </div>
          {expanded ? 
            <ChevronUp className="h-4 w-4" /> : 
            <ChevronDown className="h-4 w-4" />
          }
        </div>
      </div>
      
      {expanded && (
        <div className="pl-4 py-2 space-y-2 bg-gray-50 rounded-md mb-2">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium">Elementos afectados:</p>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center text-muted-foreground cursor-help">
                    <HelpCircle className="h-4 w-4 mr-1" />
                    <span className="text-xs">Cómo se calcula</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent className="max-w-sm p-4">
                  <p className="text-sm font-medium mb-2">Fórmula de cálculo:</p>
                  <p className="text-xs mb-2">Para cada tipo de elemento se multiplica:</p>
                  <p className="text-xs">Cantidad × Factor del tipo × Factor de complejidad</p>
                  <div className="mt-2 pt-2 border-t border-gray-200">
                    <p className="text-xs">Esfuerzo total: {formatNumber(requirement.esfuerzoEstimado)} hrs</p>
                    <p className="text-xs">Puntos función: {formatNumber(requirement.pf)}</p>
                    <p className="text-xs">Esfuerzo por PF: {formatNumber(effortPerFP)} hrs/PF</p>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          
          {requirement.puntosFuncion.filter(pf => pf.cantidad_estimada && pf.cantidad_estimada > 0).length > 0 ? (
            <div className="border rounded-md bg-white overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Elemento</th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">Cantidad</th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">Contribución</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {requirement.puntosFuncion
                    .filter(pf => pf.cantidad_estimada && pf.cantidad_estimada > 0)
                    .map((pf, idx) => {
                      // Estimate contribution to total effort (simple approximation)
                      const contribution = requirement.pf > 0 
                        ? (pf.cantidad_estimada || 0) / requirement.pf * requirement.esfuerzoEstimado 
                        : 0;
                        
                      return (
                        <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-3 py-2 text-sm">{pf.tipo_elemento_afectado?.nombre}</td>
                          <td className="px-3 py-2 text-sm text-right">{pf.cantidad_estimada}</td>
                          <td className="px-3 py-2 text-sm font-medium text-right">
                            ≈ {formatNumber(contribution)} hrs
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
                <tfoot className="bg-gray-100">
                  <tr>
                    <td className="px-3 py-2 text-sm font-medium">Total</td>
                    <td className="px-3 py-2 text-sm font-medium text-right">{formatNumber(requirement.pf)}</td>
                    <td className="px-3 py-2 text-sm font-medium text-right">
                      {formatNumber(requirement.esfuerzoEstimado)} hrs
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          ) : (
            <p className="text-sm text-gray-500 italic">No hay elementos afectados con cantidad mayor a cero</p>
          )}
        </div>
      )}
    </div>
  );
};

export default RequirementItem;
