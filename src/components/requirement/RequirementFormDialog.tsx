
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useParams } from "react-router-dom";

interface RequirementFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  requirement?: {
    requerimientoid: number;
    nombrerequerimiento: string;
    codigorequerimiento: string;
    cuerpo?: string;
  } | null;
}

const RequirementFormDialog = ({ 
  open, 
  onOpenChange, 
  onSuccess, 
  requirement 
}: RequirementFormDialogProps) => {
  const { id: needId } = useParams();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    nombrerequerimiento: "",
    codigorequerimiento: "",
    cuerpo: ""
  });
  
  // Reset form data when the dialog opens or requirement changes
  useEffect(() => {
    if (requirement) {
      setFormData({
        nombrerequerimiento: requirement.nombrerequerimiento || "",
        codigorequerimiento: requirement.codigorequerimiento || "",
        cuerpo: requirement.cuerpo || ""
      });
    } else {
      // Reset form when adding a new requirement
      setFormData({
        nombrerequerimiento: "",
        codigorequerimiento: "",
        cuerpo: ""
      });
    }
  }, [requirement, open]);
  
  const isEditing = !!requirement;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nombrerequerimiento || !formData.codigorequerimiento) {
      toast({
        title: "Error",
        description: "Por favor complete los campos requeridos",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsSubmitting(true);

      if (isEditing && requirement) {
        // Update existing requirement
        const { error } = await supabase
          .from('requerimiento')
          .update({
            nombrerequerimiento: formData.nombrerequerimiento,
            codigorequerimiento: formData.codigorequerimiento,
            cuerpo: formData.cuerpo
          })
          .eq('requerimientoid', requirement.requerimientoid);

        if (error) throw error;

        toast({
          title: "Requerimiento actualizado",
          description: "El requerimiento ha sido actualizado con éxito"
        });
      } else {
        // Create new requirement
        const { error } = await supabase
          .from('requerimiento')
          .insert([{
            nombrerequerimiento: formData.nombrerequerimiento,
            codigorequerimiento: formData.codigorequerimiento,
            cuerpo: formData.cuerpo,
            necesidadid: Number(needId),
            tiporequerimientoid: 1, // Default type
            fechacreacion: new Date().toISOString()
          }]);

        if (error) throw error;

        toast({
          title: "Requerimiento creado",
          description: "El requerimiento ha sido creado con éxito"
        });
      }

      onSuccess();
      onOpenChange(false);
      
    } catch (error) {
      console.error('Error saving requirement:', error);
      toast({
        title: "Error",
        description: "No se pudo guardar el requerimiento",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Requerimiento" : "Crear Requerimiento"}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="nombrerequerimiento" className="block text-sm font-medium">
              Nombre del Requerimiento
            </label>
            <Input 
              id="nombrerequerimiento"
              name="nombrerequerimiento"
              value={formData.nombrerequerimiento}
              onChange={handleChange}
              placeholder="Ingrese el nombre del requerimiento"
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="codigorequerimiento" className="block text-sm font-medium">
              Código
            </label>
            <Input 
              id="codigorequerimiento"
              name="codigorequerimiento"
              value={formData.codigorequerimiento}
              onChange={handleChange}
              placeholder="Ej. REQ-001"
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="cuerpo" className="block text-sm font-medium">
              Descripción
            </label>
            <Textarea 
              id="cuerpo"
              name="cuerpo"
              value={formData.cuerpo}
              onChange={handleChange}
              placeholder="Describa el requerimiento"
              rows={5}
            />
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button 
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting 
                ? (isEditing ? "Guardando..." : "Creando...") 
                : (isEditing ? "Guardar" : "Crear")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RequirementFormDialog;
