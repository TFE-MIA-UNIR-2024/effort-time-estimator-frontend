
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
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type !== 'application/pdf') {
        toast({
          title: "Error",
          description: "Solo se permiten archivos PDF",
          variant: "destructive",
        });
        return;
      }

      setFile(selectedFile);
      
      if (selectedFile.type === 'application/pdf' && onTextExtracted) {
        await extractTextFromPdf(selectedFile, onTextExtracted);
      }
    }
  };

  const extractTextFromPdf = async (
    pdfFile: File, 
    onTextExtracted: (text: string) => void
  ) => {
    setIsExtracting(true);
    
    try {
      // Simulating text extraction from PDF
      // In a real app, you would use a PDF parsing library or service
      setTimeout(() => {
        const extractedText = `Contenido extraído del PDF "${pdfFile.name}". 
        
Este es un texto de ejemplo simulando la extracción de contenido de un PDF.

El documento contiene información relevante para el proyecto que puede ser editada según sea necesario.`;
        
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
  };

  return {
    file,
    isExtracting,
    handleFileChange,
    extractTextFromPdf
  };
};
