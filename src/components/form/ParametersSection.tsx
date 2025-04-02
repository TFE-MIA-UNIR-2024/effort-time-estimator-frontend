
import { TipoParametroEstimacion } from "@/hooks/form/useFormParameters";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

interface ParametersSectionProps {
  parametros: Record<number, string>;
  tiposParametros: TipoParametroEstimacion[];
  onParametroChange: (id: number, value: string) => void;
}

const ParametersSection = ({ parametros, tiposParametros, onParametroChange }: ParametersSectionProps) => {
  return (
    <div className="space-y-1">
      <h3 className="text-lg font-semibold mb-3">Parámetros</h3>
      <div className="grid grid-cols-2 gap-4">
        {tiposParametros.map((tipoParametro) => {
          const currentValue = parametros[tipoParametro.tipo_parametro_estimacionid] || "";
          const isInvalid = !currentValue;
          
          return (
            <div key={tipoParametro.tipo_parametro_estimacionid} className="space-y-2">
              <label 
                htmlFor={`param-${tipoParametro.tipo_parametro_estimacionid}`} 
                className="block text-sm font-medium flex items-center justify-between"
              >
                {tipoParametro.nombre}
                <span className="text-destructive text-xs">* Requerido</span>
              </label>
              <Select 
                value={currentValue} 
                onValueChange={(newValue) => onParametroChange(tipoParametro.tipo_parametro_estimacionid, newValue)}
              >
                <SelectTrigger 
                  id={`param-${tipoParametro.tipo_parametro_estimacionid}`} 
                  className={`w-full ${isInvalid ? "border-destructive ring-destructive" : ""}`}
                >
                  <SelectValue placeholder={`Seleccionar ${tipoParametro.nombre}`} />
                </SelectTrigger>
                <SelectContent>
                  {tipoParametro.parametro_estimacion.map((param) => (
                    <SelectItem 
                      key={param.parametro_estimacionid} 
                      value={param.nombre}
                    >
                      {param.nombre}
                    </SelectItem>
                  ))}
                  {currentValue && !tipoParametro.parametro_estimacion.some(p => p.nombre === currentValue) && (
                    <SelectItem value={currentValue}>{currentValue}</SelectItem>
                  )}
                </SelectContent>
              </Select>
              {isInvalid && (
                <p className="text-xs text-destructive mt-1">Este campo es obligatorio</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ParametersSection;
