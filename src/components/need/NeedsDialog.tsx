
import { Need } from "@/hooks/need/types";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import NeedForm from "./NeedForm";

interface NeedsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  currentNeed: Need | null;
  projectId: number;
  onSuccess: () => void;
  onCancel: () => void;
}

const NeedsDialog = ({ 
  isOpen, 
  onOpenChange, 
  currentNeed, 
  projectId, 
  onSuccess, 
  onCancel 
}: NeedsDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {currentNeed ? "Editar Necesidad" : "Crear Nueva Necesidad"}
          </DialogTitle>
        </DialogHeader>
        <NeedForm 
          projectId={projectId}
          need={currentNeed}
          onSuccess={onSuccess} 
          onCancel={onCancel} 
        />
      </DialogContent>
    </Dialog>
  );
};

export default NeedsDialog;
