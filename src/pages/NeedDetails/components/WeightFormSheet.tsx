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
  onSave: () => Promise<void>;
  onButtonClick?: () => void;
}

export function WeightFormSheet({
  title,
  buttonText,
  requirement,
  weightFormData,
  loading,
  saveLoading,
  onWeightChange,
  onSave,
  onButtonClick,
}: WeightFormSheetProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          onClick={onButtonClick}
        >
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
          onSave={onSave}
          loading={loading}
          saveLoading={saveLoading}
        />
      </SheetContent>
    </Sheet>
  );
}
