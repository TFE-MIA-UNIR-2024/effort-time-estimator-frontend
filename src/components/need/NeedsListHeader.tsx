
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface NeedsListHeaderProps {
  onAddNeed: () => void;
}

const NeedsListHeader = ({ onAddNeed }: NeedsListHeaderProps) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-xl font-semibold">Necesidades del Cliente</h2>
      <div className="flex gap-2">
        <Button onClick={onAddNeed}>
          <Plus className="mr-1 h-5 w-5" />
          Agregar Necesidad
        </Button>
      </div>
    </div>
  );
};

export default NeedsListHeader;
