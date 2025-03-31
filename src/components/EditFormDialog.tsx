
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useFormData } from "@/hooks/useFormData";
import DialogContentComponent from "./form/DialogContent";

interface EditFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  requerimientoId: number;
}

const parametrosFijos = [
  { id: 1, nombre: "Tipo Función", opciones: ["Funcional", "No Funcional", "Técnico"] },
  { id: 2, nombre: "Nuevo/Modificacion", opciones: ["Nuevo", "Modificacion"] },
  { id: 3, nombre: "Complejidad", opciones: ["Baja", "Media", "Alta"] },
  { id: 4, nombre: "Tipo de Desarrollo", opciones: ["Interno", "Externo", "Mixto"] },
  { id: 5, nombre: "Arquitectura", opciones: ["Web", "Desktop", "Mobile", "Hibrida"] },
  { id: 6, nombre: "Lenguajes", opciones: ["Java", "PHP", "C#", "Python", "Fame"] },
];

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

const EditFormDialog = ({ open, onOpenChange, requerimientoId }: EditFormProps) => {
  const {
    loading,
    parametros,
    elementos,
    dataExists,
    handleElementChange,
    handleParametroChange,
    handleSave
  } = useFormData(requerimientoId, open);

  const handleFormSave = async () => {
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
          parametrosFijos={parametrosFijos}
          elementosFields={elementosFields}
          onParametroChange={handleParametroChange}
          onElementChange={handleElementChange}
          onClose={() => onOpenChange(false)}
          onSave={handleFormSave}
          dataExists={dataExists}
        />
      </DialogContent>
    </Dialog>
  );
};

export default EditFormDialog;
