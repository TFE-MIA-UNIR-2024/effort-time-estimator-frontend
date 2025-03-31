
/**
 * Utilities for formatting requirement data for database operations
 */

export interface RequirementItem {
  titulo: string;
  description: string;
}

/**
 * Format requirements data for insertion into the database
 */
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
