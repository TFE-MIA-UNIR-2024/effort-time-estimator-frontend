
import { useState } from "react";
import { Element } from "./types";
import { useToast } from "@/components/ui/use-toast";

export function useElementsState() {
  const [elementos, setElementos] = useState<Element[]>([]);
  const { toast } = useToast();

  const handleElementChange = (elementId: number, value: string) => {
    const numericValue = parseFloat(value) || 0;
    
    setElementos(prev => {
      const elementExists = prev.find(elem => 
        elem.elemento_id === elementId || elem.tipo_elemento_afectado_id === elementId
      );
      
      if (elementExists) {
        // Update existing element
        return prev.map(elem => 
          (elem.elemento_id === elementId || elem.tipo_elemento_afectado_id === elementId)
            ? { ...elem, cantidad_estimada: numericValue } 
            : elem
        );
      } else {
        // Create new element
        return [...prev, {
          elemento_id: elementId,
          nombre: String(elementId), // This will be replaced with actual name
          cantidad_estimada: numericValue,
          cantidad_real: null,
          tipo_elemento_afectado_id: elementId
        }];
      }
    });
  };

  // Ensure all elements from elementosFields exist in elementos state
  const ensureAllElementsExist = (elementosFields: { id: number; label: string }[]): Element[] => {
    let updatedElementos = [...elementos];
    
    elementosFields.forEach(field => {
      const elementExists = updatedElementos.find(elem => 
        elem.elemento_id === field.id || elem.tipo_elemento_afectado_id === field.id
      );
      
      if (!elementExists) {
        // Add missing element with zero quantity
        updatedElementos.push({
          elemento_id: field.id,
          nombre: field.label,
          cantidad_estimada: 0,
          cantidad_real: null,
          tipo_elemento_afectado_id: field.id
        });
      }
    });
    
    // Update state if new elements were added
    if (updatedElementos.length !== elementos.length) {
      setElementos(updatedElementos);
    }
    
    return updatedElementos;
  };

  const updateElementosWithNames = (elementos: Element[], elementosFields: { id: number; label: string }[]) => {
    return elementos.map(elem => {
      const elementField = elementosFields.find(field => field.id === elem.elemento_id || field.id === elem.tipo_elemento_afectado_id);
      if (elementField) {
        return { ...elem, nombre: elementField.label };
      }
      return elem;
    });
  };

  const updateElementosWithAIValues = (
    currentElementos: Element[], 
    weights: Record<string, number>,
    elementosFields: { id: number; label: string }[]
  ) => {
    const newElementos = elementosFields.map((field) => {
      const existingElement = currentElementos.find(e => 
        e.elemento_id === field.id || e.tipo_elemento_afectado_id === field.id
      );
      const value = weights[field.label] || 0;

      return existingElement 
        ? { ...existingElement, cantidad_estimada: value }
        : {
            elemento_id: field.id,
            nombre: field.label,
            cantidad_estimada: value,
            cantidad_real: null,
            tipo_elemento_afectado_id: field.id
          };
    });

    return newElementos;
  };

  return {
    elementos,
    setElementos,
    handleElementChange,
    updateElementosWithNames,
    updateElementosWithAIValues,
    ensureAllElementsExist
  };
}
