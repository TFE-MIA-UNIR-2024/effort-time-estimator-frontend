
import { useState, useEffect } from "react";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
} from "@/components/ui/sheet";
import { ChevronDown, ChevronUp, AlertCircle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";

interface ParametroEstimacion {
  parametro_estimacionid: number;
  nombre: string;
  factor: number | null;
  factor_ia: number | null;
  tipo_parametro_estimacion: {
    nombre: string;
    haselementosafectados: boolean;
  } | null;
}

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

interface ProjectEstimationsSheetProps {
  projectId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ProjectEstimationsSheet = ({ projectId, open, onOpenChange }: ProjectEstimationsSheetProps) => {
  const [needsEstimations, setNeedsEstimations] = useState<NeedEstimation[]>([]);
  const [parametros, setParametros] = useState<ParametroEstimacion[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedNeeds, setExpandedNeeds] = useState<Set<number>>(new Set());
  const [expandedRequirements, setExpandedRequirements] = useState<Set<number>>(new Set());
  const [totalProjectHours, setTotalProjectHours] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      fetchEstimations();
    }
  }, [open, projectId]);

  const fetchEstimations = async () => {
    setLoading(true);
    try {
      // Obtener parámetros primero
      const { data: parametrosData, error: paramError } = await supabase
        .from("parametro_estimacion")
        .select(
          `
          parametro_estimacionid,
          nombre,
          factor,
          factor_ia,
          tipo_parametro_estimacion (
            nombre,
            haselementosafectados
          )
        `
        )
        .limit(100);

      if (paramError) throw paramError;
      setParametros(parametrosData || []);

      const { data: needs, error: needsError } = await supabase
        .from("necesidad")
        .select("necesidadid, nombrenecesidad")
        .eq("proyectoid", projectId);

      if (needsError) {
        console.error("Error fetching needs:", needsError);
        toast({
          title: "Error",
          description: "No se pudieron cargar las necesidades",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      if (!needs || needs.length === 0) {
        setNeedsEstimations([]);
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
                tipo_elemento_afectado_id,
                tipo_elemento_afectado (
                  nombre
                )
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

          const complejidadParam = parametrosData?.find(
            (p) => p.tipo_parametro_estimacion?.nombre === "Complejidad"
          );

          const formattedRequirements = await Promise.all(
            (requirements || []).map(async (req) => {
              const puntosFuncion = req.punto_funcion || [];
              const pf = puntosFuncion.reduce(
                (sum, pf) => sum + (pf.cantidad_estimada || 0),
                0
              );

              const parametrosMultiplicar = parametrosData?.filter(
                (p) =>
                  p.tipo_parametro_estimacion?.haselementosafectados &&
                  p.tipo_parametro_estimacion?.nombre !== "Complejidad"
              ) || [];
              
              const parametrosSumar = parametrosData?.filter(
                (p) => !p.tipo_parametro_estimacion?.haselementosafectados
              ) || [];

              const esfuerzoMultiplicativo = await Promise.all(
                puntosFuncion.map(async (pf) => {
                  if (!pf.tipo_elemento_afectado_id || !pf.cantidad_estimada) {
                    return 0;
                  }
                  
                  let factorComplejidad = 1;

                  if (complejidadParam) {
                    const { data: elementoAfectado } = await supabase
                      .from("elemento_afectado")
                      .select("factor, factor_ia")
                      .eq(
                        "tipo_elemento_afectadoid",
                        pf.tipo_elemento_afectado_id
                      )
                      .eq(
                        "parametro_estimacionid",
                        complejidadParam.parametro_estimacionid
                      )
                      .maybeSingle();

                    if (elementoAfectado) {
                      factorComplejidad =
                        elementoAfectado.factor_ia ||
                        elementoAfectado.factor ||
                        1;
                    }
                  }

                  const factoresMultiplicativos = parametrosMultiplicar.reduce(
                    (sum, param) => {
                      const factorToUse = param.factor_ia || param.factor || 0;
                      return (
                        sum +
                        (pf.cantidad_estimada || 0) * factorToUse * factorComplejidad
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
                const factorToUse = param.factor_ia || param.factor || 0;
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
      
      // Calculate project total
      const projectTotal = needsWithEstimations.reduce(
        (sum, need) => sum + need.totalEsfuerzo, 
        0
      );
      setTotalProjectHours(projectTotal);
      
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las estimaciones",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
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

  const handleRefresh = () => {
    setRefreshing(true);
    fetchEstimations();
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[720px] overflow-y-auto">
        <SheetHeader className="mb-4">
          <div className="flex items-center justify-between">
            <SheetTitle>Estimaciones del Proyecto</SheetTitle>
            <Button 
              size="sm" 
              variant="outline"
              onClick={handleRefresh}
              disabled={refreshing || loading}
            >
              {refreshing ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
              Actualizar
            </Button>
          </div>
        </SheetHeader>

        {loading ? (
          <div className="flex items-center justify-center h-40">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <p>Cargando estimaciones...</p>
          </div>
        ) : (
          <>
            <div className="mb-6 p-4 bg-muted/50 rounded-lg">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Esfuerzo Total (hrs)</p>
                  <p className="text-2xl font-semibold">{formatNumber(totalProjectHours)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Necesidades</p>
                  <p className="text-2xl font-semibold">{needsEstimations.length}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {needsEstimations.map((need) => (
                <div key={need.necesidadid} className="border rounded-lg overflow-hidden shadow-sm">
                  <div 
                    className="flex justify-between items-center p-4 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => toggleNeed(need.necesidadid)}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-medium truncate max-w-[200px]">
                        {need.nombrenecesidad}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        ({need.requirements.length} requerimientos)
                      </span>
                      {need.totalEsfuerzo === 0 && (
                        <AlertCircle className="h-4 w-4 text-amber-500" />
                      )}
                    </div>
                    <div className="flex flex-col items-end">
                      <div className="flex items-center gap-2">
                        <p className="text-sm">Puntos de función: {formatNumber(need.totalPF)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">Esfuerzo: {formatNumber(need.totalEsfuerzo)} hrs</p>
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
                        <div key={req.requerimientoid} className="border-t pt-2 mt-2">
                          <div 
                            className="flex justify-between items-center py-2 cursor-pointer hover:bg-gray-50 px-2 rounded transition-colors"
                            onClick={() => toggleRequirement(req.requerimientoid)}
                          >
                            <div>
                              <p className="font-medium truncate max-w-[300px]">{req.nombrerequerimiento}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="flex flex-col items-end">
                                <p className="text-sm">PF: {formatNumber(req.pf)}</p>
                                <p className="text-sm font-medium">Esfuerzo: {formatNumber(req.esfuerzoEstimado)} hrs</p>
                              </div>
                              {expandedRequirements.has(req.requerimientoid) ? 
                                <ChevronUp className="h-4 w-4" /> : 
                                <ChevronDown className="h-4 w-4" />
                              }
                            </div>
                          </div>
                          
                          {expandedRequirements.has(req.requerimientoid) && (
                            <div className="pl-4 py-2 space-y-1 bg-gray-50 rounded-md mb-2">
                              <p className="text-sm font-medium mb-2">Elementos afectados:</p>
                              {req.puntosFuncion.filter(pf => pf.cantidad_estimada && pf.cantidad_estimada > 0).length > 0 ? (
                                <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                                  {req.puntosFuncion
                                    .filter(pf => pf.cantidad_estimada && pf.cantidad_estimada > 0)
                                    .map((pf, idx) => (
                                      <div key={idx} className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">{pf.tipo_elemento_afectado?.nombre}:</span>
                                        <span className="font-medium">{pf.cantidad_estimada}</span>
                                      </div>
                                    ))}
                                </div>
                              ) : (
                                <p className="text-sm text-gray-500 italic">No hay elementos afectados con cantidad mayor a cero</p>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {needsEstimations.length === 0 && (
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
