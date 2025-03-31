
import { Button } from "@/components/ui/button";
import ProjectCard from "./ProjectCard";

interface Project {
  id: number;
  title: string;
}

const MOCK_PROJECTS: Project[] = [
  { id: 1, title: "Implementación de Medio de Pago Visa" },
  { id: 2, title: "Implementación de Medio de Pago Mastercard" },
  { id: 3, title: "Proyecto 1" },
  { id: 4, title: "Proyecto 2" },
  { id: 5, title: "Plataforma de transacciones" },
  { id: 6, title: "Migración Laravel a NextJS" },
  { id: 7, title: "ejemplo" },
];

const ProjectList = () => {
  return (
    <div className="py-6 px-4 md:px-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Proyectos</h1>
        <Button className="bg-blue-700 hover:bg-blue-800">
          Nuevo Proyecto
        </Button>
      </div>
      
      <div className="space-y-4">
        {MOCK_PROJECTS.map((project) => (
          <ProjectCard key={project.id} title={project.title} />
        ))}
      </div>
    </div>
  );
};

export default ProjectList;
