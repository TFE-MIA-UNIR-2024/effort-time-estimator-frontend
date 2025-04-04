
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Edit, Trash2, ClipboardList, Calculator } from "lucide-react";

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
            <p>Código: {requirement.codigorequerimiento}</p>
            <p>Creado: {formatDate(requirement.fechacreacion)}</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onEditForm(requirement.requerimientoid)}
            title="Editar formulario"
          >
            <ClipboardList className="h-4 w-4 mr-1" />
            Formulario
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onAddRealQuantity(requirement.requerimientoid)}
            title="Añadir cantidad real"
          >
            <Calculator className="h-4 w-4 mr-1" />
            Cantidad real
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onEdit(requirement.requerimientoid)}
            title="Editar requerimiento"
          >
            <Edit className="h-4 w-4 mr-1" />
            Editar
          </Button>
          <Button 
            variant="destructive" 
            size="sm"
            onClick={() => onDelete(requirement.requerimientoid)}
            title="Eliminar requerimiento"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Eliminar
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
