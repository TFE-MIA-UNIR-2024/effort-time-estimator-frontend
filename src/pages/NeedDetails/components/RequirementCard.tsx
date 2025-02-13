import { Button } from "@/components/ui/button";
import { RequirementWithId } from "../componentTypes";
import { WeightFormSheet } from "./WeightFormSheet";
import { WeightRealFormSheet } from "./WeightRealFormSheet";
import { WeightFormData } from "@/types/need";

interface RequirementCardProps {
  requirement: RequirementWithId;
  hasFunctionPoints: boolean;
  weightFormData: WeightFormData;
  saveLoading: boolean;
  puntosFuncion: Array<{
    cantidad_estimada: number;
    tipo_elemento_afectado_id: number;
    parametro_estimacionid?: number;
    valor_parametro_estimacionid?: number;
  }>;
  onWeightChange: (key: string, value: number) => void;
  onParameterChange: (
    parametro_estimacionid: number,
    valor_parametro_estimacionid: number
  ) => void;
  onSaveWeights: () => Promise<void>;
  onOpenWeightForm: () => void;
  onGenerateWeights: () => void;
  onSaveRealWeights: (
    data: Array<{ cantidad_real: number; tipo_elemento_afectado_id: number }>
  ) => Promise<void>;
  onEdit: () => void;
  onDelete: () => void;
  selectedParameters: Record<number, number>;
}

export function RequirementCard({
  requirement,
  hasFunctionPoints,
  weightFormData,
  saveLoading,
  onWeightChange,
  onParameterChange,
  onSaveWeights,
  onOpenWeightForm,
  onGenerateWeights,
  onSaveRealWeights,
  onEdit,
  onDelete,
  puntosFuncion,
  selectedParameters,
}: RequirementCardProps) {
  return (
    <div className="p-4 rounded-lg border bg-card text-card-foreground">
      <div className="flex justify-between items-start">
        <div>
          <p className="font-medium">{requirement.nombrerequerimiento}</p>
          <p className="text-sm text-muted-foreground">
            Code: {requirement.codigorequerimiento}
          </p>
          <p className="text-sm text-muted-foreground">
            Created: {new Date(requirement.fechacreacion).toLocaleDateString()}
          </p>
          {requirement.cuerpo && (
            <p className="text-sm mt-2">{requirement.cuerpo}</p>
          )}
        </div>
        <div className="flex gap-2">
          <>
            <WeightFormSheet
              title={hasFunctionPoints ? "Edit Form for" : "Empty Form for"}
              buttonText={hasFunctionPoints ? "Edit Form" : "Empty Form"}
              requirement={requirement}
              weightFormData={weightFormData}
              loading={false}
              saveLoading={saveLoading}
              onWeightChange={onWeightChange}
              onParameterChange={onParameterChange}
              onSave={onSaveWeights}
              onButtonClick={onOpenWeightForm}
              onGenerateWeights={onGenerateWeights}
              hasFunctionPoints={hasFunctionPoints}
              selectedParameters={selectedParameters}
              puntosFuncion={puntosFuncion.map((pf) => {
                // console.log(pf);
                return {
                  parametro_estimacionid: pf.parametro_estimacionid,
                  valor_parametro_estimacionid: pf.parametro_estimacionid,
                };
              })}
            />
            {hasFunctionPoints && (
              <WeightRealFormSheet
                title="Cantidad Real for"
                buttonText="Añadir cantidad real"
                requirement={requirement}
                puntosFuncion={puntosFuncion}
                loading={saveLoading}
                onSave={onSaveRealWeights}
              />
            )}
          </>

          <Button variant="outline" size="sm" onClick={onEdit}>
            Edit
          </Button>
          <Button variant="destructive" size="sm" onClick={onDelete}>
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}
