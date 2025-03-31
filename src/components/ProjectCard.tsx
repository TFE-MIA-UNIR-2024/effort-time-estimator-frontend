
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface ProjectCardProps {
  id: number;
  title: string;
}

const ProjectCard = ({ id, title }: ProjectCardProps) => {
  const navigate = useNavigate();

  const handleViewDetails = () => {
    navigate(`/project/${id}`);
  };

  return (
    <div className="border border-gray-200 rounded-lg p-5 mb-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-medium">{title}</h3>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={handleViewDetails}>
            Ver Detalles
          </Button>
          <Button variant="outline" size="sm">
            Editar
          </Button>
          <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">
            Eliminar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
