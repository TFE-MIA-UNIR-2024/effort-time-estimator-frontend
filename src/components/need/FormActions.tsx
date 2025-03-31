
import { Button } from "@/components/ui/button";

interface FormActionsProps {
  isSubmitting: boolean;
  isExtracting: boolean;
  isEditing: boolean;
  onCancel: () => void;
}

const FormActions = ({ isSubmitting, isExtracting, isEditing, onCancel }: FormActionsProps) => {
  return (
    <div className="flex justify-end space-x-2">
      <Button 
        type="button" 
        variant="outline" 
        onClick={onCancel}
        disabled={isSubmitting || isExtracting}
      >
        Cancelar
      </Button>
      <Button 
        type="submit"
        disabled={isSubmitting || isExtracting}
      >
        {isSubmitting 
          ? (isEditing ? "Actualizando..." : "Creando...") 
          : (isEditing ? "Actualizar" : "Crear")}
      </Button>
    </div>
  );
};

export default FormActions;
