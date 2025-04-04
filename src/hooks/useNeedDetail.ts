
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useNeedDetail = (needId: string | undefined) => {
  const [need, setNeed] = useState<any>(null);
  const [requirements, setRequirements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNeedDetail = async () => {
      if (!needId) return;
      
      try {
        setLoading(true);
        
        // Convert string needId to number for database query
        const needIdNumber = parseInt(needId);
        
        if (isNaN(needIdNumber)) {
          console.error('Invalid need ID:', needId);
          return;
        }
        
        // Fetch need details
        const { data: needData, error: needError } = await supabase
          .from('necesidad')
          .select('*')
          .eq('necesidadid', needIdNumber)
          .maybeSingle();
        
        if (needError) throw needError;
        setNeed(needData);
        
        // Fetch requirements for the need
        const { data: requirementsData, error: reqError } = await supabase
          .from('requerimiento')
          .select('*')
          .eq('necesidadid', needIdNumber);
        
        if (reqError) throw reqError;
        
        // For each requirement, fetch its function points
        const requirementsWithPF = await Promise.all(
          requirementsData.map(async (req) => {
            const { data: puntosFuncion, error: pfError } = await supabase
              .from('punto_funcion')
              .select(`
                cantidad_estimada,
                tipo_elemento_afectado_id,
                tipo_elemento_afectado (
                  nombre
                )
              `)
              .eq('requerimientoid', req.requerimientoid);
            
            if (pfError) {
              console.error(`Error fetching function points for requirement ${req.requerimientoid}:`, pfError);
              return { ...req, punto_funcion: [] };
            }
            
            console.log(`Punto funcion data received for req ${req.requerimientoid}:`, puntosFuncion);
            return { ...req, punto_funcion: puntosFuncion || [] };
          })
        );
        
        setRequirements(requirementsWithPF);
      } catch (error) {
        console.error('Error fetching need details:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchNeedDetail();
  }, [needId]);
  
  const refetchRequirements = async () => {
    if (!needId) return;
    
    try {
      setLoading(true);
      
      // Convert string needId to number for database query
      const needIdNumber = parseInt(needId);
      
      if (isNaN(needIdNumber)) {
        console.error('Invalid need ID:', needId);
        return;
      }
      
      // Fetch requirements for the need
      const { data: requirementsData, error: reqError } = await supabase
        .from('requerimiento')
        .select('*')
        .eq('necesidadid', needIdNumber);
      
      if (reqError) throw reqError;
      
      // For each requirement, fetch its function points - make sure we get fresh data
      const requirementsWithPF = await Promise.all(
        requirementsData.map(async (req) => {
          // Clear cache by adding a timestamp query param
          const timestamp = new Date().getTime();
          
          const { data: puntosFuncion, error: pfError } = await supabase
            .from('punto_funcion')
            .select(`
              cantidad_estimada,
              tipo_elemento_afectado_id,
              tipo_elemento_afectado (
                nombre
              )
            `)
            .eq('requerimientoid', req.requerimientoid);
          
          if (pfError) {
            console.error(`Error fetching function points for requirement ${req.requerimientoid}:`, pfError);
            return { ...req, punto_funcion: [] };
          }
          
          console.log(`Punto funcion data received for req ${req.requerimientoid}:`, puntosFuncion);
          return { ...req, punto_funcion: puntosFuncion || [] };
        })
      );
      
      setRequirements(requirementsWithPF);
    } catch (error) {
      console.error('Error refetching requirements:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return { need, requirements, loading, refetchRequirements };
};
