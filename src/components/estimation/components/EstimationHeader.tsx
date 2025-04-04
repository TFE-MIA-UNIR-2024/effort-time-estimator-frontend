
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { SheetHeader, SheetTitle } from "@/components/ui/sheet";

interface EstimationHeaderProps {
  onRefresh: () => void;
  refreshing: boolean;
  loading: boolean;
}

const EstimationHeader = ({ onRefresh, refreshing, loading }: EstimationHeaderProps) => {
  return (
    <SheetHeader className="mb-4">
      <div className="flex items-center justify-between">
        <SheetTitle>Estimaciones del Proyecto</SheetTitle>
        <Button 
          size="sm" 
          variant="outline"
          onClick={onRefresh}
          disabled={refreshing || loading}
        >
          {refreshing ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
          Actualizar
        </Button>
      </div>
    </SheetHeader>
  );
};

export default EstimationHeader;
