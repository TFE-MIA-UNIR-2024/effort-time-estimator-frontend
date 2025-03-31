
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";

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
        console.log("Simulating text extraction from PDF");
        // Simulating text extraction from PDF
        // In a real app, you would use a PDF parsing library or service
        setTimeout(() => {
          const extractedText = `Contenido extraído del PDF "${selectedFile.name}". 
          
Este es un texto de ejemplo simulando la extracción de contenido de un PDF.

El documento contiene información relevante para el proyecto que puede ser editada según sea necesario.`;
          
          console.log("Text extracted, calling callback with text");
          onTextExtracted(extractedText);
          setIsExtracting(false);
          
          toast({
            title: "Texto extraído",
            description: "El texto ha sido extraído del PDF correctamente",
          });
        }, 1500);
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
