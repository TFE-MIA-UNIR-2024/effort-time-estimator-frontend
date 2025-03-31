
import { Button } from "@/components/ui/button";
import { FormLabel } from "@/components/ui/form";
import { FileText, Loader2 } from "lucide-react";

interface FileUploadFieldProps {
  file: File | null;
  isExtracting: boolean;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const FileUploadField = ({ file, isExtracting, onFileChange }: FileUploadFieldProps) => {
  return (
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
            onChange={onFileChange}
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
  );
};

export default FileUploadField;
