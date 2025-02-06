import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { ParametroEstimacion } from "@/types/parametroEstimacion";

export function useParametrosEstimacion(requirement: {
  requerimientoid: number;
}) {
  const [parametros, setParametros] = useState<ParametroEstimacion[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // console.log(requirement);

  useEffect(() => {
    const fetchParametros = async () => {
      try {
        const { data, error } = await supabase
          .from("tipo_parametro_estimacion")
          .select(
            `
            tipo_parametro_estimacionid,
            nombre,
            haselementosafectados,
            parametro_estimacion (
              parametro_estimacionid,
              nombre
            )
          `
          )
          .eq("fase_proyectoid", 2);

        if (error) throw error;
        setParametros(data || []);
      } catch (error) {
        setError(
          error instanceof Error ? error.message : "Error fetching parameters"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchParametros();
  }, []);

  return { parametros, loading, error };
}
