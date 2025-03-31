
import { DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles } from "lucide-react";
import ParametersSection from "./ParametersSection";
import ElementsSection from "./ElementsSection";

interface DialogContentProps {
  loading: boolean;
  parametros: any[];
  elementos: any[];
  tiposParametros: any[];
  elementosFields: any[];
  onParametroChange: (id: number, value: number) => void;
  onElementChange: (id: number, value: number) => void;
  onClose: () => void;
  onSave: () => void;
  dataExists: boolean;
  handleGenerateAIEstimation?: () => Promise<void>;
  aiLoading?: boolean;
}

const DialogContentComponent = ({
  loading,
  parametros,
  elementos,
  tiposParametros,
  elementosFields,
  onParametroChange,
  onElementChange,
  onClose,
  onSave,
  dataExists,
  handleGenerateAIEstimation,
  aiLoading = false
}: DialogContentProps) => {
  
  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle className="text-xl">
          {dataExists ? "Editar Formulario" : "Nuevo Formulario"}
        </DialogTitle>
      </DialogHeader>

      <div className="overflow-y-auto max-h-[60vh] pr-2">
        <ParametersSection
          parametros={parametros}
          tiposParametros={tiposParametros}
          onParametroChange={onParametroChange}
        />
        
        <div className="mt-6 flex justify-between items-center">
          <h3 className="text-lg font-semibold">Elementos</h3>
          {handleGenerateAIEstimation && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleGenerateAIEstimation}
              disabled={aiLoading}
              className="mb-2"
            >
              {aiLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4 mr-2" />
              )}
              Estimar esfuerzos con IA
            </Button>
          )}
        </div>
        
        <ElementsSection
          elementos={elementos}
          elementosFields={elementosFields}
          onElementChange={onElementChange}
        />
      </div>

      <DialogFooter className="mt-6">
        <Button variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <Button onClick={onSave}>
          Guardar
        </Button>
      </DialogFooter>
    </>
  );
};

export default DialogContentComponent;
