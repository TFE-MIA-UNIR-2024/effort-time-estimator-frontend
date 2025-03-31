
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export interface Need {
  necesidadid: number;
  nombrenecesidad: string;
  codigonecesidad: string;
  fechacreacion: string;
  cuerpo: string;
  url?: string;
  proyectoid: number;
}

export interface Requirement {
  requerimientoid: number;
  nombrerequerimiento: string;
  codigorequerimiento: string;
  fechacreacion: string;
  cuerpo?: string;
  necesidadid: number;
}

interface UseNeedDetailReturn {
  need: Need | null;
  requirements: Requirement[];
  loading: boolean;
}

export const useNeedDetail = (needId: string | undefined): UseNeedDetailReturn => {
  const { toast } = useToast();
  const [need, setNeed] = useState<Need | null>(null);
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNeedAndRequirements() {
      try {
        if (!needId) return;
        
        const numericId = parseInt(needId, 10);
        if (isNaN(numericId)) {
          throw new Error("Invalid need ID");
        }
        
        const { data: needData, error: needError } = await supabase
          .from('necesidad')
          .select('*')
          .eq('necesidadid', numericId)
          .single();

        if (needError) {
          throw needError;
        }

        setNeed(needData);
        
        const { data: reqData, error: reqError } = await supabase
          .from('requerimiento')
          .select('*')
          .eq('necesidadid', numericId);

        if (reqError) {
          throw reqError;
        }

        setRequirements(reqData || []);
      } catch (error) {
        console.error('Error fetching need details:', error);
        toast({
          title: "Error",
          description: "No se pudo cargar la información de la necesidad",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }

    fetchNeedAndRequirements();
  }, [needId, toast]);

  return { need, requirements, loading };
};
