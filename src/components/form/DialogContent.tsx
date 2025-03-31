
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import ParametersSection from "./ParametersSection";
import ElementsSection from "./ElementsSection";
import { TipoParametroEstimacion } from "@/hooks/form/useFormParameters";

interface DialogContentProps {
  loading: boolean;
  parametros: Record<number, string>;
  elementos: Record<number, number>;
  tiposParametros: TipoParametroEstimacion[];
  elementosFields: { id: number; label: string }[];
  onParametroChange: (id: number, value: string) => void;
  onElementChange: (id: number, value: string) => void;
  onClose: () => void;
  onSave: () => void;
  dataExists?: boolean;
}

const DialogContent = ({
  loading,
  parametros,
  elementos,
  tiposParametros,
  elementosFields,
  onParametroChange,
  onElementChange,
  onClose,
  onSave,
  dataExists = false
}: DialogContentProps) => {
  return (
    <>
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold">
          {dataExists 
            ? "Mantenimiento de parámetros del sistema" 
            : "Empty Form for Mantenimiento de parámetros del sistema"}
        </h2>
        <Button
          variant="ghost"
          className="rounded-sm p-0 h-6 w-6"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="max-h-[70vh] pr-4">
        <div className="space-y-6 py-4 px-1">
          <ParametersSection
            parametros={parametros}
            tiposParametros={tiposParametros}
            onParametroChange={onParametroChange}
          />

          <ElementsSection
            elementos={elementos}
            elementosFields={elementosFields}
            onElementChange={onElementChange}
          />

          <div className="flex justify-end pt-2 gap-2">
            {!dataExists && (
              <Button 
                onClick={() => console.log("Estimate with AI clicked")} 
                variant="outline"
                className="whitespace-nowrap"
              >
                Estimar esfuerzos con IA
              </Button>
            )}
            <Button 
              onClick={onSave} 
              disabled={loading}
              className="bg-black hover:bg-gray-800 text-white"
            >
              Save
            </Button>
          </div>
        </div>
      </ScrollArea>
    </>
  );
};

export default DialogContent;
