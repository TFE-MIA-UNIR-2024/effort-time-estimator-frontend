
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const formSchema = z.object({
  nombreproyecto: z.string().min(3, {
    message: "El nombre del proyecto debe tener al menos 3 caracteres.",
  }),
});

type FormValues = z.infer<typeof formSchema>;

interface Project {
  proyectoid: number;
  nombreproyecto: string;
}

interface NewProjectFormProps {
  project?: Project | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const NewProjectForm = ({ project, onSuccess, onCancel }: NewProjectFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const isEditing = !!project;
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nombreproyecto: project?.nombreproyecto || "",
    },
  });

  // Update form values when project changes
  useEffect(() => {
    if (project) {
      form.reset({
        nombreproyecto: project.nombreproyecto,
      });
    }
  }, [project, form]);

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      if (isEditing && project) {
        // Update existing project
        const { error } = await supabase
          .from("proyecto")
          .update({ nombreproyecto: values.nombreproyecto })
          .eq("proyectoid", project.proyectoid);

        if (error) {
          throw error;
        }

        toast({
          title: "Proyecto actualizado",
          description: "El proyecto ha sido actualizado exitosamente",
        });
      } else {
        // Create new project
        const { error } = await supabase
          .from("proyecto")
          .insert([{ nombreproyecto: values.nombreproyecto }]);

        if (error) {
          throw error;
        }

        toast({
          title: "Proyecto creado",
          description: "El proyecto ha sido creado exitosamente",
        });
      }
      
      onSuccess();
    } catch (error) {
      console.error("Error saving project:", error);
      toast({
        title: "Error",
        description: isEditing 
          ? "No se pudo actualizar el proyecto" 
          : "No se pudo crear el proyecto",
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
          name="nombreproyecto"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre del Proyecto</FormLabel>
              <FormControl>
                <Input placeholder="Ingrese el nombre del proyecto" {...field} />
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
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button 
            type="submit"
            disabled={isSubmitting}
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

export default NewProjectForm;
