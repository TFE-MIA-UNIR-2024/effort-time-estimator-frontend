
import { useState, useEffect } from "react";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
} from "@/components/ui/sheet";
import { ChevronDown, ChevronUp, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface Need {
  necesidadid: number;
  nombrenecesidad: string;
  requirements: Requirement[];
  totalElements: number;
  totalEffort: number;
}

interface Requirement {
  requerimientoid: number;
  nombrerequerimiento: string;
  elements: AffectedElement[];
  totalElements: number;
  totalEffort: number;
}

interface AffectedElement {
  elemento_afectadoid: number;
  nombre: string;
  cantidad_estimada: number;
}

interface ProjectEstimationsSheetProps {
  projectId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ProjectEstimationsSheet = ({ projectId, open, onOpenChange }: ProjectEstimationsSheetProps) => {
  const [needs, setNeeds] = useState<Need[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedNeeds, setExpandedNeeds] = useState<Set<number>>(new Set());
  const [expandedRequirements, setExpandedRequirements] = useState<Set<number>>(new Set());
  const [totalProjectEffort, setTotalProjectEffort] = useState(0);
  const [totalProjectHours, setTotalProjectHours] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      fetchEstimationData();
    }
  }, [open, projectId]);

  const fetchEstimationData = async () => {
    try {
      setLoading(true);
      
      // 1. Fetch all needs for this project
      const { data: needsData, error: needsError } = await supabase
        .from('necesidad')
        .select('necesidadid, nombrenecesidad')
        .eq('proyectoid', projectId);
      
      if (needsError) throw needsError;

      const needsWithRequirements: Need[] = [];
      let projectTotalEffort = 0;
      
      // 2. For each need, fetch its requirements
      for (const need of needsData || []) {
        const { data: requirementsData, error: requirementsError } = await supabase
          .from('requerimiento')
          .select('requerimientoid, nombrerequerimiento')
          .eq('necesidadid', need.necesidadid);
        
        if (requirementsError) throw requirementsError;
        
        const requirementsWithElements: Requirement[] = [];
        let needTotalEffort = 0;
        let needTotalElements = 0;
        
        // 3. For each requirement, fetch its affected elements
        for (const req of requirementsData || []) {
          const { data: elementsData, error: elementsError } = await supabase
            .from('punto_funcion')
            .select(`
              punto_funcionid,
              cantidad_estimada,
              tipo_elemento_afectado:tipo_elemento_afectado_id(
                tipo_elemento_afectadoid,
                nombre
              )
            `)
            .eq('requerimientoid', req.requerimientoid)
            .not('tipo_elemento_afectado_id', 'is', null);
          
          if (elementsError) throw elementsError;
          
          const formattedElements: AffectedElement[] = elementsData
            ?.filter(item => item.tipo_elemento_afectado)
            .map(item => ({
              elemento_afectadoid: item.tipo_elemento_afectado.tipo_elemento_afectadoid,
              nombre: item.tipo_elemento_afectado.nombre,
              cantidad_estimada: item.cantidad_estimada || 0
            })) || [];
          
          const reqTotalElements = formattedElements.reduce((sum, elem) => sum + elem.cantidad_estimada, 0);
          // Calculate effort as 1.5 hours per element (simplified formula)
          const reqTotalEffort = reqTotalElements * 1.5;
          
          needTotalElements += reqTotalElements;
          needTotalEffort += reqTotalEffort;
          
          requirementsWithElements.push({
            requerimientoid: req.requerimientoid,
            nombrerequerimiento: req.nombrerequerimiento,
            elements: formattedElements,
            totalElements: reqTotalElements,
            totalEffort: reqTotalEffort
          });
        }
        
        projectTotalEffort += needTotalEffort;
        
        needsWithRequirements.push({
          necesidadid: need.necesidadid,
          nombrenecesidad: need.nombrenecesidad,
          requirements: requirementsWithElements,
          totalElements: needTotalElements,
          totalEffort: needTotalEffort
        });
      }
      
      setNeeds(needsWithRequirements);
      setTotalProjectEffort(projectTotalEffort);
      setTotalProjectHours(projectTotalEffort);
    } catch (error) {
      console.error('Error fetching estimation data:', error);
      toast({
        title: "Error",
        description: "No se pudo cargar los datos de estimación",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

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

  // Format number to always show with 2 decimal places
  const formatNumber = (num: number) => {
    return num.toFixed(2);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[720px] overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle>Project Estimations</SheetTitle>
        </SheetHeader>

        {loading ? (
          <div className="flex items-center justify-center h-40">
            <p>Cargando estimaciones...</p>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <p className="text-lg font-medium">Esfuerzo total: {formatNumber(totalProjectEffort)}</p>
              <p className="text-sm text-gray-500">Esfuerzo (horas): {formatNumber(totalProjectHours)}</p>
            </div>

            <div className="space-y-4">
              {needs.map((need) => (
                <div key={need.necesidadid} className="border rounded-lg overflow-hidden">
                  <div 
                    className="flex justify-between items-center p-4 bg-gray-50 cursor-pointer"
                    onClick={() => toggleNeed(need.necesidadid)}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        Necesidad {need.necesidadid}
                      </span>
                      <span>
                        ({need.requirements.length} requerimientos):
                      </span>
                      {need.totalElements === 0 && (
                        <AlertCircle className="h-4 w-4 text-amber-500" />
                      )}
                    </div>
                    <div className="flex flex-col items-end">
                      <p className="text-sm">Total Cantidad de elementos: {formatNumber(need.totalElements)}</p>
                      <p className="text-sm">Esfuerzo: {formatNumber(need.totalEffort)}</p>
                      <div className="flex items-center gap-1">
                        <p className="text-sm">Horas: {formatNumber(need.totalEffort)}</p>
                        {expandedNeeds.has(need.necesidadid) ? 
                          <ChevronUp className="h-4 w-4" /> : 
                          <ChevronDown className="h-4 w-4" />
                        }
                      </div>
                    </div>
                  </div>

                  {expandedNeeds.has(need.necesidadid) && (
                    <div className="px-4 pb-2">
                      {need.requirements.map((req) => (
                        <div key={req.requerimientoid} className="border-t pt-2">
                          <div 
                            className="flex justify-between items-center py-2 cursor-pointer"
                            onClick={() => toggleRequirement(req.requerimientoid)}
                          >
                            <div>
                              <p className="font-medium">{req.nombrerequerimiento}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="flex flex-col items-end">
                                <p className="text-sm">Cantidad de elementos: {formatNumber(req.totalElements)}</p>
                                <p className="text-sm">Esfuerzo: {formatNumber(req.totalEffort)}</p>
                                <p className="text-sm">Horas: {formatNumber(req.totalEffort)}</p>
                              </div>
                              {expandedRequirements.has(req.requerimientoid) ? 
                                <ChevronUp className="h-4 w-4" /> : 
                                <ChevronDown className="h-4 w-4" />
                              }
                            </div>
                          </div>
                          
                          {expandedRequirements.has(req.requerimientoid) && (
                            <div className="pl-4 py-2 space-y-1">
                              {req.elements.length > 0 ? (
                                req.elements.map((elem, idx) => (
                                  <div key={idx} className="flex justify-between text-sm">
                                    <span>{elem.nombre}</span>
                                    <span>{formatNumber(elem.cantidad_estimada)}</span>
                                  </div>
                                ))
                              ) : (
                                <p className="text-sm text-gray-500 italic">No hay elementos afectados</p>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {needs.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500">No hay necesidades o estimaciones disponibles</p>
                </div>
              )}
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default ProjectEstimationsSheet;
