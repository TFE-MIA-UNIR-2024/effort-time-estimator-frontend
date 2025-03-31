
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import ProjectCard from "./ProjectCard";
import NewProjectForm from "./NewProjectForm";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface Project {
  proyectoid: number;
  nombreproyecto: string;
}

const ProjectList = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const { toast } = useToast();

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('proyecto')
        .select('*');

      if (error) {
        throw error;
      }

      setProjects(data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los proyectos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [toast]);

  const handleProjectSaved = () => {
    setDialogOpen(false);
    setCurrentProject(null);
    fetchProjects();
  };

  const handleEditProject = (project: Project) => {
    setCurrentProject(project);
    setDialogOpen(true);
  };

  return (
    <div className="py-6 px-4 md:px-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Proyectos</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-700 hover:bg-blue-800">
              <Plus className="mr-1 h-5 w-5" />
              Nuevo Proyecto
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {currentProject ? "Editar Proyecto" : "Crear Nuevo Proyecto"}
              </DialogTitle>
            </DialogHeader>
            <NewProjectForm 
              project={currentProject}
              onSuccess={handleProjectSaved} 
              onCancel={() => {
                setDialogOpen(false);
                setCurrentProject(null);
              }} 
            />
          </DialogContent>
        </Dialog>
      </div>
      
      {loading ? (
        <div className="py-8 text-center">Cargando proyectos...</div>
      ) : projects.length > 0 ? (
        <div className="space-y-4">
          {projects.map((project) => (
            <ProjectCard 
              key={project.proyectoid} 
              id={project.proyectoid} 
              title={project.nombreproyecto}
              onEdit={() => handleEditProject(project)}
            />
          ))}
        </div>
      ) : (
        <div className="py-8 text-center">No hay proyectos disponibles</div>
      )}
    </div>
  );
};

export default ProjectList;
