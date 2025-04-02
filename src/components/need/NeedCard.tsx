
import { Need } from "@/hooks/need/types";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, MoreVertical } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NeedCardProps {
  need: Need;
  onEdit: (need: Need) => void;
  onDelete: (needId: number) => void;
}

const NeedCard = ({ need, onEdit, onDelete }: NeedCardProps) => {
  const navigate = useNavigate();

  const handleViewDetails = () => {
    navigate(`/need/${need.necesidadid}`);
  };

  return (
    <Card key={need.necesidadid} className="overflow-hidden">
      <CardContent className="p-0">
        <div className="p-5">
          <div className="flex justify-between items-start mb-1">
            <h3 className="text-lg font-medium">{need.nombrenecesidad}</h3>
            <div className="flex space-x-2">
              {need.url && (
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center"
                  asChild
                >
                  <a href={need.url} target="_blank" rel="noopener noreferrer">
                    <FileText className="h-4 w-4 mr-1" />
                    Ver documento
                  </a>
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleViewDetails}
              >
                Ver Detalles
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit(need)}>
                    Editar
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="text-red-600"
                    onClick={() => onDelete(need.necesidadid)}
                  >
                    Eliminar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <div className="text-sm text-gray-500">
            <p>Código: {need.codigonecesidad || 'N/A'}</p>
            <p>Creado: {formatDate(need.fechacreacion) || 'Fecha no disponible'}</p>
            {need.cuerpo && (
              <div className="mt-3 text-sm line-clamp-2">
                {need.cuerpo}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default NeedCard;
