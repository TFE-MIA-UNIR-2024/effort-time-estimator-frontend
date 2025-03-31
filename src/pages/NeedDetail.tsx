import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import { ArrowLeft, FileText, ChevronDown, ChevronUp } from "lucide-react";
import NavBar from "@/components/NavBar";
import EditFormDialog from "@/components/EditFormDialog";

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
  const [showFullContent, setShowFullContent] = useState(false);
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

  const truncateText = (text: string, maxLength: number = 500) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  const toggleContent = () => {
    setShowFullContent(!showFullContent);
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
            <Button onClick={() => navigate(`/project/${need?.proyectoid || ''}`)}>
              Volver a Proyecto
            </Button>
          </div>
        </main>
      </div>
    );
  }

  const isTextLong = need.cuerpo && need.cuerpo.length > 500;
  const displayText = showFullContent ? need.cuerpo : truncateText(need.cuerpo || "");

  const handleAddRequirement = () => {
    toast({
      title: "Función no implementada",
      description: "La función para agregar requerimientos está pendiente de implementar",
    });
  };

  const handleGoBack = () => {
    navigate(`/project/${need.proyectoid}`);
  };

  const handleEditForm = (requirementId: number) => {
    setSelectedRequirementId(requirementId);
    setEditFormOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <NavBar />
      <main className="flex-1 container mx-auto px-4 py-6">
        <Button 
          variant="ghost" 
          size="sm" 
          className="mb-4"
          onClick={handleGoBack}
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          <span>Back</span>
        </Button>
        
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold">{need.nombrenecesidad}</h1>
            <p className="text-gray-600">Code: {need.codigonecesidad}</p>
          </div>
          <Button onClick={handleAddRequirement}>
            Add Requirement
          </Button>
        </div>
        
        {need.cuerpo && (
          <div className="mb-8 bg-white p-6 rounded-lg border">
            <p className="whitespace-pre-line">{displayText}</p>
            
            {isTextLong && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={toggleContent} 
                className="mt-2 text-blue-600"
              >
                {showFullContent ? (
                  <>
                    <ChevronUp className="h-4 w-4 mr-1" />
                    Ver menos
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4 mr-1" />
                    Ver más
                  </>
                )}
              </Button>
            )}
            
            {need.url && (
              <div className="mt-4">
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
              </div>
            )}
          </div>
        )}
        
        <div className="space-y-4">
          {requirements.map((req) => (
            <Card key={req.requerimientoid} className="p-6">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-xl font-semibold">{req.nombrerequerimiento}</h3>
                  <div className="text-sm text-gray-500">
                    <p>Code: {req.codigorequerimiento}</p>
                    <p>Created: {formatDate(req.fechacreacion)}</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleEditForm(req.requerimientoid)}
                  >
                    Edit Form
                  </Button>
                  <Button variant="outline" size="sm">
                    Añadir cantidad real
                  </Button>
                  <Button variant="outline" size="sm">
                    Edit
                  </Button>
                  <Button variant="destructive" size="sm">
                    Delete
                  </Button>
                </div>
              </div>
              {req.cuerpo && (
                <p className="mt-2">{req.cuerpo}</p>
              )}
            </Card>
          ))}
          
          {requirements.length === 0 && (
            <div className="text-center py-8 bg-gray-50 border rounded-lg">
              <p className="text-gray-500">No hay requerimientos asociados a esta necesidad</p>
            </div>
          )}
        </div>
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
