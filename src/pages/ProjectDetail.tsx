
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import NavBar from "@/components/NavBar";
import NeedsList from "@/components/NeedsList";
import ProjectEstimationsSheet from "@/components/estimation/ProjectEstimationsSheet";

interface Project {
  proyectoid: number;
  nombreproyecto: string;
}

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [estimationsOpen, setEstimationsOpen] = useState(false);

  useEffect(() => {
    async function fetchProject() {
      try {
        if (!id) return;
        
        // Convert string id to number for the query
        const numericId = parseInt(id, 10);
        if (isNaN(numericId)) {
          throw new Error("Invalid project ID");
        }
        
        const { data, error } = await supabase
          .from('proyecto')
          .select('*')
          .eq('proyectoid', numericId)
          .single();

        if (error) {
          throw error;
        }

        setProject(data);
      } catch (error) {
        console.error('Error fetching project:', error);
        toast({
          title: "Error",
          description: "No se pudo cargar la información del proyecto",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }

    fetchProject();
  }, [id, toast]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <NavBar />
        <main className="flex-1 p-6">Cargando...</main>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <NavBar />
        <main className="flex-1 p-6">
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold mb-4">Proyecto no encontrado</h2>
            <Button onClick={() => navigate('/')}>Volver a Proyectos</Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <NavBar />
      <main className="flex-1">
        <div className="border-b border-gray-200">
          <div className="px-4 py-3 flex items-center justify-between">
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                size="sm" 
                className="mr-2"
                onClick={() => navigate('/')}
              >
                <ArrowLeft className="h-5 w-5 mr-1" />
                <span>Atrás</span>
              </Button>
              <h1 className="text-2xl font-bold">{project?.nombreproyecto}</h1>
            </div>
            <Button 
              variant="outline"
              onClick={() => setEstimationsOpen(true)}
            >
              Estimaciones
            </Button>
          </div>
        </div>
        
        <div className="p-6">
          {project && <NeedsList projectId={project.proyectoid} />}
        </div>
      </main>

      {project && (
        <ProjectEstimationsSheet
          projectId={project.proyectoid}
          open={estimationsOpen}
          onOpenChange={setEstimationsOpen}
        />
      )}
    </div>
  );
};

export default ProjectDetail;
