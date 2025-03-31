
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, FileText } from "lucide-react";

interface NeedContentProps {
  content: string;
  url?: string;
}

const NeedContent = ({ content, url }: NeedContentProps) => {
  const [showFullContent, setShowFullContent] = useState(false);
  
  const toggleContent = () => {
    setShowFullContent(!showFullContent);
  };
  
  const truncateText = (text: string, maxLength: number = 500) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };
  
  const isTextLong = content && content.length > 500;
  const displayText = showFullContent ? content : truncateText(content);
  
  return (
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
      
      {url && (
        <div className="mt-4">
          <Button
            variant="outline"
            size="sm"
            className="flex items-center"
            asChild
          >
            <a href={url} target="_blank" rel="noopener noreferrer">
              <FileText className="h-4 w-4 mr-1" />
              Ver documento
            </a>
          </Button>
        </div>
      )}
    </div>
  );
};

export default NeedContent;
