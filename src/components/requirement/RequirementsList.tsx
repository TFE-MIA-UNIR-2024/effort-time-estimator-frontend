
import RequirementCard from "./RequirementCard";
import { Badge } from "@/components/ui/badge";

interface PuntoFuncion {
  cantidad_estimada: number | null;
  tipo_elemento_afectado_id: number | null;
  tipo_elemento_afectado: {
    nombre: string;
  } | null;
}

interface Requirement {
  requerimientoid: number;
  nombrerequerimiento: string;
  codigorequerimiento: string;
  fechacreacion: string;
  cuerpo?: string;
  necesidadid: number;
  punto_funcion?: PuntoFuncion[];
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
        <div key={req.requerimientoid} className="space-y-2">
          <RequirementCard
            requirement={req}
            onEditForm={onEditForm}
            onAddRealQuantity={onAddRealQuantity}
            onEdit={onEdit}
            onDelete={onDelete}
          />
          
          {req.punto_funcion && req.punto_funcion.length > 0 && (
            <div className="px-6 py-2 bg-slate-50 rounded-md">
              <h4 className="text-sm font-medium mb-2">Puntos de función:</h4>
              <div className="flex flex-wrap gap-2">
                {req.punto_funcion.map((pf, idx) => (
                  pf.cantidad_estimada && pf.cantidad_estimada > 0 ? (
                    <Badge key={idx} variant="outline" className="bg-white">
                      {pf.tipo_elemento_afectado?.nombre}: {pf.cantidad_estimada}
                    </Badge>
                  ) : null
                ))}
                {!req.punto_funcion.some(pf => pf.cantidad_estimada && pf.cantidad_estimada > 0) && (
                  <span className="text-sm text-muted-foreground italic">No hay puntos de función configurados</span>
                )}
              </div>
            </div>
          )}
        </div>
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
