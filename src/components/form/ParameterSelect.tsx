
import React from "react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

interface ParameterSelectProps {
  id: number;
  name: string;
  value: string;
  options: string[];
  onChange: (id: number, value: string) => void;
}

// This component renders a select input for a parameter
const ParameterSelect = ({ id, name, value, options, onChange }: ParameterSelectProps) => {
  // Ensure options are unique and sorted
  const uniqueOptions = [...new Set(options)].sort();
  
  return (
    <div className="space-y-2">
      <label htmlFor={`param-${id}`} className="block text-sm font-medium">
        {name}
      </label>
      <Select 
        value={value} 
        onValueChange={(newValue) => onChange(id, newValue)}
      >
        <SelectTrigger id={`param-${id}`} className="w-full">
          <SelectValue placeholder={`Seleccionar ${name}`} />
        </SelectTrigger>
        <SelectContent>
          {value && !uniqueOptions.includes(value) && (
            <SelectItem value={value}>{value}</SelectItem>
          )}
          {uniqueOptions.map((option) => (
            <SelectItem key={`${id}-${option}`} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default ParameterSelect;
