
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
            <p className="text-sm font-medium">Esfuerzo: {formatNumber(requirement.esfuerzoEstimado)} hrs</p>
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
          
          {/* Cálculo detallado de esfuerzo */}
          {requirement.pf > 0 && (
            <>
              <div className="pt-3 border-t border-gray-200">
                <p className="text-sm font-medium mb-2">Desglose del cálculo de esfuerzo:</p>
                <div className="bg-white p-3 rounded border border-gray-100 text-sm">
                  <p className="mb-2 text-gray-600 text-xs">
                    El cálculo de esfuerzo se realiza aplicando factores multiplicativos por tipo de elemento y 
                    factores aditivos según los parámetros de estimación.
                  </p>
                  
                  <div className="mb-3">
                    <p className="font-medium mb-1">1. Factores multiplicativos (por elemento):</p>
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-100">
                          <th className="text-left py-1 text-gray-600">Elemento</th>
                          <th className="text-center py-1 text-gray-600">Cantidad</th>
                          <th className="text-right py-1 text-gray-600">Contribución</th>
                        </tr>
                      </thead>
                      <tbody>
                        {requirement.puntosFuncion
                          .filter(pf => pf.cantidad_estimada && pf.cantidad_estimada > 0)
                          .map((pf, idx) => (
                            <tr key={idx} className="border-b border-gray-50">
                              <td className="py-1">{pf.tipo_elemento_afectado?.nombre}</td>
                              <td className="text-center py-1">{pf.cantidad_estimada}</td>
                              <td className="text-right py-1 font-medium">
                                Factores específicos por elemento y complejidad
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                  
                  <div className="mb-3">
                    <p className="font-medium mb-1">2. Factores aditivos:</p>
                    <p className="ml-4 text-sm">
                      Los parámetros sin elementos afectados se suman como horas adicionales
                    </p>
                  </div>
                  
                  <div className="pt-2 border-t border-gray-100">
                    <p className="font-medium mb-1">Resultado del cálculo:</p>
                    <p className="ml-4">
                      <span className="text-gray-600">Total:</span> 
                      <span className="font-medium ml-2">{formatNumber(requirement.esfuerzoEstimado)} horas</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Detalle por punto de función */}
              <div className="pt-3 border-t border-gray-200">
                <p className="text-sm font-medium mb-2">Detalle por tipo de elemento:</p>
                <div className="bg-white p-3 rounded border border-gray-100 text-sm">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="text-left py-1 text-gray-600">Elemento</th>
                        <th className="text-center py-1 text-gray-600">Cantidad</th>
                      </tr>
                    </thead>
                    <tbody>
                      {requirement.puntosFuncion
                        .filter(pf => pf.cantidad_estimada && pf.cantidad_estimada > 0)
                        .map((pf, idx) => (
                          <tr key={idx} className="border-b border-gray-50">
                            <td className="py-1">{pf.tipo_elemento_afectado?.nombre}</td>
                            <td className="text-center py-1">{pf.cantidad_estimada}</td>
                          </tr>
                        ))}
                      <tr className="bg-gray-50 font-medium">
                        <td className="py-1 text-right">Total puntos función:</td>
                        <td className="text-center py-1">{formatNumber(requirement.pf)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Descripción del método de cálculo */}
              <div className="pt-3 border-t border-gray-200">
                <p className="text-sm font-medium mb-2">Método de cálculo:</p>
                <div className="bg-white p-3 rounded border border-gray-100 text-sm space-y-1">
                  <p className="text-xs text-gray-600">
                    El esfuerzo se calcula mediante un modelo que utiliza:
                  </p>
                  <ul className="list-disc pl-5 text-xs space-y-1 text-gray-600">
                    <li>Factores multiplicativos aplicados a cada elemento según su tipo y complejidad</li>
                    <li>Factores específicos por cada tipo de elemento afectado</li>
                    <li>Parámetros aditivos que agregan horas base independientes de la cantidad</li>
                    <li>Factores de complejidad que ajustan el esfuerzo según características del proyecto</li>
                  </ul>
                  <p className="text-xs mt-2">
                    <span className="font-medium">Esfuerzo total:</span> 
                    <span className="ml-2">{formatNumber(requirement.esfuerzoEstimado)} horas</span>
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
