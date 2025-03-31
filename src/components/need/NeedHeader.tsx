
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface NeedHeaderProps {
  title: string;
  code: string;
  onGoBack: () => void;
  onAddRequirement: () => void;
}

const NeedHeader = ({ title, code, onGoBack, onAddRequirement }: NeedHeaderProps) => {
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
        <Button onClick={onAddRequirement}>
          Add Requirement
        </Button>
      </div>
    </>
  );
};

export default NeedHeader;
