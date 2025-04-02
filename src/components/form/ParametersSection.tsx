
import { TipoParametroEstimacion } from "@/hooks/form/useFormParameters";
import ParameterSelect from "./ParameterSelect";

interface ParametersSectionProps {
  parametros: Record<number, string>;
  tiposParametros: TipoParametroEstimacion[];
  onParametroChange: (id: number, value: string) => void;
  showValidation?: boolean;
}

const ParametersSection = ({ 
  parametros, 
  tiposParametros, 
  onParametroChange,
  showValidation = false
}: ParametersSectionProps) => {
  return (
    <div className="space-y-1">
      <h3 className="text-lg font-semibold mb-3">Parámetros</h3>
      <div className="grid grid-cols-2 gap-4">
        {tiposParametros.map((tipoParametro) => {
          const currentValue = parametros[tipoParametro.tipo_parametro_estimacionid] || "";
          const options = tipoParametro.parametro_estimacion.map(param => param.nombre);
          
          return (
            <ParameterSelect
              key={tipoParametro.tipo_parametro_estimacionid}
              id={tipoParametro.tipo_parametro_estimacionid}
              name={tipoParametro.nombre}
              value={currentValue}
              options={options}
              onChange={onParametroChange}
              showValidation={showValidation}
            />
          );
        })}
      </div>
    </div>
  );
};

export default ParametersSection;
