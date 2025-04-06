
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { EffortInputForm } from "./EffortInputForm";
import { EffortDeviationInfo } from "./EffortDeviationInfo";
import { EffortComparisonChart } from "./EffortComparisonChart";
import { useRealEffort } from "../hooks/useRealEffort";

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
  const {
    realEffort,
    setRealEffort,
    loading,
    saving,
    handleSave
  } = useRealEffort(projectId, open);

  const realEffortNum = parseFloat(realEffort) || 0;

  const onSave = async () => {
    const success = await handleSave();
    if (success) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[650px]">
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
            <EffortInputForm
              estimatedHours={estimatedHours}
              formatNumber={formatNumber}
              realEffort={realEffort}
              onRealEffortChange={setRealEffort}
            />

            {realEffortNum > 0 && (
              <>
                <EffortDeviationInfo
                  estimatedHours={estimatedHours}
                  realEffortNum={realEffortNum}
                  formatNumber={formatNumber}
                />

                <div className="mt-4">
                  <EffortComparisonChart
                    estimatedHours={estimatedHours}
                    realEffortNum={realEffortNum}
                    formatNumber={formatNumber}
                  />
                </div>
              </>
            )}
            
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                disabled={saving}
              >
                Cancelar
              </Button>
              <Button 
                onClick={onSave}
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
