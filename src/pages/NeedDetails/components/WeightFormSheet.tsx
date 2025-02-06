import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { WeightsForm } from "@/components/WeightsForm";
import { WeightFormData } from "@/types/need";
import { RequirementWithId } from "../componentTypes";

interface WeightFormSheetProps {
  title: string;
  buttonText: string;
  requirement: RequirementWithId;
  weightFormData: WeightFormData;
  loading: boolean;
  saveLoading: boolean;
  onWeightChange: (key: string, value: number) => void;
  onParameterChange: (
    parametro_estimacionid: number,
    valor_parametro_estimacionid: number
  ) => void;
  onSave: () => Promise<void>;
  onButtonClick?: () => void;
  onGenerateWeights?: () => void;
  hasFunctionPoints?: boolean;
  puntosFuncion?: Array<{
    parametro_estimacionid?: number;
    valor_parametro_estimacionid?: number;
  }>;
  selectedParameters: Record<number, number>;
}

export function WeightFormSheet({
  title,
  buttonText,
  requirement,
  weightFormData,
  loading,
  saveLoading,
  onWeightChange,
  onParameterChange,
  onSave,
  onButtonClick,
  onGenerateWeights,
  hasFunctionPoints,
  puntosFuncion,
  selectedParameters,
}: WeightFormSheetProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" onClick={onButtonClick}>
          {buttonText}
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>
            {title} {requirement.nombrerequerimiento}
          </SheetTitle>
        </SheetHeader>
        <WeightsForm
          weightFormData={weightFormData}
          onWeightChange={onWeightChange}
          onParameterChange={onParameterChange}
          onSave={onSave}
          loading={loading}
          saveLoading={saveLoading}
          onGenerateWeights={onGenerateWeights}
          hasFunctionPoints={hasFunctionPoints}
          requirement={requirement}
          puntosFuncion={puntosFuncion}
          selectedParameters={selectedParameters}
        />
      </SheetContent>
    </Sheet>
  );
}
