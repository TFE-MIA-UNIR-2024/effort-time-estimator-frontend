
export interface RequirementItem {
  titulo: string;
  description: string;
}

export function formatRequirementsForDatabase(
  items: RequirementItem[],
  needId: string
): any[] {
  return items.map((item, index) => ({
    codigorequerimiento: `REQ-${String(index + 1).padStart(3, "0")}`,
    nombrerequerimiento: item.titulo,
    cuerpo: item.description,
    necesidadid: Number(needId),
    tiporequerimientoid: 1,
    fechacreacion: new Date().toISOString(),
  }));
}
