import {
  getRequirementsTitles,
  getRequirementDescription,
  getRequirementsDetails,
  DescriptionItem,
} from "@/lib/openAIMock";
import { supabase } from "@/lib/supabase";
import { WeightFormData } from "@/types/need";

export const extractRequirements = async (
  needId: string,
  needBody: string,
  onProgress: (progress: number) => void
) => {
  onProgress(0);
  const titles = await getRequirementsTitles(needBody);
  onProgress(20);

  const descriptions: DescriptionItem[] = [];
  const totalTitles = titles.length;
  
  for (let i = 0; i < totalTitles; i++) {
    const item = titles[i];
    const description = await getRequirementDescription(item.title, needBody);
    descriptions.push({
      titulo: item.title,
      description,
    });
    onProgress(20 + Math.round(((i + 1) / totalTitles) * 80));
  }

  const newRequirements = descriptions.map((item, index) => ({
    codigorequerimiento: `REQ-${String(index + 1).padStart(3, "0")}`,
    nombrerequerimiento: item.titulo,
    cuerpo: item.description,
    necesidadid: Number(needId),
    tiporequerimientoid: 1,
    fechacreacion: new Date().toISOString(),
  }));

  const { error } = await supabase.from("requerimiento").insert(newRequirements);
  if (error) throw error;

  onProgress(100);
  return newRequirements;
};

export const generateWeights = async (
  title: string,
  body: string
): Promise<WeightFormData> => {
  const details = await getRequirementsDetails([{ title }], body);
  
  if (!details || details.length === 0) {
    throw new Error("No weights generated");
  }

  const weights = details[0];
  return {
    Tablas: weights.tablas,
    "Triggers/SP": weights.triggersSP,
    "Interfaces c/aplicativos": weights.interfacesAplicativos,
    Formularios: weights.formularios,
    "Subrutinas complejas": weights.subrutinasComplejas,
    "Interfaces con BD": weights.interfacesBD,
    Reportes: weights.reportes,
    Componentes: weights.componentes,
    Javascript: weights.javascript,
    "Componentes Config. y Pruebas": weights.componentesConfigPruebas,
    "Despliegue app movil": weights.despliegueAppMovil,
    QA: weights.qa,
    PF: weights.pf,
  };
};
