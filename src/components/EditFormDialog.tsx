import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

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
      const { data: parametrosData, error: parametrosError } = await supabase
        .from('parametro_estimacion')
        .select('*');

      if (parametrosError) throw parametrosError;
      setParametrosDB(parametrosData || []);

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
      const { data, error } = await supabase
        .from('punto_funcion')
        .select('*')
        .eq('requerimientoid', requerimientoId);

      if (error) throw error;

      if (data && data.length > 0) {
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
      const { error: deleteError } = await supabase
        .from('punto_funcion')
        .delete()
        .eq('requerimientoid', requerimientoId);

      if (deleteError) throw deleteError;

      const records = [];

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

  const elementosGroups = [];
  const itemsPerGroup = Math.ceil(elementosFields.length / 3);
  
  for (let i = 0; i < elementosFields.length; i += itemsPerGroup) {
    elementosGroups.push(elementosFields.slice(i, i + itemsPerGroup));
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">
            Mantenimiento de parámetros del sistema
          </DialogTitle>
          <Button
            variant="ghost"
            className="absolute right-4 top-4 rounded-sm p-0 h-6 w-6"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] pr-4">
          <div className="space-y-6 py-4 px-1">
            <div className="space-y-1">
              <h3 className="text-lg font-semibold mb-3">Parámetros</h3>
              <div className="grid grid-cols-2 gap-4">
                {parametrosFijos.map((param) => (
                  <div key={param.id} className="space-y-1">
                    <label className="text-sm font-medium">{param.nombre}</label>
                    <Select
                      value={parametros[param.id] || ""}
                      onValueChange={(value) => handleParametroChange(param.id, value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="placeholder" disabled>Seleccionar</SelectItem>
                        {param.opciones.map(option => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Elementos afectados</h3>
              
              <div className="grid grid-cols-3 gap-x-4 gap-y-2">
                {elementosGroups.map((group, groupIndex) => (
                  <div key={groupIndex} className="space-y-2">
                    {group.map(elemento => (
                      <div key={elemento.id} className="space-y-1">
                        <label className="text-sm font-medium block">{elemento.label}</label>
                        <Input
                          type="number"
                          min="0"
                          className="h-8"
                          value={elementos[elemento.id] || ''}
                          onChange={(e) => handleElementChange(elemento.id, e.target.value)}
                        />
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button 
                onClick={handleSave} 
                disabled={loading}
                className="bg-black hover:bg-gray-800 text-white"
              >
                Guardar
              </Button>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default EditFormDialog;
