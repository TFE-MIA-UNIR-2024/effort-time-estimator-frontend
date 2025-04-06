
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useRealQuantityData } from "@/hooks/realQuantity";
import RealQuantityContent from "./form/RealQuantityContent";

interface RealQuantityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  requerimientoId: number;
}

const RealQuantityDialog = ({ open, onOpenChange, requerimientoId }: RealQuantityDialogProps) => {
  const {
    loading,
    elements,
    handleElementChange,
    handleSave
  } = useRealQuantityData(requerimientoId, open);

  const handleFormSave = async () => {
    console.log("Saving real quantities:", elements);
    const success = await handleSave();
    if (success) {
      onOpenChange(false);
    }
  };

  const handleElementValueChange = (elementId: number, value: string, field: 'cantidad_real' | 'jornada_real') => {
    handleElementChange(elementId, value, field);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh]">
        <RealQuantityContent
          loading={loading}
          elements={elements}
          onElementChange={handleElementValueChange}
          onClose={() => onOpenChange(false)}
          onSave={handleFormSave}
        />
      </DialogContent>
    </Dialog>
  );
};

export default RealQuantityDialog;
