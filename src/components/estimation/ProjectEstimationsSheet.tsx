
import { 
  Sheet, 
  SheetContent
} from "@/components/ui/sheet";
import { Loader2 } from "lucide-react";
import { useEstimationCalculation } from "./hooks/useEstimationCalculation";
import { 
  EstimationHeader, 
  EstimationSummary, 
  EstimationsList 
} from "./components";

interface ProjectEstimationsSheetProps {
  projectId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ProjectEstimationsSheet = ({ projectId, open, onOpenChange }: ProjectEstimationsSheetProps) => {
  const {
    needsEstimations,
    loading,
    refreshing,
    totalProjectHours,
    handleRefresh,
    formatNumber
  } = useEstimationCalculation(projectId, open);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[720px] overflow-y-auto">
        <EstimationHeader 
          onRefresh={handleRefresh} 
          refreshing={refreshing} 
          loading={loading} 
        />

        {loading ? (
          <div className="flex items-center justify-center h-40">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <p>Cargando estimaciones...</p>
          </div>
        ) : (
          <>
            <EstimationSummary 
              totalProjectHours={totalProjectHours} 
              needsCount={needsEstimations.length} 
              formatNumber={formatNumber} 
            />

            <EstimationsList 
              needsEstimations={needsEstimations} 
              formatNumber={formatNumber} 
            />
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default ProjectEstimationsSheet;
