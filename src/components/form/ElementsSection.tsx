
import ElementInput from "./ElementInput";

interface ElementsSectionProps {
  elementos: Record<number, number>;
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

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold">Elementos afectados</h3>
      
      <div className="grid grid-cols-3 gap-x-4 gap-y-2">
        {elementosGroups.map((group, groupIndex) => (
          <div key={groupIndex} className="space-y-2">
            {group.map(elemento => (
              <ElementInput
                key={elemento.id}
                elementId={elemento.id}
                label={elemento.label}
                value={elementos[elemento.id] !== undefined ? elementos[elemento.id] : 0}
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
