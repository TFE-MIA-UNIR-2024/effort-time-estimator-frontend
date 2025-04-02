
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useNeedStorage } from "@/hooks/need/useNeedStorage";
import { Need } from "@/hooks/need/types";
import NeedsListHeader from "./need/NeedsListHeader";
import NeedsDialog from "./need/NeedsDialog";
import NeedCard from "./need/NeedCard";
import NeedsEmptyState from "./need/NeedsEmptyState";

const NeedsList = ({ projectId }: { projectId: number }) => {
  const [needs, setNeeds] = useState<Need[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentNeed, setCurrentNeed] = useState<Need | null>(null);
  const { toast } = useToast();
  const { deleteNeed } = useNeedStorage();

  const fetchNeeds = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('necesidad')
        .select('*')
        .eq('proyectoid', projectId);

      if (error) {
        throw error;
      }

      setNeeds(data || []);
    } catch (error) {
      console.error('Error fetching needs:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las necesidades del cliente",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNeeds();
  }, [projectId, toast]);

  const handleNeedSaved = () => {
    setDialogOpen(false);
    setCurrentNeed(null);
    fetchNeeds();
  };

  const handleEditNeed = (need: Need) => {
    setCurrentNeed(need);
    setDialogOpen(true);
  };

  const handleDeleteNeed = async (needId: number) => {
    try {
      const success = await deleteNeed(needId);

      if (success) {
        toast({
          title: "Eliminado",
          description: "La necesidad ha sido eliminada correctamente",
        });
        fetchNeeds();
      }
    } catch (error) {
      console.error('Error deleting need:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la necesidad",
        variant: "destructive",
      });
    }
  };

  const handleAddNeed = () => {
    setCurrentNeed(null);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setCurrentNeed(null);
  };

  return (
    <div>
      <NeedsListHeader onAddNeed={handleAddNeed} />

      <NeedsDialog 
        isOpen={dialogOpen}
        onOpenChange={setDialogOpen}
        currentNeed={currentNeed}
        projectId={projectId}
        onSuccess={handleNeedSaved}
        onCancel={handleCloseDialog}
      />

      {loading || needs.length === 0 ? (
        <NeedsEmptyState loading={loading} />
      ) : (
        <div className="space-y-4">
          {needs.map((need) => (
            <NeedCard 
              key={need.necesidadid}
              need={need}
              onEdit={handleEditNeed}
              onDelete={handleDeleteNeed}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default NeedsList;
