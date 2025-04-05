
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { RealEffortDialog } from "./RealEffortDialog";

interface EstimationHeaderProps {
  onRefresh: () => void;
  refreshing: boolean;
  loading: boolean;
  totalProjectHours: number;
  formatNumber: (num: number) => string;
  projectId: number;
}

const EstimationHeader = ({ 
  onRefresh, 
  refreshing, 
  loading, 
  totalProjectHours,
  formatNumber,
  projectId
}: EstimationHeaderProps) => {
  const [realEffortDialogOpen, setRealEffortDialogOpen] = useState(false);

  return (
    <>
      <SheetHeader className="mb-4">
        <div className="flex items-center justify-between">
          <SheetTitle>Estimaciones del Proyecto</SheetTitle>
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => setRealEffortDialogOpen(true)}
            disabled={refreshing || loading}
          >
            {refreshing ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
            Esfuerzo Real
          </Button>
        </div>
      </SheetHeader>

      <RealEffortDialog
        open={realEffortDialogOpen}
        onOpenChange={setRealEffortDialogOpen}
        estimatedHours={totalProjectHours}
        formatNumber={formatNumber}
        projectId={projectId}
      />
    </>
  );
};

export default EstimationHeader;
