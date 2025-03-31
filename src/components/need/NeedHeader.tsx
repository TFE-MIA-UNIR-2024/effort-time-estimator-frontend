
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, Cpu } from "lucide-react";

interface NeedHeaderProps {
  title: string;
  code: string;
  onGoBack: () => void;
  onAddRequirement: () => void;
  onExtractRequirements?: () => void;
}

const NeedHeader = ({ 
  title, 
  code, 
  onGoBack, 
  onAddRequirement, 
  onExtractRequirements 
}: NeedHeaderProps) => {
  return (
    <>
      <Button 
        variant="ghost" 
        size="sm" 
        className="mb-4"
        onClick={onGoBack}
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        <span>Back</span>
      </Button>
      
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold">{title}</h1>
          <p className="text-gray-600">Code: {code}</p>
        </div>
        <div className="flex space-x-2">
          {onExtractRequirements && (
            <Button onClick={onExtractRequirements} variant="outline" className="gap-2">
              <Cpu className="h-4 w-4" />
              Extraer Requerimientos con IA
            </Button>
          )}
          <Button onClick={onAddRequirement} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Requirement
          </Button>
        </div>
      </div>
    </>
  );
};

export default NeedHeader;
