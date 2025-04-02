
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
import { useNeedForm } from "@/hooks/need/useNeedForm";
import FileUploadField from "./FileUploadField";
import FormActions from "./FormActions";
import { NeedFormProps } from "@/hooks/need/types";

const NeedForm = ({ projectId, need, onSuccess, onCancel }: NeedFormProps) => {
  const {
    form,
    isSubmitting,
    isExtracting,
    isEditing,
    file,
    handleFileChange,
    onSubmit,
    onCancel: handleCancel
  } = useNeedForm({
    projectId,
    need,
    onSuccess,
    onCancel
  });
  
  // Define the callback function to set form value when text is extracted
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log("File upload triggered");
    handleFileChange(e, (text: string) => {
      console.log("Setting form value with extracted text");
      form.setValue("cuerpo", text);
    });
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

        <FileUploadField 
          file={file} 
          isExtracting={isExtracting} 
          onFileChange={handleFileUpload}
        />
        
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
        
        <FormActions 
          isSubmitting={isSubmitting}
          isExtracting={isExtracting}
          isEditing={isEditing}
          onCancel={handleCancel}
        />
      </form>
    </Form>
  );
};

export default NeedForm;
