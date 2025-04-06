
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import NavBar from "@/components/NavBar";
import EditFormDialog from "@/components/EditFormDialog";
import RealQuantityDialog from "@/components/RealQuantityDialog";
import NeedHeader from "@/components/need/NeedHeader";
import NeedContent from "@/components/need/NeedContent";
import RequirementsList from "@/components/requirement/RequirementsList";
import { useNeedDetail } from "@/hooks/useNeedDetail";
import RequirementFormDialog from "@/components/requirement/RequirementFormDialog";
import { supabase } from "@/integrations/supabase/client";

const NeedDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { need, requirements, loading, refetchRequirements } = useNeedDetail(id);
  const [editFormOpen, setEditFormOpen] = useState(false);
  const [realQuantityOpen, setRealQuantityOpen] = useState(false);
  const [selectedRequirementId, setSelectedRequirementId] = useState<number | null>(null);
  const [requirementFormOpen, setRequirementFormOpen] = useState(false);
  const [selectedRequirement, setSelectedRequirement] = useState<any>(null);

  const handleAddRequirement = () => {
    setSelectedRequirement(null);
    setRequirementFormOpen(true);
  };

  const handleGoBack = () => {
    navigate(`/project/${need?.proyectoid}`);
  };

  const handleEditForm = (requirementId: number) => {
    console.log("Fetching data for requerimiento:", requirementId);
    setSelectedRequirementId(requirementId);
    setEditFormOpen(true);
  };
  
  const handleAddRealQuantity = (requirementId: number) => {
    setSelectedRequirementId(requirementId);
    setRealQuantityOpen(true);
  };
  
  const handleEditRequirement = (requirementId: number) => {
    const requirement = requirements.find(req => req.requerimientoid === requirementId);
    if (requirement) {
      setSelectedRequirement(requirement);
      setRequirementFormOpen(true);
    }
  };
  
  const handleDeleteRequirement = async (requirementId: number) => {
    try {
      const { error } = await supabase
        .from('requerimiento')
        .delete()
        .eq('requerimientoid', requirementId);
      
      if (error) throw error;
      
      toast({
        title: "Requerimiento eliminado",
        description: "El requerimiento ha sido eliminado correctamente",
      });
      refetchRequirements();
    } catch (error) {
      console.error('Error deleting requirement:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el requerimiento",
        variant: "destructive",
      });
    }
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
        <>
          <EditFormDialog 
            open={editFormOpen} 
            onOpenChange={setEditFormOpen} 
            requerimientoId={selectedRequirementId} 
          />
          <RealQuantityDialog
            open={realQuantityOpen}
            onOpenChange={setRealQuantityOpen}
            requerimientoId={selectedRequirementId}
          />
        </>
      )}

      <RequirementFormDialog
        open={requirementFormOpen}
        onOpenChange={setRequirementFormOpen}
        onSuccess={refetchRequirements}
        requirement={selectedRequirement}
      />
    </div>
  );
};

export default NeedDetail;
