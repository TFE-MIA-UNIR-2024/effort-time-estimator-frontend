
import RequirementCard from "./RequirementCard";

interface Requirement {
  requerimientoid: number;
  nombrerequerimiento: string;
  codigorequerimiento: string;
  fechacreacion: string;
  cuerpo?: string;
  necesidadid: number;
}

interface RequirementsListProps {
  requirements: Requirement[];
  onEditForm: (id: number) => void;
  onAddRealQuantity: (id: number) => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

const RequirementsList = ({ 
  requirements, 
  onEditForm, 
  onAddRealQuantity, 
  onEdit, 
  onDelete 
}: RequirementsListProps) => {
  return (
    <div className="space-y-4">
      {requirements.map((req) => (
        <RequirementCard
          key={req.requerimientoid}
          requirement={req}
          onEditForm={onEditForm}
          onAddRealQuantity={onAddRealQuantity}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
      
      {requirements.length === 0 && (
        <div className="text-center py-8 bg-gray-50 border rounded-lg">
          <p className="text-gray-500">No hay requerimientos asociados a esta necesidad</p>
        </div>
      )}
    </div>
  );
};

export default RequirementsList;
