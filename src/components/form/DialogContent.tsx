
import React, { useState } from "react";
import { DialogTitle, DialogDescription, DialogHeader } from "@/components/ui/dialog";
import { Button } from "../ui/button";
import { Loader2, Wand2 } from "lucide-react";
import { Separator } from "../ui/separator";
import ParametersSection from "./ParametersSection";
import ElementsSection from "./ElementsSection";
import { Element } from "@/hooks/form/types";
import { TipoParametroEstimacion } from "@/hooks/form/useFormParameters";
import AISelectionModal from "./AISelectionModal";

interface DialogContentProps {
  loading: boolean;
  parametros: Record<number, string>;
  elementos: Element[];
  tiposParametros: TipoParametroEstimacion[];
  elementosFields: Array<{ id: number; label: string }>;
  onParametroChange: (parametroId: number, value: string) => void;
  onElementChange: (elementId: number, value: string) => void;
  onClose: () => void;
  onSave: () => Promise<void>;
  dataExists: boolean;
  handleGenerateAIEstimation: (selectedIds?: number[]) => Promise<void>;
  aiLoading: boolean;
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
  aiLoading,
}: DialogContentProps) => {
  const [showValidation, setShowValidation] = useState(false);
  const [aiSelectionOpen, setAiSelectionOpen] = useState(false);
  
  // Check if all required parameters have values
  const validateForm = () => {
    return !tiposParametros.some(tipo => !parametros[tipo.tipo_parametro_estimacionid]);
  };
  
  const handleSave = async () => {
    setShowValidation(true);
    if (validateForm()) {
      await onSave();
    }
  };

  const handleGenerateAI = async (selectedIds: number[]) => {
    console.log("Generating AI estimation with selected element IDs:", selectedIds);
    console.log("Element fields:", elementosFields);
    await handleGenerateAIEstimation(selectedIds);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-6">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Estimación de Requerimiento</DialogTitle>
        <DialogDescription>
          Complete los parámetros de la estimación
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-6 max-h-[60vh] overflow-y-auto py-4">
        <ParametersSection 
          parametros={parametros} 
          tiposParametros={tiposParametros} 
          onParametroChange={onParametroChange}
          showValidation={showValidation}
        />

        <Separator className="my-4" />

        <ElementsSection
          elementos={elementos}
          elementosFields={elementosFields}
          onElementChange={onElementChange}
        />

        <div className="flex justify-center mt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => setAiSelectionOpen(true)}
            disabled={aiLoading || !validateForm()}
            className="w-full"
          >
            {aiLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generando estimación...
              </>
            ) : (
              <>
                <Wand2 className="mr-2 h-4 w-4" />
                Generar con IA
              </>
            )}
          </Button>
        </div>
      </div>
      <div className="flex justify-between mt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="button" onClick={handleSave}>
          {dataExists ? "Actualizar" : "Guardar"}
        </Button>
      </div>

      <AISelectionModal
        open={aiSelectionOpen}
        onOpenChange={setAiSelectionOpen}
        elementosFields={elementosFields}
        onConfirm={handleGenerateAI}
        isLoading={aiLoading}
      />
    </>
  );
};

export default DialogContentComponent;
