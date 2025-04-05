
import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ChartContainer } from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, Legend, Tooltip, XAxis, YAxis } from "recharts";

interface RealEffortDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  estimatedHours: number;
  formatNumber: (num: number) => string;
  projectId: number;
}

export const RealEffortDialog = ({
  open,
  onOpenChange,
  estimatedHours,
  formatNumber,
  projectId
}: RealEffortDialogProps) => {
  const { toast } = useToast();
  const [realEffort, setRealEffort] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  // Calculate deviation if real effort exists
  const realEffortNum = parseFloat(realEffort) || 0;
  const deviation = realEffortNum > 0 ? realEffortNum - estimatedHours : 0;
  const deviationPercentage = estimatedHours > 0
    ? ((realEffortNum - estimatedHours) / estimatedHours) * 100
    : 0;

  // Prepare chart data
  const chartData = [
    {
      name: "Horas",
      Estimado: estimatedHours,
      Real: realEffortNum > 0 ? realEffortNum : 0,
    }
  ];

  // Fetch real effort data
  useEffect(() => {
    if (open && projectId) {
      const fetchRealEffort = async () => {
        setLoading(true);
        try {
          const { data, error } = await supabase
            .from('proyecto')
            .select('*')
            .eq('proyectoid', projectId)
            .single();

          if (error) {
            console.error('Error fetching real effort:', error);
            setRealEffort("");
          } else {
            // Check if esfuerzo_real exists and is a number
            const realEffortValue = data.esfuerzo_real !== null && data.esfuerzo_real !== undefined
              ? data.esfuerzo_real.toString()
              : "";
            setRealEffort(realEffortValue);
          }
        } catch (error) {
          console.error('Error in real effort fetch:', error);
          setRealEffort("");
        } finally {
          setLoading(false);
        }
      };

      fetchRealEffort();
    }
  }, [open, projectId]);

  const handleSave = async () => {
    if (!realEffort) {
      toast({
        title: "Error",
        description: "Por favor ingresa un valor para el esfuerzo real",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const parsedEffort = parseFloat(realEffort);
      
      const { error } = await supabase
        .from('proyecto')
        .update({ esfuerzo_real: parsedEffort })
        .eq('proyectoid', projectId);

      if (error) {
        console.error('Error saving real effort:', error);
        toast({
          title: "Error",
          description: "No se pudo guardar el esfuerzo real",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Éxito",
          description: "Esfuerzo real guardado correctamente",
        });
        onOpenChange(false);
      }
    } catch (error) {
      console.error('Error in save operation:', error);
      toast({
        title: "Error",
        description: "Ocurrió un error al guardar el esfuerzo real",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Esfuerzo Real del Proyecto</DialogTitle>
          <DialogDescription>
            Ingresa el esfuerzo real total del proyecto para compararlo con la estimación.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="estimatedHours" className="text-right">
                  Estimado:
                </Label>
                <Input
                  id="estimatedHours"
                  value={formatNumber(estimatedHours)}
                  readOnly
                  className="col-span-3 bg-muted"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="realEffort" className="text-right">
                  Real:
                </Label>
                <Input
                  id="realEffort"
                  value={realEffort}
                  onChange={(e) => setRealEffort(e.target.value)}
                  type="number"
                  min="0"
                  step="0.1"
                  className="col-span-3"
                />
              </div>

              {realEffortNum > 0 && (
                <>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">Desviación:</Label>
                    <div className="col-span-3 flex items-center gap-2">
                      <span className={`font-medium ${deviation < 0 ? 'text-green-600' : deviation > 0 ? 'text-red-600' : 'text-gray-600'}`}>
                        {deviation < 0 ? '-' : deviation > 0 ? '+' : ''}{formatNumber(Math.abs(deviation))} hrs
                      </span>
                      <span className={`text-sm ${deviation < 0 ? 'text-green-600' : deviation > 0 ? 'text-red-600' : 'text-gray-600'}`}>
                        ({deviationPercentage < 0 ? '-' : deviationPercentage > 0 ? '+' : ''}{formatNumber(Math.abs(deviationPercentage))}%)
                      </span>
                    </div>
                  </div>

                  <div className="mt-4">
                    <ChartContainer className="h-[200px]" config={{
                      Estimado: { color: "#4f46e5" },
                      Real: { color: "#ef4444" }
                    }}>
                      <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip formatter={(value) => formatNumber(Number(value))} />
                        <Legend />
                        <Bar dataKey="Estimado" name="Estimado (hrs)" fill="#4f46e5" />
                        <Bar dataKey="Real" name="Real (hrs)" fill="#ef4444" />
                      </BarChart>
                    </ChartContainer>
                  </div>
                </>
              )}
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                disabled={saving}
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Guardar
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
