
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import { useState } from "react";

interface ProjectCardProps {
  id: number;
  title: string;
  onEdit: () => void;
  onDelete?: () => void;
}

const ProjectCard = ({ id, title, onEdit, onDelete }: ProjectCardProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleViewDetails = () => {
    navigate(`/project/${id}`);
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      
      // First, fetch all needs associated with this project
      const { data: needs, error: fetchNeedsError } = await supabase
        .from("necesidad")
        .select("necesidadid")
        .eq("proyectoid", id);
      
      if (fetchNeedsError) {
        throw fetchNeedsError;
      }

      // For each need, delete associated requirements and their punto_funcion entries
      if (needs && needs.length > 0) {
        for (const need of needs) {
          // Get requirements for this need
          const { data: reqs, error: fetchReqsError } = await supabase
            .from("requerimiento")
            .select("requerimientoid")
            .eq("necesidadid", need.necesidadid);
          
          if (fetchReqsError) {
            throw fetchReqsError;
          }

          // Delete associated punto_funcion entries
          if (reqs && reqs.length > 0) {
            const reqIds = reqs.map(req => req.requerimientoid);
            const { error: deletePFError } = await supabase
              .from("punto_funcion")
              .delete()
              .in("requerimientoid", reqIds);
            
            if (deletePFError) {
              throw deletePFError;
            }
          }

          // Delete requirements for this need
          const { error: deleteReqsError } = await supabase
            .from("requerimiento")
            .delete()
            .eq("necesidadid", need.necesidadid);
          
          if (deleteReqsError) {
            throw deleteReqsError;
          }
        }

        // Delete all needs for this project
        const { error: deleteNeedsError } = await supabase
          .from("necesidad")
          .delete()
          .eq("proyectoid", id);
        
        if (deleteNeedsError) {
          throw deleteNeedsError;
        }
      }

      // Now delete the project itself
      const { error: deleteProjectError } = await supabase
        .from("proyecto")
        .delete()
        .eq("proyectoid", id);
      
      if (deleteProjectError) {
        throw deleteProjectError;
      }

      // Notify parent component to update the list
      if (onDelete) {
        onDelete();
      }

      toast({
        title: "Éxito",
        description: "Proyecto eliminado correctamente",
      });
    } catch (error) {
      console.error("Error deleting project:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el proyecto",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg p-5 mb-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-medium">{title}</h3>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={handleViewDetails}>
            Ver Detalles
          </Button>
          <Button variant="outline" size="sm" onClick={onEdit}>
            Editar
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                disabled={isDeleting}
              >
                {isDeleting ? "Eliminando..." : "Eliminar"}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acción eliminará el proyecto y todos los datos asociados (necesidades y requerimientos).
                  Esta acción no se puede deshacer.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleDelete} 
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  Eliminar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
