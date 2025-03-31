
import { useState } from "react";

export const useFormState = () => {
  const [parametros, setParametros] = useState<Record<number, string>>({});
  const [elementos, setElementos] = useState<Record<number, number>>({});
  const [dataExists, setDataExists] = useState(false);

  return {
    parametros,
    elementos,
    dataExists,
    setParametros,
    setElementos,
    setDataExists
  };
};
