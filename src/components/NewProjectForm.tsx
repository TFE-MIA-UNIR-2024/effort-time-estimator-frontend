
import { useState } from "react";
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

interface NewProjectFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const NewProjectForm = ({ onSuccess, onCancel }: NewProjectFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nombreproyecto: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
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
      
      onSuccess();
    } catch (error) {
      console.error("Error creating project:", error);
      toast({
        title: "Error",
        description: "No se pudo crear el proyecto",
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
            {isSubmitting ? "Creando..." : "Crear Proyecto"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default NewProjectForm;
