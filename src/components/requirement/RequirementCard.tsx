
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface RequirementCardProps {
  requirement: {
    requerimientoid: number;
    nombrerequerimiento: string;
    codigorequerimiento: string;
    fechacreacion: string;
    cuerpo?: string;
  };
  onEditForm: (id: number) => void;
  onAddRealQuantity: (id: number) => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

const RequirementCard = ({ 
  requirement, 
  onEditForm, 
  onAddRealQuantity, 
  onEdit, 
  onDelete 
}: RequirementCardProps) => {
  return (
    <Card className="p-6">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="text-xl font-semibold">{requirement.nombrerequerimiento}</h3>
          <div className="text-sm text-gray-500">
            <p>Code: {requirement.codigorequerimiento}</p>
            <p>Created: {formatDate(requirement.fechacreacion)}</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onEditForm(requirement.requerimientoid)}
          >
            Edit Form
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onAddRealQuantity(requirement.requerimientoid)}
          >
            Añadir cantidad real
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onEdit(requirement.requerimientoid)}
          >
            Edit
          </Button>
          <Button 
            variant="destructive" 
            size="sm"
            onClick={() => onDelete(requirement.requerimientoid)}
          >
            Delete
          </Button>
        </div>
      </div>
      {requirement.cuerpo && (
        <p className="mt-2">{requirement.cuerpo}</p>
      )}
    </Card>
  );
};

export default RequirementCard;
