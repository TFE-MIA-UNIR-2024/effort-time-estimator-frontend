import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormData } from "../types";

interface RequirementFormProps {
  formData: FormData;
  loading: boolean;
  isEditing: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  onChange: (field: keyof FormData, value: string) => void;
}

export function RequirementForm({
  formData,
  loading,
  isEditing,
  onSubmit,
  onCancel,
  onChange,
}: RequirementFormProps) {
  return (
    <div className="mb-8 p-4 rounded-lg border bg-card">
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <Input
            placeholder="Requirement Code"
            value={formData.codigorequerimiento}
            onChange={(e) => onChange("codigorequerimiento", e.target.value)}
            required
          />
          <Input
            placeholder="Requirement Name"
            value={formData.nombrerequerimiento}
            onChange={(e) => onChange("nombrerequerimiento", e.target.value)}
            required
          />
          <Input
            placeholder="Description"
            value={formData.cuerpo}
            onChange={(e) => onChange("cuerpo", e.target.value)}
          />
        </div>
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : isEditing ? "Update Requirement" : "Add Requirement"}
          </Button>
        </div>
      </form>
    </div>
  );
}
