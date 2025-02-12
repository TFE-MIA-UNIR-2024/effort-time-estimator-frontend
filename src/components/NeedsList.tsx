import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import { extractTextFromPDF } from "@/lib/pdfUtils";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical } from "lucide-react";
import { EstimationsModal } from "@/components/EstimationsModal";

interface Need {
  necesidadid: number;
  codigonecesidad: string;
  nombrenecesidad: string;
  proyectoid: number;
  fechacreacion: string;
  cuerpo: string;
  url: string;
}

interface NeedsListProps {
  projectId: number;
  onClose: () => void;
}

export function NeedsList({ projectId, onClose }: NeedsListProps) {
  const navigate = useNavigate();
  const [needs, setNeeds] = useState<Need[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingNeed, setEditingNeed] = useState<Need | null>(null);
  const [formData, setFormData] = useState({
    codigonecesidad: "",
    nombrenecesidad: "",
    texto: "",
    url: "",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileLoading, setFileLoading] = useState(false);
  const [showEstimations, setShowEstimations] = useState(false);

  const fetchNeeds = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("necesidad")
        .select("*")
        .eq("proyectoid", projectId)
        .order("fechacreacion", { ascending: false });

      if (error) throw error;
      setNeeds(data || []);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Error fetching needs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNeeds();
  }, [projectId]);

  useEffect(() => {
    if (editingNeed) {
      setFormData({
        codigonecesidad: editingNeed.codigonecesidad,
        nombrenecesidad: editingNeed.nombrenecesidad,
        texto: editingNeed.cuerpo || "",
        url: editingNeed.url || "",
      });
    } else {
      setFormData({
        codigonecesidad: "",
        nombrenecesidad: "",
        texto: "",
        url: "",
      });
    }
    setSelectedFile(null);
  }, [editingNeed]);

  const uploadPDF = async (file: File) => {
    const fileName = `${Date.now()}-${file.name}`;
    const { error } = await supabase.storage
      .from("files")
      .upload(fileName, file);

    if (error) throw error;

    const {
      data: { publicUrl },
    } = supabase.storage.from("files").getPublicUrl(fileName);

    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let pdfText = formData.texto;
      let pdfUrl = formData.url;

      if (selectedFile) {
        setFileLoading(true);
        try {
          pdfText = await extractTextFromPDF(selectedFile);
          pdfUrl = await uploadPDF(selectedFile);
        } catch (error) {
          console.error("Error processing PDF:", error);
          throw new Error("Failed to process PDF file");
        } finally {
          setFileLoading(false);
        }
      }

      const sanitizeText = (text: string) => {
        if (typeof text !== "string") return text;
        return text.split("\x00").join("");
      };

      const sanitizedPdfText = sanitizeText(pdfText);

      if (editingNeed) {
        const { error } = await supabase
          .from("necesidad")
          .update({
            codigonecesidad: formData.codigonecesidad,
            nombrenecesidad: formData.nombrenecesidad,
            cuerpo: sanitizedPdfText,
            url: pdfUrl,
          })
          .eq("necesidadid", editingNeed.necesidadid);

        if (error) throw error;
      } else {
        const { error } = await supabase.from("necesidad").insert([
          {
            codigonecesidad: formData.codigonecesidad,
            nombrenecesidad: formData.nombrenecesidad,
            cuerpo: sanitizedPdfText,
            url: pdfUrl,
            proyectoid: projectId,
            fechacreacion: new Date().toISOString(),
          },
        ]);

        if (error) throw error;
      }

      setFormData({
        codigonecesidad: "",
        nombrenecesidad: "",
        texto: "",
        url: "",
      });
      setSelectedFile(null);
      setShowForm(false);
      setEditingNeed(null);
      await fetchNeeds();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Error saving need");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (needId: number) => {
    if (!window.confirm("Are you sure you want to delete this need?")) return;

    try {
      setLoading(true);
      const { error } = await supabase
        .from("necesidad")
        .delete()
        .eq("necesidadid", needId);

      if (error) throw error;
      await fetchNeeds();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Error deleting need");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (need: Need) => {
    setEditingNeed(need);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingNeed(null);
    setFormData({
      codigonecesidad: "",
      nombrenecesidad: "",
      texto: "",
      url: "",
    });
    setSelectedFile(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === "application/pdf") {
      setSelectedFile(file);
      setFormData((prev) => ({ ...prev, texto: "", url: "" }));
    } else {
      setError("Please select a valid PDF file");
    }
  };

  if (loading && needs.length === 0) {
    return (
      <div className="min-h-[200px] flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Client Needs</h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? "Cancel" : "Add Need"}
          </Button>
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>

      <EstimationsModal
        isOpen={showEstimations}
        onClose={() => setShowEstimations(false)}
        projectId={projectId}
      />

      {error && (
        <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md">
          {error}
        </div>
      )}

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="space-y-4 p-4 border rounded-lg"
        >
          <div className="space-y-2">
            <Input
              placeholder="Need Code"
              value={formData.codigonecesidad}
              onChange={(e) =>
                setFormData({ ...formData, codigonecesidad: e.target.value })
              }
              required
            />
            <Input
              placeholder="Need Name"
              value={formData.nombrenecesidad}
              onChange={(e) =>
                setFormData({ ...formData, nombrenecesidad: e.target.value })
              }
              required
            />
            <div className="space-y-2">
              <Input
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
              />
              {selectedFile && (
                <p className="text-sm text-muted-foreground">
                  Selected file: {selectedFile.name}
                </p>
              )}
              <p className="text-sm text-muted-foreground">
                Or manually enter description and URL:
              </p>
              <Textarea
                placeholder="Description"
                value={formData.texto}
                onChange={(e) =>
                  setFormData({ ...formData, texto: e.target.value })
                }
                disabled={!!selectedFile}
              />
              <Input
                placeholder="URL"
                type="url"
                value={formData.url}
                onChange={(e) =>
                  setFormData({ ...formData, url: e.target.value })
                }
                disabled={!!selectedFile}
              />
            </div>
          </div>
          <div className="flex justify-end">
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={loading || fileLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading || fileLoading}>
                {loading || fileLoading
                  ? "Saving..."
                  : editingNeed
                  ? "Update Need"
                  : "Add Need"}
              </Button>
            </div>
          </div>
        </form>
      )}

      <div className="space-y-2">
        {needs.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">
            No needs found for this project
          </p>
        ) : (
          needs.map((need) => (
            <div
              key={need.necesidadid}
              className="p-4 rounded-lg border bg-card text-card-foreground"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">{need.nombrenecesidad}</p>
                  <p className="text-sm text-muted-foreground">
                    Code: {need.codigonecesidad}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Created: {new Date(need.fechacreacion).toLocaleDateString()}
                  </p>
                  {need.cuerpo && (
                    <p className="text-sm mt-2">
                      {need.cuerpo.length > 200
                        ? `${need.cuerpo.substring(0, 200)}...`
                        : need.cuerpo}
                    </p>
                  )}
                  {need.url && (
                    <a
                      href={need.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-500 hover:underline mt-1 block"
                    >
                      {need.url.includes(".pdf")
                        ? "View PDF"
                        : "Reference Link"}
                    </a>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/need/${need.necesidadid}`)}
                  >
                    View Details
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(need)}>
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDelete(need.necesidadid)}
                        className="text-destructive"
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
