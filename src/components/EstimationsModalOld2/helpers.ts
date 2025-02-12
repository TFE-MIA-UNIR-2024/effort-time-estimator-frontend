import { supabase } from "@/lib/supabase";
import { NeedEstimation, ParametroEstimacion } from "./types";

export const calculateHours = (esfuerzo: number) => esfuerzo * 8;

export const fetchParametrosEstimacion = async () => {
  const { data, error } = await supabase
    .from("parametro_estimacion")
    .select(
      `
      parametro_estimacionid,
      nombre,
      factor,
      factor_ia,
      tipo_parametro_estimacion (
        nombre,
        haselementosafectados
      )
    `
    )
    .limit(6);

  if (error) throw error;
  return data;
};

export const fetchParametrosRequerimiento = async (requerimientoId: number) => {
  const { data, error } = await supabase
    .from("punto_funcion")
    .select(
      `
      cantidad_estimada,
      tipo_elemento_afectado!inner (
        elemento_afectado!inner (
          parametro_estimacion!inner (
            parametro_estimacionid,
            nombre,
            tipo_parametro_estimacion (
              nombre
            )
          )
        )
      )
    `
    )
    .eq("requerimiento_id", requerimientoId);

  if (error) throw error;

  return Array.from(
    new Set(
      data
        ?.flatMap((pf) => pf.tipo_elemento_afectado?.elemento_afectado)
        ?.flatMap((ea) => ea?.parametro_estimacion)
        ?.filter(Boolean)
    )
  );
};

export const sortNeeds = (needs: NeedEstimation[]) => {
  return [...needs].sort((a, b) => {
    const aComplete = a.requirements.every((req) => req.pf > 0);
    const bComplete = b.requirements.every((req) => req.pf > 0);

    if (aComplete === bComplete) {
      return b.totalEsfuerzo - a.totalEsfuerzo;
    }
    return aComplete ? -1 : 1;
  });
};
