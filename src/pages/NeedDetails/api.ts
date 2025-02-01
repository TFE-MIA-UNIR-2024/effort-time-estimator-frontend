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
    .select("*, tipo_elemento_afectado(activo)");

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

export const savePuntosFuncion = async (
  weightFormData: Record<string, number>,
  requirementId: number
) => {
  const tipoElementoMap: Record<string, number> = {
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

  const { error } = await supabase
    .from("punto_funcion")
    .insert(
      Object.entries(weightFormData).map(([key, value]) => ({
        cantidad_estimada: value,
        tipo_elemento_afectado_id: tipoElementoMap[key],
        requerimientoid: requirementId,
      }))
    );

  if (error) throw error;
};
