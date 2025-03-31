
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import NavBar from "@/components/NavBar";
import EditFormDialog from "@/components/EditFormDialog";
import NeedHeader from "@/components/need/NeedHeader";
import NeedContent from "@/components/need/NeedContent";
import RequirementsList from "@/components/requirement/RequirementsList";

interface Need {
  necesidadid: number;
  nombrenecesidad: string;
  codigonecesidad: string;
  fechacreacion: string;
  cuerpo: string;
  url?: string;
  proyectoid: number;
}

interface Requirement {
  requerimientoid: number;
  nombrerequerimiento: string;
  codigorequerimiento: string;
  fechacreacion: string;
  cuerpo: string;
  necesidadid: number;
}

const NeedDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [need, setNeed] = useState<Need | null>(null);
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [loading, setLoading] = useState(true);
  const [editFormOpen, setEditFormOpen] = useState(false);
  const [selectedRequirementId, setSelectedRequirementId] = useState<number | null>(null);

  useEffect(() => {
    async function fetchNeedAndRequirements() {
      try {
        if (!id) return;
        
        const numericId = parseInt(id, 10);
        if (isNaN(numericId)) {
          throw new Error("Invalid need ID");
        }
        
        const { data: needData, error: needError } = await supabase
          .from('necesidad')
          .select('*')
          .eq('necesidadid', numericId)
          .single();

        if (needError) {
          throw needError;
        }

        setNeed(needData);
        
        const { data: reqData, error: reqError } = await supabase
          .from('requerimiento')
          .select('*')
          .eq('necesidadid', numericId);

        if (reqError) {
          throw reqError;
        }

        setRequirements(reqData || []);
      } catch (error) {
        console.error('Error fetching need details:', error);
        toast({
          title: "Error",
          description: "No se pudo cargar la información de la necesidad",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }

    fetchNeedAndRequirements();
  }, [id, toast]);

  const handleAddRequirement = () => {
    toast({
      title: "Función no implementada",
      description: "La función para agregar requerimientos está pendiente de implementar",
    });
  };

  const handleGoBack = () => {
    navigate(`/project/${need?.proyectoid}`);
  };

  const handleEditForm = (requirementId: number) => {
    setSelectedRequirementId(requirementId);
    setEditFormOpen(true);
  };
  
  const handleAddRealQuantity = (requirementId: number) => {
    toast({
      title: "Función no implementada",
      description: "La función para añadir cantidad real está pendiente de implementar",
    });
  };
  
  const handleEditRequirement = (requirementId: number) => {
    toast({
      title: "Función no implementada",
      description: "La función para editar requerimientos está pendiente de implementar",
    });
  };
  
  const handleDeleteRequirement = (requirementId: number) => {
    toast({
      title: "Función no implementada",
      description: "La función para eliminar requerimientos está pendiente de implementar",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <NavBar />
        <main className="flex-1 p-6">Cargando...</main>
      </div>
    );
  }

  if (!need) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <NavBar />
        <main className="flex-1 p-6">
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold mb-4">Necesidad no encontrada</h2>
            <button onClick={() => navigate(`/project/`)}>
              Volver a Proyectos
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <NavBar />
      <main className="flex-1 container mx-auto px-4 py-6">
        <NeedHeader 
          title={need.nombrenecesidad}
          code={need.codigonecesidad}
          onGoBack={handleGoBack}
          onAddRequirement={handleAddRequirement}
        />
        
        {need.cuerpo && (
          <NeedContent content={need.cuerpo} url={need.url} />
        )}
        
        <RequirementsList 
          requirements={requirements}
          onEditForm={handleEditForm}
          onAddRealQuantity={handleAddRealQuantity}
          onEdit={handleEditRequirement}
          onDelete={handleDeleteRequirement}
        />
      </main>

      {selectedRequirementId && (
        <EditFormDialog 
          open={editFormOpen} 
          onOpenChange={setEditFormOpen} 
          requerimientoId={selectedRequirementId} 
        />
      )}
    </div>
  );
};

export default NeedDetail;
