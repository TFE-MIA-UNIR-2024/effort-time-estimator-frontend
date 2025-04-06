
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X } from "lucide-react";
import { ElementWithQuantity } from "@/hooks/realQuantity/types";
import { Input } from "@/components/ui/input";

interface RealQuantityContentProps {
  loading: boolean;
  elements: ElementWithQuantity[];
  onElementChange: (elementId: number, value: string, field: 'cantidad_real' | 'jornada_real') => void;
  onClose: () => void;
  onSave: () => void;
}

const RealQuantityContent = ({
  loading,
  elements,
  onElementChange,
  onClose,
  onSave
}: RealQuantityContentProps) => {
  return (
    <>
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold">
          Cantidad Real for {elements.length > 0 ? elements[0].requerimiento : "Requerimiento"}
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
        <div className="space-y-4 py-4 px-1">
          {elements.map((element) => (
            <div 
              key={element.elemento_id} 
              className="border rounded-md p-4"
            >
              <div className="font-medium">{element.nombre}</div>
              <div className="grid grid-cols-4 gap-4 mt-2">
                <div>
                  <div className="text-sm text-gray-500">Cantidad Estimada</div>
                  <div className="font-medium">{element.cantidad_estimada}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Cantidad Real</div>
                  <Input
                    type="number"
                    min="0"
                    value={element.cantidad_real || ""}
                    onChange={(e) => onElementChange(element.elemento_id, e.target.value, 'cantidad_real')}
                    placeholder="Ingrese cantidad real"
                  />
                </div>
                <div>
                  <div className="text-sm text-gray-500">Jornada Estimada</div>
                  <div className="font-medium">{element.jornada_estimada?.toFixed(2) || "N/A"}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Jornada Real</div>
                  <Input
                    type="number"
                    min="0"
                    step="0.25"
                    value={element.jornada_real || ""}
                    onChange={(e) => onElementChange(element.elemento_id, e.target.value, 'jornada_real')}
                    placeholder="Ingrese jornada real"
                  />
                </div>
              </div>
            </div>
          ))}

          <div className="flex justify-end pt-2">
            <Button 
              onClick={onSave} 
              disabled={loading}
              className="bg-black hover:bg-gray-800 text-white"
            >
              Save All
            </Button>
          </div>
        </div>
      </ScrollArea>
    </>
  );
};

export default RealQuantityContent;
