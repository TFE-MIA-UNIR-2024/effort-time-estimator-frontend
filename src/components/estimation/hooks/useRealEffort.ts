
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useRealEffort = (projectId: number, open: boolean) => {
  const { toast } = useToast();
  const [realEffort, setRealEffort] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Fetch real effort data
  useEffect(() => {
    if (open && projectId) {
      const fetchRealEffort = async () => {
        setLoading(true);
        try {
          const { data, error } = await supabase
            .from('proyecto')
            .select('*')
            .eq('proyectoid', projectId)
            .single();

          if (error) {
            console.error('Error fetching real effort:', error);
            setRealEffort("");
          } else {
            // Check if esfuerzo_real exists and is a number
            const realEffortValue = data.esfuerzo_real !== null && data.esfuerzo_real !== undefined
              ? data.esfuerzo_real.toString()
              : "";
            setRealEffort(realEffortValue);
          }
        } catch (error) {
          console.error('Error in real effort fetch:', error);
          setRealEffort("");
        } finally {
          setLoading(false);
        }
      };

      fetchRealEffort();
    }
  }, [open, projectId]);

  const handleSave = async () => {
    if (!realEffort) {
      toast({
        title: "Error",
        description: "Por favor ingresa un valor para el esfuerzo real",
        variant: "destructive",
      });
      return false;
    }

    setSaving(true);
    try {
      const parsedEffort = parseFloat(realEffort);
      
      // Update project with real effort
      const { error: projectUpdateError } = await supabase
        .from('proyecto')
        .update({ esfuerzo_real: parsedEffort })
        .eq('proyectoid', projectId);

      if (projectUpdateError) {
        console.error('Error saving real effort:', projectUpdateError);
        throw projectUpdateError;
      }

      toast({
        title: "Éxito",
        description: "Esfuerzo real guardado correctamente",
      });
      return true;
    } catch (error: any) {
      console.error('Error in save operation:', error);
      toast({
        title: "Error",
        description: `Ocurrió un error al guardar: ${error.message || error}`,
        variant: "destructive",
      });
      return false;
    } finally {
      setSaving(false);
    }
  };

  return {
    realEffort,
    setRealEffort,
    loading,
    saving,
    handleSave
  };
};
