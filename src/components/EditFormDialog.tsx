
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useFormData } from "@/hooks/form";
import DialogContentComponent from "./form/DialogContent";

interface EditFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  requerimientoId: number;
}

const EditFormDialog = ({ open, onOpenChange, requerimientoId }: EditFormProps) => {
  const {
    loading,
    parametros,
    elementos,
    tiposParametros,
    dataExists,
    handleElementChange,
    handleParametroChange,
    handleSave,
    handleGenerateAIEstimation,
    aiLoading,
    validateForm
  } = useFormData(requerimientoId, open);

  // Define the elementosFields that will be displayed in the form
  const elementosFields = [
    { id: 1, label: "Tablas" },
    { id: 2, label: "Triggers/SP" },
    { id: 3, label: "Interfaces c/aplicativos" },
    { id: 4, label: "Formularios" },
    { id: 5, label: "Subrutinas complejas" },
    { id: 6, label: "Interfaces con BD" },
    { id: 7, label: "Reportes" },
    { id: 8, label: "Componentes" },
    { id: 9, label: "Javascript" },
    { id: 10, label: "Componentes Config. y Pruebas" },
    { id: 11, label: "Despliegue app movil" },
    { id: 12, label: "QA" },
    { id: 13, label: "PF" },
  ];

  const handleFormSave = async () => {
    console.log("Saving parameters:", parametros);
    const success = await handleSave();
    if (success) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh]">
        <DialogContentComponent
          loading={loading}
          parametros={parametros}
          elementos={elementos}
          tiposParametros={tiposParametros}
          elementosFields={elementosFields}
          onParametroChange={handleParametroChange}
          onElementChange={handleElementChange}
          onClose={() => onOpenChange(false)}
          onSave={handleFormSave}
          dataExists={dataExists}
          handleGenerateAIEstimation={handleGenerateAIEstimation}
          aiLoading={aiLoading}
        />
      </DialogContent>
    </Dialog>
  );
};

export default EditFormDialog;
