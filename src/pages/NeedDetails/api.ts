import { supabase } from "@/lib/supabase";
import { Need, Requirement } from "@/types/need";
import { FormData } from "./types";

export const fetchNeed = async (id: string): Promise<Need> => {
  const { data, error } = await supabase
    .from("necesidad")
    .select("*")
    .eq("necesidadid", id)
    .single();

  if (error) throw error;
  if (!data) throw new Error("Need not found");

  return data;
};

export const fetchPuntosFuncion = async () => {
  const { data, error } = await supabase
    .from("punto_funcion")
    .select("*, tipo_elemento_afectado(activo), parametro_estimacion(*)");

  if (error) throw error;
  return data;
};

export const fetchRequirements = async (id: string): Promise<Requirement[]> => {
  const { data, error } = await supabase
    .from("requerimiento")
    .select("*")
    .eq("necesidadid", id)
    .order("fechacreacion", { ascending: false });

  if (error) throw error;
  return data || [];
};

export const saveRequirement = async (
  formData: FormData,
  needId: string,
  editingRequirementId?: number
) => {
  if (editingRequirementId) {
    const { error } = await supabase
      .from("requerimiento")
      .update({
        codigorequerimiento: formData.codigorequerimiento,
        nombrerequerimiento: formData.nombrerequerimiento,
        cuerpo: formData.cuerpo,
      })
      .eq("requerimientoid", editingRequirementId);

    if (error) throw error;
  } else {
    const { error } = await supabase.from("requerimiento").insert([
      {
        codigorequerimiento: formData.codigorequerimiento,
        nombrerequerimiento: formData.nombrerequerimiento,
        cuerpo: formData.cuerpo,
        necesidadid: needId,
        tiporequerimientoid: 1,
        fechacreacion: new Date().toISOString(),
      },
    ]);

    if (error) throw error;
  }
};

export const deleteRequirement = async (requirementId: number) => {
  const { error } = await supabase
    .from("requerimiento")
    .delete()
    .eq("requerimientoid", requirementId);

  if (error) throw error;
};

export const tipoElementoMap: Record<string, number> = {
  Tablas: 1,
  "Triggers/SP": 2,
  "Interfaces c/aplicativos": 3,
  Formularios: 4,
  "Subrutinas complejas": 5,
  "Interfaces con BD": 6,
  Reportes: 7,
  Componentes: 8,
  Javascript: 9,
  "Componentes Config. y Pruebas": 10,
  "Despliegue app movil": 11,
  QA: 12,
  PF: 13,
};

export const savePuntosFuncion = async (
  weightFormData: Record<string, number>,
  requirementId: number,
  selectedParameters: Record<number, number>
) => {
  // First delete existing records for this requirement
  const { error: deleteError } = await supabase
    .from("punto_funcion")
    .delete()
    .eq("requerimientoid", requirementId);

  if (deleteError) throw deleteError;

  // Then insert new records with both weights and parameters
  const records = Object.entries(weightFormData).map(([key, value]) => ({
    cantidad_estimada: value,
    tipo_elemento_afectado_id: tipoElementoMap[key],
    requerimientoid: requirementId,
  }));

  const recordsWithParams = Object.entries(selectedParameters).map(
    ([key, value]) => ({
      parametro_estimacionid: value,
      requerimientoid: requirementId,
    })
  );

  records.push(...recordsWithParams);

  const { error: insertError } = await supabase
    .from("punto_funcion")
    .insert(records);

  if (insertError) throw insertError;
};

export const saveParametroEstimacion = async (
  valor_parametro_estimacionid: number,
  requirementId: number
) => {
  const { error } = await supabase.from("punto_funcion").insert({
    parametro_estimacionid: valor_parametro_estimacionid,
    requerimientoid: requirementId,
  });

  if (error) throw error;
};

export const saveRealPuntosFuncion = async (
  weights: Array<{ cantidad_real: number; tipo_elemento_afectado_id: number }>,
  requirementId: number
) => {
  for (const weight of weights) {
    console.log("weight", weight);

    const { error } = await supabase
      .from("punto_funcion")
      .update({ cantidad_real: weight.cantidad_real })
      .eq("requerimientoid", requirementId)
      .eq("tipo_elemento_afectado_id", weight.tipo_elemento_afectado_id);

    if (error) throw error;
  }
};
