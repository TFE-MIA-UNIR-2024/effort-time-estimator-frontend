
import { useState } from "react";

export function useParametersState() {
  const [parametros, setParametros] = useState<Record<number, string>>({});

  const handleParametroChange = (parametroId: number, value: string) => {
    setParametros(prev => ({
      ...prev,
      [parametroId]: value,
    }));
  };

  return {
    parametros,
    handleParametroChange,
    setParametros
  };
}
