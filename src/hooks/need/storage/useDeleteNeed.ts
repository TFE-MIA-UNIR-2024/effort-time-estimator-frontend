
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export const useDeleteNeed = () => {
  const { toast } = useToast();

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

  return { deleteNeed };
};
