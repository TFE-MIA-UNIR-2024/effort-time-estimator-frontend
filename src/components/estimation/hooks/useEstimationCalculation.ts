
import { useState, useEffect } from "react";
import { 
  fetchParameters, 
  fetchNeedsForProject, 
  fetchRequirementsWithEstimations 
} from "./estimationService";

export const useEstimationCalculation = (projectId: number, isOpen: boolean) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [needsEstimations, setNeedsEstimations] = useState<any[]>([]);
  const [totalProjectHours, setTotalProjectHours] = useState(0);

  useEffect(() => {
    if (isOpen && projectId) {
      fetchData();
    }
  }, [isOpen, projectId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      console.log(`Fetching estimation data for project ${projectId}`);
      
      // Fetch parameters
      const parameters = await fetchParameters();
      if (!parameters) {
        console.error("Failed to fetch parameters");
        setLoading(false);
        return;
      }
      
      // Fetch needs for this project
      const needs = await fetchNeedsForProject(projectId);
      if (!needs) {
        console.error("Failed to fetch needs");
        setLoading(false);
        return;
      }
      
      // Get requirements with estimations for each need
      // This will also update jornada_estimada in the database
      const estimationsData = await fetchRequirementsWithEstimations(needs, parameters);
      
      // Calculate total project hours
      const totalHours = estimationsData.reduce((sum, need) => sum + need.totalEsfuerzo, 0);
      
      setNeedsEstimations(estimationsData);
      setTotalProjectHours(totalHours);
    } catch (error) {
      console.error("Error fetching estimation data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString('es-ES', { 
      minimumFractionDigits: 1,
      maximumFractionDigits: 1
    });
  };

  return {
    loading,
    refreshing,
    needsEstimations,
    totalProjectHours,
    handleRefresh,
    formatNumber
  };
};
