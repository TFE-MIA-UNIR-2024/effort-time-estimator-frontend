
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import { MoreVertical, FileText, Plus } from "lucide-react";
import NeedForm from "./NeedForm";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Need {
  necesidadid: number;
  nombrenecesidad: string;
  codigonecesidad: string;
  fechacreacion: string;
  cuerpo: string;
  url?: string;
  proyectoid: number;
}

const NeedsList = ({ projectId }: { projectId: number }) => {
  const [needs, setNeeds] = useState<Need[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentNeed, setCurrentNeed] = useState<Need | null>(null);
  const { toast } = useToast();

  const fetchNeeds = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('necesidad')
        .select('*')
        .eq('proyectoid', projectId);

      if (error) {
        throw error;
      }

      setNeeds(data || []);
    } catch (error) {
      console.error('Error fetching needs:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las necesidades del cliente",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNeeds();
  }, [projectId, toast]);

  const handleNeedSaved = () => {
    setDialogOpen(false);
    setCurrentNeed(null);
    fetchNeeds();
  };

  const handleEditNeed = (need: Need) => {
    setCurrentNeed(need);
    setDialogOpen(true);
  };

  const handleViewDetails = (need: Need) => {
    // Here you would handle viewing the need details
    // For now just show a toast to demonstrate the functionality
    toast({
      title: "Ver detalles",
      description: `Viendo detalles de ${need.nombrenecesidad}`,
    });
  };

  const handleDeleteNeed = async (needId: number) => {
    try {
      const { error } = await supabase
        .from('necesidad')
        .delete()
        .eq('necesidadid', needId);

      if (error) {
        throw error;
      }

      toast({
        title: "Eliminado",
        description: "La necesidad ha sido eliminada correctamente",
      });
      fetchNeeds();
    } catch (error) {
      console.error('Error deleting need:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la necesidad",
        variant: "destructive",
      });
    }
  };

  const handleAddNeed = () => {
    setCurrentNeed(null);
    setDialogOpen(true);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Necesidades del Cliente</h2>
        <div className="flex gap-2">
          <Button onClick={handleAddNeed}>
            <Plus className="mr-1 h-5 w-5" />
            Agregar Necesidad
          </Button>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {currentNeed ? "Editar Necesidad" : "Crear Nueva Necesidad"}
            </DialogTitle>
          </DialogHeader>
          <NeedForm 
            projectId={projectId}
            need={currentNeed}
            onSuccess={handleNeedSaved} 
            onCancel={() => {
              setDialogOpen(false);
              setCurrentNeed(null);
            }} 
          />
        </DialogContent>
      </Dialog>

      {loading ? (
        <div className="py-8 text-center">Cargando necesidades...</div>
      ) : needs.length > 0 ? (
        <div className="space-y-4">
          {needs.map((need) => (
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
                        onClick={() => handleViewDetails(need)}
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
                          <DropdownMenuItem onClick={() => handleEditNeed(need)}>
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-red-600"
                            onClick={() => handleDeleteNeed(need.necesidadid)}
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
          ))}
        </div>
      ) : (
        <div className="py-8 text-center border rounded-lg bg-gray-50">
          No hay necesidades registradas para este proyecto
        </div>
      )}
    </div>
  );
};

export default NeedsList;
