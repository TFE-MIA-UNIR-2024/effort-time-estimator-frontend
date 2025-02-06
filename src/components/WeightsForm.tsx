import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { WeightFormData } from "@/types/need";
import { Loader2 } from "lucide-react";
import { useParametrosEstimacion } from "@/hooks/useParametrosEstimacion";
import { Select } from "@/components/ui/select";
import { RequirementWithId } from "@/pages/NeedDetails/componentTypes";

interface WeightsFormProps {
  weightFormData: WeightFormData;
  onWeightChange: (key: keyof WeightFormData, value: number) => void;
  onParameterChange: (
    parametro_estimacionid: number,
    valor_parametro_estimacionid: number
  ) => void;
  onSave?: () => Promise<void>;
  onGenerateWeights?: () => void;
  loading?: boolean;
  saveLoading?: boolean;
  hasFunctionPoints?: boolean;
  requirement: RequirementWithId;
  selectedParameters: Record<number, number>;

  puntosFuncion?: Array<{
    parametro_estimacionid?: number;
    valor_parametro_estimacionid?: number;
  }>;
}

export function WeightsForm({
  weightFormData,
  onWeightChange,
  onParameterChange,
  onSave,
  onGenerateWeights,
  loading = false,
  saveLoading = false,
  hasFunctionPoints = false,
  puntosFuncion = [],
  requirement,
  selectedParameters,
}: WeightsFormProps) {
  const {
    parametros,
    loading: parametrosLoading,
    error,
  } = useParametrosEstimacion(requirement);

  const handleSave = async () => {
    if (onSave) {
      await onSave();
    }
  };

  console.log(selectedParameters);

  return (
    <div className="relative h-[calc(100vh-10rem)] overflow-y-auto pr-4">
      {parametrosLoading && (
        <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-10">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      )}
      <div className="grid grid-cols-2 gap-4">
        {parametros.map((parametro) => {
          const currentValue =
            selectedParameters[parametro.tipo_parametro_estimacionid];

          return (
            <div
              key={parametro.tipo_parametro_estimacionid}
              className="space-y-2"
            >
              <label className="text-sm font-medium">{parametro.nombre}</label>
              <Select
                value={currentValue?.toString() || ""}
                onChange={(e) =>
                  onParameterChange(
                    parametro.tipo_parametro_estimacionid,
                    Number(e.target.value)
                  )
                }
              >
                <option value="" disabled>
                  Seleccione un valor
                </option>
                {parametro.parametro_estimacion.map((valor) => (
                  <option
                    key={valor.parametro_estimacionid}
                    value={valor.parametro_estimacionid}
                  >
                    {valor.nombre}
                  </option>
                ))}
              </Select>
            </div>
          );
        })}
      </div>
      <h2 className="text-lg font-medium mt-4">Elementos afectados</h2>
      <div className="grid grid-cols-2 gap-4">
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
      <div className="mt-4 flex justify-end gap-2">
        {!hasFunctionPoints && onGenerateWeights && (
          <Button
            variant="outline"
            onClick={onGenerateWeights}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              "Estimar esfuerzos con IA"
            )}
          </Button>
        )}
        <Button onClick={handleSave} disabled={loading || saveLoading}>
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
      {error && <div className="text-red-500 mt-4">{error}</div>}
    </div>
  );
}
