
import ElementInput from "./ElementInput";

interface ElementsSectionProps {
  elementos: any[];
  elementosFields: { id: number; label: string }[];
  onElementChange: (id: number, value: string) => void;
}

const ElementsSection = ({ elementos, elementosFields, onElementChange }: ElementsSectionProps) => {
  // Create groups of elements for display in columns
  const elementosGroups = [];
  const itemsPerGroup = Math.ceil(elementosFields.length / 3);
  
  for (let i = 0; i < elementosFields.length; i += itemsPerGroup) {
    elementosGroups.push(elementosFields.slice(i, i + itemsPerGroup));
  }

  // Find element value by ID
  const getElementValue = (elementId: number) => {
    const element = elementos.find(elem => elem.elemento_id === elementId || elem.tipo_elemento_afectado_id === elementId);
    return element ? element.cantidad_estimada : 0;
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-x-4 gap-y-2">
        {elementosGroups.map((group, groupIndex) => (
          <div key={groupIndex} className="space-y-2">
            {group.map(elemento => (
              <ElementInput
                key={elemento.id}
                elementId={elemento.id}
                label={elemento.label}
                value={getElementValue(elemento.id)}
                onChange={onElementChange}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ElementsSection;
