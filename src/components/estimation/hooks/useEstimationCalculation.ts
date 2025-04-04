
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { 
  fetchParameters, 
  fetchNeedsForProject, 
  fetchRequirementsWithEstimations 
} from "./estimationService";
import { 
  Requirement, 
  NeedEstimation, 
  ParametroEstimacion 
} from "./types";

export const useEstimationCalculation = (projectId: number, open: boolean) => {
  const [needsEstimations, setNeedsEstimations] = useState<NeedEstimation[]>([]);
  const [parametros, setParametros] = useState<ParametroEstimacion[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalProjectHours, setTotalProjectHours] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();

  const calculateTotalProjectHours = (needsWithEstimations: NeedEstimation[]) => {
    const projectTotal = needsWithEstimations.reduce(
      (sum, need) => sum + need.totalEsfuerzo, 
      0
    );
    setTotalProjectHours(projectTotal);
  };

  const fetchEstimations = useCallback(async () => {
    setLoading(true);
    try {
      // Step 1: Fetch parameters
      const parametrosData = await fetchParameters();
      if (!parametrosData) throw new Error("Failed to fetch parameters");
      setParametros(parametrosData);

      // Step 2: Fetch needs for the project
      const needs = await fetchNeedsForProject(projectId);
      if (!needs) {
        console.log("No needs found for project");
        setNeedsEstimations([]);
        setLoading(false);
        return;
      }

      // Step 3: Calculate estimations for each need
      const needsWithEstimations = await fetchRequirementsWithEstimations(needs, parametrosData);
      setNeedsEstimations(needsWithEstimations);
      
      // Step 4: Calculate project total hours
      calculateTotalProjectHours(needsWithEstimations);
      
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las estimaciones",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [projectId, toast]);

  useEffect(() => {
    if (open) {
      fetchEstimations();
    }
  }, [open, fetchEstimations]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchEstimations();
  };

  // Format number to always show with 2 decimal places
  const formatNumber = (num: number) => {
    return num.toFixed(2);
  };

  return {
    needsEstimations,
    loading,
    refreshing,
    totalProjectHours,
    handleRefresh,
    formatNumber
  };
};
