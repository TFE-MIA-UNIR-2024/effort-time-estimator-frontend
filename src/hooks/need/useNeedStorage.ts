
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { nanoid } from "nanoid";
import type { NeedFormValues } from "./useNeedForm";

interface SaveNeedParams {
  isEditing: boolean;
  needId?: number;
  projectId: number;
  values: NeedFormValues;
  file: File | null;
  existingUrl?: string;
}

export const useNeedStorage = () => {
  const { toast } = useToast();

  const uploadFile = async (file: File, projectId: number): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${nanoid()}.${fileExt}`;
    const filePath = `${projectId}/${fileName}`;
    
    const { error: uploadError } = await supabase.storage
      .from('needs_documents')
      .upload(filePath, file, {
        upsert: true,
      });

    if (uploadError) {
      throw uploadError;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('needs_documents')
      .getPublicUrl(filePath);
      
    return publicUrl;
  };

  const saveNeed = async ({
    isEditing,
    needId,
    projectId,
    values,
    file,
    existingUrl
  }: SaveNeedParams) => {
    try {
      let fileUrl = existingUrl || "";
      
      // Upload file if present
      if (file) {
        fileUrl = await uploadFile(file, projectId);
      }

      if (isEditing && needId) {
        // Update existing need
        const { error } = await supabase
          .from("necesidad")
          .update({ 
            nombrenecesidad: values.nombrenecesidad,
            codigonecesidad: values.codigonecesidad,
            cuerpo: values.cuerpo,
            url: fileUrl,
          })
          .eq("necesidadid", needId);

        if (error) {
          throw error;
        }
      } else {
        // Create new need
        const { error } = await supabase
          .from("necesidad")
          .insert([{ 
            nombrenecesidad: values.nombrenecesidad,
            codigonecesidad: values.codigonecesidad,
            cuerpo: values.cuerpo,
            proyectoid: projectId,
            url: fileUrl,
            fechacreacion: new Date().toISOString(),
          }]);

        if (error) {
          throw error;
        }
      }
      
      return true;
    } catch (error) {
      console.error("Error in Supabase operation:", error);
      toast({
        title: "Error",
        description: "Hubo un error al guardar en la base de datos",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    saveNeed
  };
};
