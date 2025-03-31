
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/components/ui/use-toast";
import { useNeedFileHandler } from "./useNeedFileHandler";
import { useNeedStorage } from "./useNeedStorage";

// Form schema definition
export const needFormSchema = z.object({
  nombrenecesidad: z.string().min(3, {
    message: "El nombre de la necesidad debe tener al menos 3 caracteres.",
  }),
  codigonecesidad: z.string().optional(),
  cuerpo: z.string(),
});

export type NeedFormValues = z.infer<typeof needFormSchema>;

export interface Need {
  necesidadid: number;
  nombrenecesidad: string;
  codigonecesidad?: string;
  cuerpo?: string;
  url?: string;
  proyectoid: number;
  fechacreacion?: string;
}

interface UseNeedFormProps {
  projectId: number;
  need?: Need | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function generateCode() {
  return `NEC-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
}

export const useNeedForm = ({ projectId, need, onSuccess, onCancel }: UseNeedFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const isEditing = !!need;
  
  // Initialize custom hooks
  const { 
    file, 
    isExtracting, 
    handleFileChange, 
    extractTextFromPdf 
  } = useNeedFileHandler();
  
  const { saveNeed } = useNeedStorage();

  // Initialize the form
  const form = useForm<NeedFormValues>({
    resolver: zodResolver(needFormSchema),
    defaultValues: {
      nombrenecesidad: need?.nombrenecesidad || "",
      codigonecesidad: need?.codigonecesidad || generateCode(),
      cuerpo: need?.cuerpo || "",
    },
  });

  const onSubmit = async (values: NeedFormValues) => {
    setIsSubmitting(true);
    
    try {
      const success = await saveNeed({
        isEditing,
        needId: need?.necesidadid,
        projectId,
        values,
        file,
        existingUrl: need?.url
      });

      if (success) {
        toast({
          title: isEditing ? "Necesidad actualizada" : "Necesidad creada",
          description: isEditing 
            ? "La necesidad ha sido actualizada exitosamente" 
            : "La necesidad ha sido creada exitosamente",
        });
        onSuccess();
      }
    } catch (error) {
      console.error("Error saving need:", error);
      toast({
        title: "Error",
        description: isEditing 
          ? "No se pudo actualizar la necesidad" 
          : "No se pudo crear la necesidad",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    form,
    isSubmitting,
    isExtracting,
    isEditing,
    file,
    handleFileChange,
    onSubmit,
    onCancel
  };
};
