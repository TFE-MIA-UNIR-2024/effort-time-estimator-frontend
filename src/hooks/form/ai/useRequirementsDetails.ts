
import { DetailItem, TitleItem } from "../types";
import { callOpenAIAPI } from "./api-service";

export async function getRequirementsDetails(
  titles: TitleItem[],
  completeDocument: string
): Promise<DetailItem[]> {
  const prompt = `
    Eres un experto en extracción de datos estructurados. 
    Se te proporcionará una lista de títulos. 
    Para cada título, genera un objeto con la siguiente estructura:

    {
      "titulo": "Nombre del título",
      "description": "Descripción detallada del título",
      "tablas": <cantidad>,
      "triggersSP": <cantidad>,
      "interfacesAplicativos": <cantidad>,
      "formularios": <cantidad>,
      "subrutinasComplejas": <cantidad>,
      "interfacesBD": <cantidad>,
      "reportes": <cantidad>,
      "componentes": <cantidad>,
      "javascript": <cantidad>,
      "componentesConfigPruebas": <cantidad>,
      "despliegueAppMovil": <cantidad>,
      "qa": <cantidad>,
      "pf": <cantidad>
    }

    Donde cada uno de los siguientes campos:
      tablas,
      triggersSP,
      interfacesAplicativos,
      formularios,
      subrutinasComplejas,
      interfacesBD,
      reportes,
      componentes,
      javascript,
      componentesConfigPruebas,
      despliegueAppMovil,
      qa,
      pf

    Debe ser un **número entero** que represente la cantidad de veces que necesitara desarrollar cada uno
    de esos siguientes tipos de campos. Asigna estos valores de acuerdo con la
    complejidad que consideres para un desarrollador senior.

    Asegúrate de que los campos "difficulty" y "technologies" utilicen 
    solo las opciones proporcionadas.

    Lista de títulos:
    ${titles.map((item, index) => `${index + 1}. ${item.title}`).join("\n")}

    los titulos fueron generados a partir del siguiente document,
    este documento contiene la información completa de las necesidades del cliente:
    ${completeDocument}
  `;

  try {
    const parsed = await callOpenAIAPI(prompt);
    return parsed.items;
  } catch (error) {
    console.error("Error getting requirements details:", error);
    throw error;
  }
}

export const useRequirementsDetails = () => {
  return {
    getRequirementsDetails
  };
};
