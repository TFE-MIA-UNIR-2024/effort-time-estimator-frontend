
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { FileText, Loader2 } from "lucide-react";
import { nanoid } from "nanoid";

const formSchema = z.object({
  nombrenecesidad: z.string().min(3, {
    message: "El nombre de la necesidad debe tener al menos 3 caracteres.",
  }),
  codigonecesidad: z.string().optional(),
  cuerpo: z.string(),
});

type FormValues = z.infer<typeof formSchema>;

interface Need {
  necesidadid: number;
  nombrenecesidad: string;
  codigonecesidad?: string;
  cuerpo?: string;
  url?: string;
  proyectoid: number;
  fechacreacion?: string;
}

interface NeedFormProps {
  projectId: number;
  need?: Need | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const NeedForm = ({ projectId, need, onSuccess, onCancel }: NeedFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const { toast } = useToast();
  const isEditing = !!need;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nombrenecesidad: need?.nombrenecesidad || "",
      codigonecesidad: need?.codigonecesidad || generateCode(),
      cuerpo: need?.cuerpo || "",
    },
  });

  function generateCode() {
    return `NEC-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type !== 'application/pdf') {
        toast({
          title: "Error",
          description: "Solo se permiten archivos PDF",
          variant: "destructive",
        });
        return;
      }

      setFile(selectedFile);
      
      if (selectedFile.type === 'application/pdf') {
        setIsExtracting(true);
        
        try {
          // Simulating text extraction from PDF
          // In a real app, you would use a PDF parsing library or service
          setTimeout(() => {
            const extractedText = `Contenido extraído del PDF "${selectedFile.name}". 
            
Este es un texto de ejemplo simulando la extracción de contenido de un PDF.

El documento contiene información relevante para el proyecto que puede ser editada según sea necesario.`;
            
            form.setValue("cuerpo", extractedText);
            setIsExtracting(false);
            
            toast({
              title: "Texto extraído",
              description: "El texto ha sido extraído del PDF correctamente",
            });
          }, 1500);
        } catch (error) {
          console.error("Error extracting text:", error);
          setIsExtracting(false);
          toast({
            title: "Error",
            description: "No se pudo extraer el texto del PDF",
            variant: "destructive",
          });
        }
      }
    }
  };

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    
    try {
      let fileUrl = need?.url || "";
      
      // Upload file if present
      if (file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${nanoid()}.${fileExt}`;
        const filePath = `${projectId}/${fileName}`;
        
        const { error: uploadError, data } = await supabase.storage
          .from('needs_documents')
          .upload(filePath, file, {
            upsert: true,
          });

        if (uploadError) {
          throw uploadError;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('needs_documents')
          .getPublicUrl(filePath);
          
        fileUrl = publicUrl;
      }

      if (isEditing && need) {
        // Update existing need
        const { error } = await supabase
          .from("necesidad")
          .update({ 
            nombrenecesidad: values.nombrenecesidad,
            codigonecesidad: values.codigonecesidad,
            cuerpo: values.cuerpo,
            url: fileUrl || need.url,
          })
          .eq("necesidadid", need.necesidadid);

        if (error) {
          throw error;
        }

        toast({
          title: "Necesidad actualizada",
          description: "La necesidad ha sido actualizada exitosamente",
        });
      } else {
        // Create new need
        const { error } = await supabase
          .from("necesidad")
          .insert([{ 
            nombrenecesidad: values.nombrenecesidad,
            codigonecesidad: values.codigonecesidad,
            cuerpo: values.cuerpo,
            proyectoid: projectId,
            url: fileUrl,
            fechacreacion: new Date().toISOString(),
          }]);

        if (error) {
          throw error;
        }

        toast({
          title: "Necesidad creada",
          description: "La necesidad ha sido creada exitosamente",
        });
      }
      
      onSuccess();
    } catch (error) {
      console.error("Error saving need:", error);
      toast({
        title: "Error",
        description: isEditing 
          ? "No se pudo actualizar la necesidad" 
          : "No se pudo crear la necesidad",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="nombrenecesidad"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre de la necesidad</FormLabel>
              <FormControl>
                <Input placeholder="Ingrese el nombre de la necesidad" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="codigonecesidad"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Código</FormLabel>
              <FormControl>
                <Input placeholder="Código de la necesidad" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-2">
          <FormLabel>Documento PDF</FormLabel>
          <div className="border border-input rounded-md px-3 py-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <Button type="button" variant="outline" size="sm" className="gap-2">
                <FileText className="h-4 w-4" />
                {file ? "Cambiar documento" : "Subir documento"}
              </Button>
              <span className="text-sm text-muted-foreground ml-2">
                {file ? file.name : "Ningún archivo seleccionado"}
              </span>
              <input
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>
          </div>
          {isExtracting && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Extrayendo texto del PDF...</span>
            </div>
          )}
        </div>
        
        <FormField
          control={form.control}
          name="cuerpo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contenido</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Contenido extraído del documento" 
                  className="min-h-[200px]" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
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
      </form>
    </Form>
  );
};

export default NeedForm;
