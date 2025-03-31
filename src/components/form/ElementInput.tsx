
import { Input } from "@/components/ui/input";

interface ElementInputProps {
  elementId: number;
  label: string;
  value: number;
  onChange: (id: number, value: string) => void;
}

const ElementInput = ({ elementId, label, value, onChange }: ElementInputProps) => {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium block">{label}</label>
      <Input
        type="number"
        min="0"
        className="h-8"
        value={value !== undefined ? value : 0}
        onChange={(e) => onChange(elementId, e.target.value)}
      />
    </div>
  );
};

export default ElementInput;
