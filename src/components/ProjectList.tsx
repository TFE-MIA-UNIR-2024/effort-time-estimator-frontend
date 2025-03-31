
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import ProjectCard from "./ProjectCard";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface Project {
  proyectoid: number;
  nombreproyecto: string;
}

const ProjectList = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchProjects() {
      try {
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
    }

    fetchProjects();
  }, [toast]);

  return (
    <div className="py-6 px-4 md:px-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Proyectos</h1>
        <Button className="bg-blue-700 hover:bg-blue-800">
          Nuevo Proyecto
        </Button>
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
