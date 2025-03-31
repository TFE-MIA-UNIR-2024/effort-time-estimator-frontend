
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
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${nanoid()}.${fileExt}`;
      const filePath = `${projectId}/${fileName}`;
      
      console.log("Uploading file to storage bucket:", filePath);
      
      const { error: uploadError, data } = await supabase.storage
        .from('needs_documents')
        .upload(filePath, file, {
          upsert: true,
        });

      if (uploadError) {
        console.error("Error uploading file:", uploadError);
        throw uploadError;
      }

      console.log("File uploaded successfully, getting public URL");
      
      const { data: { publicUrl } } = supabase.storage
        .from('needs_documents')
        .getPublicUrl(filePath);
        
      console.log("Got public URL:", publicUrl);
      return publicUrl;
    } catch (error) {
      console.error("Error in uploadFile function:", error);
      throw error;
    }
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
        try {
          fileUrl = await uploadFile(file, projectId);
        } catch (error) {
          console.error("Error uploading file:", error);
          toast({
            title: "Error",
            description: "No se pudo subir el archivo. Por favor, inténtelo de nuevo.",
            variant: "destructive",
          });
          // Continue with saving the need without the file
        }
      }

      console.log("Saving need to database", {
        isEditing,
        needId,
        fileUrl,
        values
      });

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
          console.error("Error updating need:", error);
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
          console.error("Error creating need:", error);
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
