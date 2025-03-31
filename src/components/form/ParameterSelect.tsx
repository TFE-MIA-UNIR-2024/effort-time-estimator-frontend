
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ParameterSelectProps {
  paramId: number;
  paramName: string;
  options: string[];
  value: string;
  onChange: (id: number, value: string) => void;
}

const ParameterSelect = ({ paramId, paramName, options, value, onChange }: ParameterSelectProps) => {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium">{paramName}</label>
      <Select
        value={value}
        onValueChange={(value) => onChange(paramId, value)}
      >
        <SelectTrigger className="bg-white">
          <SelectValue placeholder={options.length > 0 ? options[0] : 'Select an option'} />
        </SelectTrigger>
        <SelectContent className="bg-white">
          {options.map(option => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default ParameterSelect;
