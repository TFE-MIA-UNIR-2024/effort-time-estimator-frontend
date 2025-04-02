
import { useWeightsGenerator } from "./ai/useWeightsGenerator";

export const useAIEstimation = () => {
  const { generateWeights } = useWeightsGenerator();
  
  return {
    generateWeights
  };
};
