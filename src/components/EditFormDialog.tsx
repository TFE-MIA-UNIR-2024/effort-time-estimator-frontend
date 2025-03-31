
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useFormData } from "@/hooks/form";
import DialogContentComponent from "./form/DialogContent";

interface EditFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  requerimientoId: number;
}

// These are just used as fallbacks in case the database doesn't return parameters
const defaultParametrosFijos = [
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
    parametrosDB,
    dataExists,
    handleElementChange,
    handleParametroChange,
    handleSave
  } = useFormData(requerimientoId, open);

  // Create the parameter options from the database
  const createParameterOptionsFromDB = () => {
    // Group parameters by tipo_parametro_estimacionid (1-6)
    const groupedParams: Record<number, { id: number, nombre: string, opciones: string[] }> = {};
    
    // First, initialize with defaults
    defaultParametrosFijos.forEach(param => {
      groupedParams[param.id] = { ...param, opciones: [] };
    });
    
    // Find parameters in the database for each type
    parametrosDB.forEach(param => {
      const tipoId = param.tipo_parametro_estimacionid;
      if (tipoId >= 1 && tipoId <= 6) {
        // If we don't already have this type, create it
        if (!groupedParams[tipoId]) {
          groupedParams[tipoId] = {
            id: tipoId,
            nombre: defaultParametrosFijos.find(p => p.id === tipoId)?.nombre || `Tipo ${tipoId}`,
            opciones: []
          };
        }
        
        // Add this parameter's name as an option if not already there
        if (!groupedParams[tipoId].opciones.includes(param.nombre)) {
          groupedParams[tipoId].opciones.push(param.nombre);
        }
      }
    });
    
    // Sort options alphabetically to ensure consistent ordering
    Object.keys(groupedParams).forEach(key => {
      const keyNum = parseInt(key);
      groupedParams[keyNum].opciones.sort();
    });
    
    // Add default options if no options are found in the DB
    Object.keys(groupedParams).forEach(key => {
      const keyNum = parseInt(key);
      if (groupedParams[keyNum].opciones.length === 0) {
        const defaultParam = defaultParametrosFijos.find(p => p.id === keyNum);
        if (defaultParam) {
          groupedParams[keyNum].opciones = [...defaultParam.opciones];
        }
      }
    });
    
    // Convert the object to an array for rendering
    return Object.values(groupedParams);
  };

  const parametrosFijos = parametrosDB.length > 0 
    ? createParameterOptionsFromDB() 
    : defaultParametrosFijos;

  // For debugging
  console.log("Parametros DB:", parametrosDB);
  console.log("Parametros fijos procesados:", parametrosFijos);
  console.log("Selected parametros:", parametros);

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
