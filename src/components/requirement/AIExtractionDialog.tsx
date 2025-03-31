import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Loader2, CheckCircle2 } from "lucide-react";
import { useRequirementsExtraction } from "@/hooks/need/ai/useRequirementsExtraction";

interface AIExtractionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  needId: string;
  needBody: string;
  onSuccess: () => void;
}

const AIExtractionDialog = ({
  open,
  onOpenChange,
  needId,
  needBody,
  onSuccess
}: AIExtractionDialogProps) => {
  const [completed, setCompleted] = useState(false);
  const { extractRequirements, extracting, progress } = useRequirementsExtraction();

  const handleExtract = async () => {
    const result = await extractRequirements(needId, needBody);
    if (result) {
      setCompleted(true);
      setTimeout(() => {
        onOpenChange(false);
        onSuccess();
        // Reset the state after closing
        setTimeout(() => {
          setCompleted(false);
        }, 300);
      }, 1500);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Extracción de Requerimientos con IA</DialogTitle>
          <DialogDescription>
            La IA analizará el contenido del documento y extraerá los requerimientos automáticamente.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Progress value={progress} className="w-full" />
          
          <div className="text-center">
            {completed ? (
              <div className="flex flex-col items-center justify-center space-y-2">
                <CheckCircle2 className="h-12 w-12 text-green-500" />
                <p className="text-sm text-muted-foreground">Extracción completada</p>
              </div>
            ) : extracting ? (
              <div className="flex flex-col items-center justify-center space-y-2">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">
                  {progress < 20 ? "Analizando documento..." : 
                   progress < 90 ? "Generando requerimientos..." : 
                   "Guardando requerimientos..."}
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Este proceso puede tardar varios minutos dependiendo del tamaño del documento.
              </p>
            )}
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={extracting}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleExtract}
            disabled={extracting || completed}
          >
            {extracting ? "Extrayendo..." : "Extraer Requerimientos"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AIExtractionDialog;
