
import { useSaveNeed } from "./storage/useSaveNeed";
import { useDeleteNeed } from "./storage/useDeleteNeed";
import type { NeedFormValues } from "./useNeedForm";

interface SaveNeedParams {
  isEditing: boolean;
  needId?: number;
  projectId: number;
  values: NeedFormValues;
  file: File | null;
  existingUrl?: string;
}

export const useNeedStorage = () => {
  const { saveNeed } = useSaveNeed();
  const { deleteNeed } = useDeleteNeed();

  return {
    saveNeed,
    deleteNeed
  };
};
