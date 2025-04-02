
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
  const isInvalid = !value;
  
  return (
    <div className="space-y-2">
      <label 
        htmlFor={`param-${id}`} 
        className="block text-sm font-medium flex items-center justify-between"
      >
        {name}
        <span className="text-destructive text-xs">* Requerido</span>
      </label>
      <Select 
        value={value} 
        onValueChange={(newValue) => onChange(id, newValue)}
      >
        <SelectTrigger 
          id={`param-${id}`} 
          className={`w-full ${isInvalid ? "border-destructive ring-destructive" : ""}`}
        >
          <SelectValue placeholder={`Seleccionar ${name}`} />
        </SelectTrigger>
        <SelectContent>
          {uniqueOptions.map((option) => (
            <SelectItem key={`${id}-${option}`} value={option}>
              {option}
            </SelectItem>
          ))}
          {value && !uniqueOptions.includes(value) && (
            <SelectItem value={value}>{value}</SelectItem>
          )}
        </SelectContent>
      </Select>
      {isInvalid && (
        <p className="text-xs text-destructive mt-1">Este campo es obligatorio</p>
      )}
    </div>
  );
};

export default ParameterSelect;
