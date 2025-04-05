
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Loader2, Wand2 } from "lucide-react";

interface AISelectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  elementosFields: Array<{ id: number; label: string }>;
  onConfirm: (selectedIds: number[]) => Promise<void>;
  isLoading: boolean;
}

const AISelectionModal = ({
  open,
  onOpenChange,
  elementosFields,
  onConfirm,
  isLoading
}: AISelectionModalProps) => {
  const [selectedElements, setSelectedElements] = useState<number[]>([]);

  // Default selection - initially select a few common elements
  useState(() => {
    const defaultSelected = [2, 4, 7, 8, 12]; // Triggers/SP, Formularios, Reportes, Componentes, QA
    setSelectedElements(defaultSelected);
  });

  const handleCheckboxChange = (elementId: number) => {
    setSelectedElements(current => {
      if (current.includes(elementId)) {
        return current.filter(id => id !== elementId);
      } else {
        return [...current, elementId];
      }
    });
  };

  const handleConfirm = async () => {
    if (selectedElements.length === 0) {
      return;
    }
    await onConfirm(selectedElements);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Seleccionar Puntos de Función</DialogTitle>
          <DialogDescription>
            Seleccione qué elementos desea incluir en la estimación de IA
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-2 gap-4 py-4">
          {elementosFields.map((element) => (
            <div key={element.id} className="flex items-center space-x-2">
              <Checkbox 
                id={`element-${element.id}`} 
                checked={selectedElements.includes(element.id)}
                onCheckedChange={() => handleCheckboxChange(element.id)}
              />
              <Label 
                htmlFor={`element-${element.id}`}
                className="cursor-pointer"
              >
                {element.label}
              </Label>
            </div>
          ))}
        </div>
        
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancelar
          </Button>
          <Button type="button" onClick={handleConfirm} disabled={isLoading || selectedElements.length === 0}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generando...
              </>
            ) : (
              <>
                <Wand2 className="mr-2 h-4 w-4" />
                Generar con IA
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AISelectionModal;
