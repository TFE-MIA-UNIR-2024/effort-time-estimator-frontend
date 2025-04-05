
import { ChevronDown, ChevronUp } from "lucide-react";

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
  // Calculate effort per function point for this requirement
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
        <div className="pl-4 py-2 space-y-3 bg-gray-50 rounded-md mb-2">
          {/* Sección de elementos afectados */}
          <div>
            <p className="text-sm font-medium mb-2">Elementos afectados:</p>
            {requirement.puntosFuncion.filter(pf => pf.cantidad_estimada && pf.cantidad_estimada > 0).length > 0 ? (
              <div className="grid grid-cols-2 gap-x-8 gap-y-1 px-2">
                {requirement.puntosFuncion
                  .filter(pf => pf.cantidad_estimada && pf.cantidad_estimada > 0)
                  .map((pf, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span>{pf.tipo_elemento_afectado?.nombre}:</span>
                      <span className="font-medium ml-2">{pf.cantidad_estimada}</span>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">No hay elementos afectados con cantidad mayor a cero</p>
            )}
          </div>
          
          {/* Cálculo detallado por punto de función */}
          {requirement.pf > 0 && (
            <>
              <div className="pt-3 border-t border-gray-200">
                <p className="text-sm font-medium mb-2">Desglose por tipo de elemento:</p>
                <div className="bg-white p-3 rounded border border-gray-100 text-sm">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="text-left py-1 text-gray-600">Elemento</th>
                        <th className="text-center py-1 text-gray-600">Cantidad</th>
                        <th className="text-center py-1 text-gray-600">Esfuerzo (hrs)</th>
                        <th className="text-right py-1 text-gray-600">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {requirement.puntosFuncion
                        .filter(pf => pf.cantidad_estimada && pf.cantidad_estimada > 0)
                        .map((pf, idx) => {
                          const subtotalEsfuerzo = (pf.cantidad_estimada || 0) * effortPerFP;
                          return (
                            <tr key={idx} className="border-b border-gray-50">
                              <td className="py-1">{pf.tipo_elemento_afectado?.nombre}</td>
                              <td className="text-center py-1">{pf.cantidad_estimada}</td>
                              <td className="text-center py-1">{formatNumber(effortPerFP)}</td>
                              <td className="text-right py-1 font-medium">{formatNumber(subtotalEsfuerzo)} hrs</td>
                            </tr>
                          );
                        })}
                      <tr className="bg-gray-50 font-medium">
                        <td colSpan={3} className="py-1 text-right">Total:</td>
                        <td className="text-right py-1">{formatNumber(requirement.esfuerzoEstimado)} hrs</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Sección de cálculo de esfuerzo */}
              <div className="pt-3 border-t border-gray-200">
                <p className="text-sm font-medium mb-2">Fórmula de cálculo:</p>
                <div className="bg-white p-3 rounded border border-gray-100 text-sm space-y-1">
                  <p>
                    <span className="text-gray-600">Total puntos función:</span> 
                    <span className="font-medium ml-2">{formatNumber(requirement.pf)} PF</span>
                  </p>
                  <p>
                    <span className="text-gray-600">Esfuerzo por punto función:</span>
                    <span className="font-medium ml-2">{formatNumber(effortPerFP)} hrs/PF</span>
                  </p>
                  <p>
                    <span className="text-gray-600">Cálculo:</span>
                    <span className="font-medium ml-2">{formatNumber(requirement.pf)} PF × {formatNumber(effortPerFP)} hrs = {formatNumber(requirement.esfuerzoEstimado)} hrs</span>
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default RequirementItem;
