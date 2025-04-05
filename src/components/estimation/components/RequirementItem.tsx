
import { ChevronDown, ChevronUp, HelpCircle } from "lucide-react";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface PuntoFuncion {
  cantidad_estimada: number | null;
  tipo_elemento_afectado_id: number | null;
  tipo_elemento_afectado: {
    nombre: string;
  } | null;
  factor_multiplicativo?: number;
}

interface RequirementItemProps {
  requirement: {
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
  };
  expanded: boolean;
  onToggle: () => void;
  formatNumber: (num: number) => string;
}

const RequirementItem = ({ requirement, expanded, onToggle, formatNumber }: RequirementItemProps) => {
  // Calculate effort per function point for this requirement (if there are PF)
  const effortPerFP = requirement.pf > 0 ? (requirement.esfuerzoEstimado / requirement.pf) : 0;

  // Filter function points with values > 0
  const activePuntosFuncion = requirement.puntosFuncion.filter(pf => 
    pf.cantidad_estimada && pf.cantidad_estimada > 0
  );

  // Calculate the accurate total for the displayed table
  const calculateTableTotal = () => {
    return activePuntosFuncion.reduce((total, pf) => {
      const elementId = pf.tipo_elemento_afectado_id;
      const factor = requirement.factores && elementId ? 
        requirement.factores[elementId]?.factor_ia || 1 : 1;
      return total + ((pf.cantidad_estimada || 0) * factor);
    }, 0);
  };

  const tableTotal = calculateTableTotal();
  
  // Convert workdays to hours (8 hours per workday)
  const workdayToHours = (workdays: number) => workdays * 8;

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
              <p className="text-sm font-medium">Esfuerzo: {formatNumber(requirement.esfuerzoEstimado)} jornada</p>
              {requirement.pf > 0 && (
                <p className="text-xs text-muted-foreground ml-1">
                  ({formatNumber(effortPerFP)} jornada/PF)
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
          <div className="flex justify-between items-start px-2">
            <p className="text-sm font-medium">Elementos afectados:</p>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="cursor-help">
                    <HelpCircle className="h-4 w-4 text-muted-foreground" />
                  </div>
                </TooltipTrigger>
                <TooltipContent className="max-w-[300px]">
                  <p className="text-xs">
                    El esfuerzo se calcula multiplicando la cantidad de cada elemento por su factor correspondiente
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          
          {activePuntosFuncion.length > 0 ? (
            <div className="px-2">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="py-1 px-2 text-xs">Elemento</TableHead>
                    <TableHead className="py-1 px-2 text-xs">Cantidad</TableHead>
                    <TableHead className="py-1 px-2 text-xs">
                      <div className="flex items-center gap-1">
                        Factor
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="cursor-help">
                                <HelpCircle className="h-3 w-3 text-muted-foreground" />
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="text-xs">Factor de complejidad asociado a este elemento</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </TableHead>
                    <TableHead className="py-1 px-2 text-xs text-right">Esfuerzo</TableHead>
                    <TableHead className="py-1 px-2 text-xs text-right">Horas (x8)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activePuntosFuncion.map((pf, idx) => {
                    const elementId = pf.tipo_elemento_afectado_id;
                    const factor = requirement.factores && elementId ? 
                      requirement.factores[elementId]?.factor_ia || 1 : 1;
                    const calculatedEffort = (pf.cantidad_estimada || 0) * factor;
                    const calculatedHours = workdayToHours(calculatedEffort);
                    
                    return (
                      <TableRow key={idx} className="hover:bg-white">
                        <TableCell className="py-1 px-2 text-xs">{pf.tipo_elemento_afectado?.nombre}</TableCell>
                        <TableCell className="py-1 px-2 text-xs">{pf.cantidad_estimada}</TableCell>
                        <TableCell className="py-1 px-2 text-xs">{formatNumber(factor)}</TableCell>
                        <TableCell className="py-1 px-2 text-xs text-right font-medium">
                          {formatNumber(calculatedEffort)} jornada
                          <div className="text-[10px] text-muted-foreground">
                            {pf.cantidad_estimada} × {formatNumber(factor)}
                          </div>
                        </TableCell>
                        <TableCell className="py-1 px-2 text-xs text-right font-medium">
                          {formatNumber(calculatedHours)} hrs
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  <TableRow>
                    <TableCell colSpan={3} className="py-1 px-2 text-xs text-right font-medium">
                      Total:
                    </TableCell>
                    <TableCell className="py-1 px-2 text-xs text-right font-medium">
                      {formatNumber(tableTotal)} jornada
                    </TableCell>
                    <TableCell className="py-1 px-2 text-xs text-right font-medium">
                      {formatNumber(workdayToHours(tableTotal))} hrs
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-sm text-gray-500 italic px-2">No hay elementos afectados con cantidad mayor a cero</p>
          )}
        </div>
      )}
    </div>
  );
};

export default RequirementItem;
