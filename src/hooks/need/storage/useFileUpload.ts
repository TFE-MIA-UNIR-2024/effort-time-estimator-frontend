
import { supabase } from "@/integrations/supabase/client";
import { nanoid } from "nanoid";

export const useFileUpload = () => {
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

  return { uploadFile };
};
