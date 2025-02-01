import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { WeightFormData } from "@/types/need";
import { Loader2 } from "lucide-react";

interface WeightsFormProps {
  weightFormData: WeightFormData;
  onWeightChange: (key: keyof WeightFormData, value: number) => void;
  onSave?: () => Promise<void>;
  loading?: boolean;
  saveLoading?: boolean;
}

export function WeightsForm({ weightFormData, onWeightChange, onSave, loading = false, saveLoading = false }: WeightsFormProps) {
  return (
    <div className="relative">
      {loading && (
        <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-10">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      )}
      <div className="grid grid-cols-2 gap-4 max-h-[70vh] overflow-y-auto pr-4">
        {Object.entries(weightFormData).map(([key, value]) => (
          <div key={key} className="space-y-2">
            <label className="text-sm font-medium">{key}</label>
            <Input
              type="number"
              value={value}
              onChange={(e) =>
                onWeightChange(
                  key as keyof WeightFormData,
                  parseInt(e.target.value) || 0
                )
              }
            />
          </div>
        ))}
      </div>
      <div className="mt-4 flex justify-end">
        <Button onClick={onSave} disabled={loading || saveLoading}>
          {saveLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save"
          )}
        </Button>
      </div>
    </div>
  );
}
