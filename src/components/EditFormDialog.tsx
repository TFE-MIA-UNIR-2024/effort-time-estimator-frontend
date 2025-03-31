
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

interface ParametroEstimacion {
  parametro_estimacionid: number;
  nombre: string;
  tipo_parametro_estimacionid: number;
}

interface TipoElementoAfectado {
  tipo_elemento_afectadoid: number;
  nombre: string;
}

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
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [parametros, setParametros] = useState<Record<number, string>>({});
  const [elementos, setElementos] = useState<Record<number, number>>({});
  const [parametrosDB, setParametrosDB] = useState<ParametroEstimacion[]>([]);
  const [elementosDB, setElementosDB] = useState<TipoElementoAfectado[]>([]);

  useEffect(() => {
    if (open) {
      fetchParametrosYElementos();
      fetchExistingData();
    }
  }, [open, requerimientoId]);

  const fetchParametrosYElementos = async () => {
    try {
      // Fetch parametros_estimacion
      const { data: parametrosData, error: parametrosError } = await supabase
        .from('parametro_estimacion')
        .select('*');

      if (parametrosError) throw parametrosError;
      setParametrosDB(parametrosData || []);

      // Fetch tipo_elemento_afectado
      const { data: elementosData, error: elementosError } = await supabase
        .from('tipo_elemento_afectado')
        .select('*');

      if (elementosError) throw elementosError;
      setElementosDB(elementosData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos",
        variant: "destructive",
      });
    }
  };

  const fetchExistingData = async () => {
    try {
      // Fetch existing punto_funcion records for this requirement
      const { data, error } = await supabase
        .from('punto_funcion')
        .select('*')
        .eq('requerimientoid', requerimientoId);

      if (error) throw error;

      if (data && data.length > 0) {
        // Process parameter values
        const paramValues: Record<number, string> = {};
        const elemValues: Record<number, number> = {};

        data.forEach(item => {
          if (item.parametro_estimacionid) {
            paramValues[item.parametro_estimacionid] = String(item.parametro_estimacionid);
          }
          if (item.tipo_elemento_afectado_id) {
            elemValues[item.tipo_elemento_afectado_id] = item.cantidad_estimada || 0;
          }
        });

        setParametros(paramValues);
        setElementos(elemValues);
      }
    } catch (error) {
      console.error('Error fetching existing data:', error);
    }
  };

  const handleElementChange = (id: number, value: string) => {
    setElementos({
      ...elementos,
      [id]: parseInt(value) || 0
    });
  };

  const handleParametroChange = (id: number, value: string) => {
    setParametros({
      ...parametros,
      [id]: value
    });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // First delete existing records for this requirement
      const { error: deleteError } = await supabase
        .from('punto_funcion')
        .delete()
        .eq('requerimientoid', requerimientoId);

      if (deleteError) throw deleteError;

      // Prepare records for insertion
      const records = [];

      // Add parametro_estimacion records
      for (const [paramId, value] of Object.entries(parametros)) {
        if (value) {
          records.push({
            requerimientoid: requerimientoId,
            parametro_estimacionid: parseInt(value),
            cantidad_estimada: null,
            tipo_elemento_afectado_id: null
          });
        }
      }

      // Add elemento_afectado records
      for (const [elemId, cantidad] of Object.entries(elementos)) {
        if (cantidad > 0) {
          records.push({
            requerimientoid: requerimientoId,
            tipo_elemento_afectado_id: parseInt(elemId),
            cantidad_estimada: cantidad,
            parametro_estimacionid: null
          });
        }
      }

      if (records.length > 0) {
        const { error: insertError } = await supabase
          .from('punto_funcion')
          .insert(records);

        if (insertError) throw insertError;
      }

      toast({
        title: "Éxito",
        description: "Formulario guardado correctamente",
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving form:', error);
      toast({
        title: "Error",
        description: "No se pudo guardar el formulario",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Group the elementos fields into pairs for layout
  const elementosPairs = [];
  for (let i = 0; i < elementosFields.length; i += 2) {
    if (i + 1 < elementosFields.length) {
      elementosPairs.push([elementosFields[i], elementosFields[i + 1]]);
    } else {
      elementosPairs.push([elementosFields[i]]);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">
            Edit Form for Mantenimiento de parámetros del sistema
          </DialogTitle>
          <Button
            variant="ghost"
            className="absolute right-4 top-4 rounded-sm p-0 h-6 w-6"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Parámetros dropdowns section */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {parametrosFijos.map((param, index) => (
                index < 6 && (
                  <div key={param.id} className="space-y-1">
                    <label className="text-sm font-medium">{param.nombre}</label>
                    <Select
                      value={parametros[param.id] || ''}
                      onValueChange={(value) => handleParametroChange(param.id, value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent>
                        {param.opciones.map(option => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )
              ))}
            </div>
          </div>

          {/* Elementos afectados section */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Elementos afectados</h3>
            
            {elementosPairs.map((pair, pairIndex) => (
              <div key={pairIndex} className="grid grid-cols-2 gap-4">
                {pair.map(elemento => (
                  <div key={elemento.id} className="space-y-1">
                    <label className="text-sm font-medium">{elemento.label}</label>
                    <Input
                      type="number"
                      min="0"
                      value={elementos[elemento.id] || ''}
                      onChange={(e) => handleElementChange(elemento.id, e.target.value)}
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>

          <div className="flex justify-end">
            <Button 
              onClick={handleSave} 
              disabled={loading}
              className="bg-black hover:bg-gray-800 text-white"
            >
              Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditFormDialog;
