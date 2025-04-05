
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent 
} from "@/components/ui/chart";
import { Bar, BarChart, XAxis, YAxis, ResponsiveContainer, Legend, LabelList } from "recharts";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface RealEffortDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  estimatedHours: number;
  formatNumber: (num: number) => string;
  projectId: number;
}

interface RealEffortFormData {
  realHours: number;
}

export const RealEffortDialog = ({
  open,
  onOpenChange,
  estimatedHours,
  formatNumber,
  projectId
}: RealEffortDialogProps) => {
  const [formData, setFormData] = useState<RealEffortFormData>({ realHours: 0 });
  const [realHours, setRealHours] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [deviation, setDeviation] = useState<number | null>(null);
  const { toast } = useToast();

  // Fetch current real effort from the database
  useEffect(() => {
    if (open && projectId) {
      fetchRealEffort();
    }
  }, [open, projectId]);

  const fetchRealEffort = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('proyecto')
        .select('esfuerzo_real')
        .eq('proyectoid', projectId)
        .maybeSingle();

      if (error) {
        throw error;
      }

      if (data && data.esfuerzo_real !== null) {
        const realEffort = Number(data.esfuerzo_real);
        setFormData({ realHours: realEffort });
        setRealHours(realEffort);
        
        // Calculate deviation if we have the real effort
        if (realEffort > 0) {
          const calculatedDeviation = calculateDeviation(realEffort, estimatedHours);
          setDeviation(calculatedDeviation);
        }
      }
    } catch (error) {
      console.error("Error fetching real effort:", error);
      toast({
        title: "Error",
        description: "No se pudo cargar el esfuerzo real del proyecto",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate deviation percentage
  const calculateDeviation = (real: number, estimated: number): number => {
    if (estimated === 0) return 0;
    return ((real - estimated) / estimated) * 100;
  };

  // Reset the form when dialog closes
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // Don't reset the data when closing to preserve it for next opening
    }
    onOpenChange(newOpen);
  };

  // Handle form submission
  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Save the real effort to the database
      const { error } = await supabase
        .from('proyecto')
        .update({ esfuerzo_real: formData.realHours })
        .eq('proyectoid', projectId);
      
      if (error) {
        throw error;
      }

      // Calculate deviation
      const calculatedDeviation = calculateDeviation(formData.realHours, estimatedHours);
      
      // Update state to display the chart
      setRealHours(formData.realHours);
      setDeviation(calculatedDeviation);

      toast({
        title: "Éxito",
        description: "Esfuerzo real actualizado correctamente",
      });
    } catch (error) {
      console.error("Error saving real effort:", error);
      toast({
        title: "Error",
        description: "No se pudo guardar el esfuerzo real del proyecto",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Prepare chart data
  const chartData = realHours !== null ? [
    {
      name: "Esfuerzo",
      Estimado: estimatedHours,
      Real: realHours,
    }
  ] : [];

  // Determine deviation color based on percentage
  const getDeviationColor = (deviationValue: number) => {
    if (deviationValue > 20) return "text-red-600";
    if (deviationValue > 10) return "text-amber-600";
    if (deviationValue < -10) return "text-emerald-600";
    return "text-blue-600";
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Actualizar Esfuerzo Real</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid gap-6 py-4">
            <div className="flex flex-col space-y-2">
              <p className="text-sm text-muted-foreground mb-1">
                Ingrese el esfuerzo real consumido para este proyecto (en horas):
              </p>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <Input
                    type="number"
                    min="0"
                    step="0.1"
                    value={formData.realHours || ""}
                    onChange={(e) => setFormData({ ...formData, realHours: parseFloat(e.target.value) || 0 })}
                    placeholder="Esfuerzo real en horas"
                  />
                </div>
                <Button 
                  onClick={handleSubmit} 
                  disabled={isSubmitting || formData.realHours <= 0}
                >
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
                  Guardar
                </Button>
              </div>
            </div>

            {realHours !== null && deviation !== null && (
              <div className="space-y-4 pt-2 border-t">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">Resultado:</p>
                    <p className="text-sm text-muted-foreground">
                      Esfuerzo estimado: <span className="font-medium">{formatNumber(estimatedHours)} hrs</span>
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Esfuerzo real: <span className="font-medium">{formatNumber(realHours)} hrs</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Desviación:</p>
                    <p className={`text-2xl font-bold ${getDeviationColor(deviation)}`}>
                      {formatNumber(deviation)}%
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {deviation > 0 
                        ? "Por encima del estimado" 
                        : deviation < 0 
                          ? "Por debajo del estimado" 
                          : "Igual al estimado"}
                    </p>
                  </div>
                </div>

                <div className="pt-2">
                  <h4 className="text-sm font-medium mb-2">Comparación gráfica:</h4>
                  <div className="h-[250px] w-full">
                    <ChartContainer
                      config={{
                        Estimado: {
                          color: "#3b82f6",
                          label: "Estimado"
                        },
                        Real: {
                          color: realHours > estimatedHours ? "#ef4444" : "#10b981",
                          label: "Real"
                        }
                      }}
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
                          <XAxis dataKey="name" />
                          <YAxis />
                          <ChartTooltip
                            content={<ChartTooltipContent />}
                          />
                          <Legend />
                          <Bar dataKey="Estimado" fill="#3b82f6">
                            <LabelList dataKey="Estimado" position="top" formatter={(value: number) => `${formatNumber(value)} hrs`} />
                          </Bar>
                          <Bar dataKey="Real" fill={realHours > estimatedHours ? "#ef4444" : "#10b981"}>
                            <LabelList dataKey="Real" position="top" formatter={(value: number) => `${formatNumber(value)} hrs`} />
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-md mt-4">
                  <h4 className="text-sm font-medium mb-2">Fórmula de desviación:</h4>
                  <div className="text-sm">
                    <p className="mb-1">Desviación % = ((Valor Real - Valor Estimado) / Valor Estimado) × 100</p>
                    <p className="font-mono">
                      = (({formatNumber(realHours)} - {formatNumber(estimatedHours)}) / {formatNumber(estimatedHours)}) × 100
                    </p>
                    <p className="font-mono">= {formatNumber(deviation)}%</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
