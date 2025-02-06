import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RequirementWithId } from "../componentTypes";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { tipoElementoMap } from "../api";

interface WeightRealFormSheetProps {
  title: string;
  buttonText: string;
  requirement: RequirementWithId;
  puntosFuncion: Array<{
    cantidad_estimada: number;
    tipo_elemento_afectado_id: number;
    cantidad_real?: number;
  }>;
  loading?: boolean;
  onSave: (
    data: Array<{ cantidad_real: number; tipo_elemento_afectado_id: number }>
  ) => Promise<void>;
}

export function WeightRealFormSheet({
  title,
  buttonText,
  requirement,
  puntosFuncion,
  loading = false,
  onSave,
}: WeightRealFormSheetProps) {
  const [cantidadesReales, setCantidadesReales] = useState<
    Record<number, number>
  >(() => {
    const initialValues: Record<number, number> = {};
    puntosFuncion.forEach((pf) => {
      if (pf.cantidad_real !== undefined) {
        initialValues[pf.tipo_elemento_afectado_id] = pf.cantidad_real;
      }
    });
    return initialValues;
  });

  const reverseMap = Object.entries(tipoElementoMap).reduce(
    (acc, [key, value]) => {
      acc[value] = key;
      return acc;
    },
    {} as Record<number, string>
  );

  console.log("puntosFuncion", puntosFuncion);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm">
          {buttonText}
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>
            {title} {requirement.nombrerequerimiento}
          </SheetTitle>
        </SheetHeader>
        <div className="mt-4 h-[calc(100vh-10rem)] overflow-y-auto pr-4">
          <div className="space-y-4">
            {puntosFuncion
              .filter((pf) => {
                return !!pf.tipo_elemento_afectado_id;
              })
              .map((pf) => (
                <div
                  key={pf.tipo_elemento_afectado_id}
                  className="p-4 border rounded-lg"
                >
                  <h3 className="font-medium mb-2">
                    {reverseMap[pf.tipo_elemento_afectado_id]}
                  </h3>
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">
                        Cantidad Estimada
                      </p>
                      <p className="font-medium">{pf.cantidad_estimada}</p>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground mb-1">
                        Cantidad Real
                      </p>
                      <Input
                        type="number"
                        value={
                          cantidadesReales[pf.tipo_elemento_afectado_id] || ""
                        }
                        onChange={(e) =>
                          setCantidadesReales((prev) => ({
                            ...prev,
                            [pf.tipo_elemento_afectado_id]:
                              parseInt(e.target.value) || 0,
                          }))
                        }
                      />
                    </div>
                  </div>
                </div>
              ))}
          </div>
          <div className="mt-4 flex justify-end">
            <Button
              disabled={loading || Object.keys(cantidadesReales).length === 0}
              onClick={() => {
                const data = Object.entries(cantidadesReales).map(
                  ([tipo_elemento_afectado_id, cantidad_real]) => ({
                    cantidad_real,
                    tipo_elemento_afectado_id: parseInt(
                      tipo_elemento_afectado_id
                    ),
                  })
                );
                onSave(data);
              }}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save All"
              )}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
