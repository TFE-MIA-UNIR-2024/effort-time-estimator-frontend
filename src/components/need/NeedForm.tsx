
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
import { useNeedForm } from "@/hooks/need/useNeedForm";

interface NeedFormProps {
  projectId: number;
  need?: {
    necesidadid: number;
    nombrenecesidad: string;
    codigonecesidad?: string;
    cuerpo?: string;
    url?: string;
    proyectoid: number;
    fechacreacion?: string;
  } | null;
  onSuccess: () => void;
  onCancel: () => void;
}

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
                onChange={e => handleFileChange(e, text => form.setValue("cuerpo", text))}
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
            onClick={handleCancel}
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
