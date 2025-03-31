
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import NavBar from "@/components/NavBar";
import EditFormDialog from "@/components/EditFormDialog";
import NeedHeader from "@/components/need/NeedHeader";
import NeedContent from "@/components/need/NeedContent";
import RequirementsList from "@/components/requirement/RequirementsList";
import { useNeedDetail } from "@/hooks/useNeedDetail";

const NeedDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { need, requirements, loading } = useNeedDetail(id);
  const [editFormOpen, setEditFormOpen] = useState(false);
  const [selectedRequirementId, setSelectedRequirementId] = useState<number | null>(null);

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
