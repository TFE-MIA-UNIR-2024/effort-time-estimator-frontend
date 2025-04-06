
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { extractTextFromPDF } from "./pdf/pdfExtractor";

export const useNeedFileHandler = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const { toast } = useToast();

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    onTextExtracted?: (text: string) => void
  ) => {
    console.log("handleFileChange called");
    const files = e.target.files;
    if (!files || files.length === 0) {
      console.log("No files selected");
      return;
    }

    const selectedFile = files[0];
    console.log("File selected:", selectedFile.name);
    
    if (selectedFile.type !== 'application/pdf') {
      toast({
        title: "Error",
        description: "Solo se permiten archivos PDF",
        variant: "destructive",
      });
      return;
    }

    setFile(selectedFile);
    
    if (onTextExtracted) {
      console.log("Starting text extraction");
      setIsExtracting(true);
      
      try {
        const extractedText = await extractTextFromPDF(selectedFile);
        
        console.log("Text extracted, calling callback with text");
        onTextExtracted(extractedText);
        setIsExtracting(false);
        
        toast({
          title: "Texto extraído",
          description: "El texto ha sido extraído del PDF correctamente",
        });
      } catch (error) {
        console.error("Error extracting text:", error);
        setIsExtracting(false);
        toast({
          title: "Error",
          description: "No se pudo extraer el texto del PDF",
          variant: "destructive",
        });
      }
    } else {
      console.log("No text extraction callback provided");
    }
  };

  return {
    file,
    isExtracting,
    handleFileChange
  };
};
