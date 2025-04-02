
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

  const deleteNeed = async (needId: number): Promise<boolean> => {
    try {
      console.log("Deleting need with ID:", needId);
      
      // First, fetch all requirements associated with this need
      const { data: requirements, error: fetchError } = await supabase
        .from("requerimiento")
        .select("requerimientoid")
        .eq("necesidadid", needId);
      
      if (fetchError) {
        console.error("Error fetching requirements:", fetchError);
        throw fetchError;
      }
      
      console.log(`Found ${requirements?.length || 0} requirements to delete`);
      
      // Delete each requirement
      if (requirements && requirements.length > 0) {
        // First delete any related punto_funcion entries
        for (const req of requirements) {
          const { error: pfDeleteError } = await supabase
            .from("punto_funcion")
            .delete()
            .eq("requerimientoid", req.requerimientoid);
          
          if (pfDeleteError) {
            console.error(`Error deleting punto_funcion for requerimientoid ${req.requerimientoid}:`, pfDeleteError);
            // Continue with other deletions even if one fails
          }
        }
        
        // Then delete the requirements
        const { error: reqDeleteError } = await supabase
          .from("requerimiento")
          .delete()
          .eq("necesidadid", needId);
        
        if (reqDeleteError) {
          console.error("Error deleting requirements:", reqDeleteError);
          throw reqDeleteError;
        }
      }
      
      // Now delete the need itself
      const { error: needDeleteError } = await supabase
        .from("necesidad")
        .delete()
        .eq("necesidadid", needId);
      
      if (needDeleteError) {
        console.error("Error deleting need:", needDeleteError);
        throw needDeleteError;
      }
      
      return true;
    } catch (error) {
      console.error("Error in delete operation:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la necesidad. Compruebe si hay requerimientos asociados.",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    saveNeed,
    deleteNeed
  };
};
