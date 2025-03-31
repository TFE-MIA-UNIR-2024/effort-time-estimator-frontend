
import { useWeightsGenerator } from "./ai/useWeightsGenerator";
import { useRequirementsDetails } from "./ai/useRequirementsDetails";

export const useAIEstimation = () => {
  const { generateWeights } = useWeightsGenerator();
  const { getRequirementsDetails } = useRequirementsDetails();
  
  return {
    generateWeights,
    getRequirementsDetails
  };
};
