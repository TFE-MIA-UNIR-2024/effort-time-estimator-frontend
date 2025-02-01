import { Button } from "@/components/ui/button";
import { RequirementWithId } from "../componentTypes";
import { WeightFormSheet } from "./WeightFormSheet";
import { WeightFormData } from "@/types/need";

interface RequirementCardProps {
  requirement: RequirementWithId;
  hasFunctionPoints: boolean;
  weightFormData: WeightFormData;
  aiLoading: boolean;
  saveLoading: boolean;
  onGenerateWeights: () => void;
  onWeightChange: (key: string, value: number) => void;
  onSaveWeights: () => Promise<void>;
  onOpenWeightForm: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function RequirementCard({
  requirement,
  hasFunctionPoints,
  weightFormData,
  aiLoading,
  saveLoading,
  onGenerateWeights,
  onWeightChange,
  onSaveWeights,
  onOpenWeightForm,
  onEdit,
  onDelete,
}: RequirementCardProps) {
  return (
    <div className="p-4 rounded-lg border bg-card text-card-foreground">
      <div className="flex justify-between items-start">
        <div>
          <p className="font-medium">
            {requirement.nombrerequerimiento}
          </p>
          <p className="text-sm text-muted-foreground">
            Code: {requirement.codigorequerimiento}
          </p>
          <p className="text-sm text-muted-foreground">
            Created:{" "}
            {new Date(requirement.fechacreacion).toLocaleDateString()}
          </p>
          {requirement.cuerpo && (
            <p className="text-sm mt-2">{requirement.cuerpo}</p>
          )}
        </div>
        <div className="flex gap-2">
          {!hasFunctionPoints && (
            <WeightFormSheet
              title="Weights for"
              buttonText="Generate Weights"
              requirement={requirement}
              weightFormData={weightFormData}
              loading={aiLoading}
              saveLoading={saveLoading}
              onWeightChange={onWeightChange}
              onSave={onSaveWeights}
              onButtonClick={onGenerateWeights}
            />
          )}

          <WeightFormSheet
            title={hasFunctionPoints ? "Edit Form for" : "Empty Form for"}
            buttonText={hasFunctionPoints ? "Edit Form" : "Empty Form"}
            requirement={requirement}
            weightFormData={weightFormData}
            loading={false}
            saveLoading={saveLoading}
            onWeightChange={onWeightChange}
            onSave={onSaveWeights}
            onButtonClick={onOpenWeightForm}
          />

          <Button
            variant="outline"
            size="sm"
            onClick={onEdit}
          >
            Edit
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={onDelete}
          >
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}
