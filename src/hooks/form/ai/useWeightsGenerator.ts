
import { getPredictions } from "./predictionService";

export const useWeightsGenerator = () => {
  const generateWeights = async (
    requirementTitle: string,
    requirementBody: string,
    selectedElementIds?: number[],
    parameterEstimationIds?: number[]
  ): Promise<Record<string, number>> => {
    try {
      console.log(`Generating weights for requirement: ${requirementTitle}`);
      
      // Call prediction service
      const weights = await getPredictions(
        requirementTitle,
        requirementBody,
        selectedElementIds,
        parameterEstimationIds
      );
      
      console.log("Generated weights:", weights);
      return weights;
    } catch (error) {
      console.error("Error generating weights:", error);
      // Propagate the error instead of returning an empty object
      throw error;
    }
  };

  return { generateWeights };
};
