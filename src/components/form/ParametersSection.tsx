
import ParameterSelect from "./ParameterSelect";

interface ParametersSectionProps {
  parametros: Record<number, string>;
  parametrosFijos: { id: number; nombre: string; opciones: string[] }[];
  onParametroChange: (id: number, value: string) => void;
}

const ParametersSection = ({ parametros, parametrosFijos, onParametroChange }: ParametersSectionProps) => {
  return (
    <div className="space-y-1">
      <h3 className="text-lg font-semibold mb-3">Parámetros</h3>
      <div className="grid grid-cols-2 gap-4">
        {parametrosFijos.map((param) => (
          <ParameterSelect
            key={param.id}
            paramId={param.id}
            paramName={param.nombre}
            options={param.opciones}
            value={parametros[param.id] || param.opciones[0]}
            onChange={onParametroChange}
          />
        ))}
      </div>
    </div>
  );
};

export default ParametersSection;
