import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Wand2 } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  getRequirementsTitles,
  getRequirementDescription,
  getRequirementsDetails,
  DescriptionItem,
} from "@/lib/openAIMock";
import { Need, WeightFormData, Requirement } from "@/types/need";
import { WeightsForm } from "@/components/WeightsForm";

const emptyWeightForm: WeightFormData = {
  tablas: 0,
  triggersSP: 0,
  interfacesAplicativos: 0,
  formularios: 0,
  subrutinasComplejas: 0,
  interfacesBD: 0,
  reportes: 0,
  componentes: 0,
  javascript: 0,
  componentesConfigPruebas: 0,
  despliegueAppMovil: 0,
  qa: 0,
  pf: 0
};

export default function NeedDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [need, setNeed] = useState<Need | null>(null);
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingRequirement, setEditingRequirement] =
    useState<Requirement | null>(null);
  const [formData, setFormData] = useState({
    codigorequerimiento: "",
    nombrerequerimiento: "",
    cuerpo: "",
  });
  const [aiLoading, setAiLoading] = useState(false);
  const [progress, setProgress] = useState<number>(0);
  const [weightFormData, setWeightFormData] =
    useState<WeightFormData>(emptyWeightForm);
  const [selectedRequirement, setSelectedRequirement] =
    useState<Requirement | null>(null);

  const fetchNeed = async () => {
    try {
      if (!id) throw new Error("No need ID provided");

      const { data, error } = await supabase
        .from("necesidad")
        .select("*")
        .eq("necesidadid", id)
        .single();

      if (error) throw error;
      if (!data) throw new Error("Need not found");

      setNeed(data);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Error fetching need");
    }
  };

  const fetchRequirements = async () => {
    try {
      if (!id) return;

      const { data, error } = await supabase
        .from("requerimiento")
        .select("*")
        .eq("necesidadid", id)
        .order("fechacreacion", { ascending: false });

      if (error) throw error;
      setRequirements(data || []);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Error fetching requirements"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        navigate("/login");
      }
    };

    checkUser();
    fetchNeed();
    fetchRequirements();
  }, [id, navigate]);

  useEffect(() => {
    if (editingRequirement) {
      setFormData({
        codigorequerimiento: editingRequirement.codigorequerimiento,
        nombrerequerimiento: editingRequirement.nombrerequerimiento,
        cuerpo: editingRequirement.cuerpo || "",
      });
    } else {
      setFormData({
        codigorequerimiento: "",
        nombrerequerimiento: "",
        cuerpo: "",
      });
    }
  }, [editingRequirement]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (editingRequirement) {
        const { error } = await supabase
          .from("requerimiento")
          .update({
            codigorequerimiento: formData.codigorequerimiento,
            nombrerequerimiento: formData.nombrerequerimiento,
            cuerpo: formData.cuerpo,
          })
          .eq("requerimientoid", editingRequirement.requerimientoid);

        if (error) throw error;
      } else {
        const { error } = await supabase.from("requerimiento").insert([
          {
            codigorequerimiento: formData.codigorequerimiento,
            nombrerequerimiento: formData.nombrerequerimiento,
            cuerpo: formData.cuerpo,
            necesidadid: id,
            tiporequerimientoid: 1,
            fechacreacion: new Date().toISOString(),
          },
        ]);

        if (error) throw error;
      }

      setFormData({
        codigorequerimiento: "",
        nombrerequerimiento: "",
        cuerpo: "",
      });
      setShowForm(false);
      setEditingRequirement(null);
      await fetchRequirements();
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Error saving requirement"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (requirementId: number) => {
    if (!window.confirm("Are you sure you want to delete this requirement?"))
      return;

    try {
      setLoading(true);
      const { error } = await supabase
        .from("requerimiento")
        .delete()
        .eq("requerimientoid", requirementId);

      if (error) throw error;
      await fetchRequirements();
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Error deleting requirement"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (requirement: Requirement) => {
    setEditingRequirement(requirement);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingRequirement(null);
    setFormData({
      codigorequerimiento: "",
      nombrerequerimiento: "",
      cuerpo: "",
    });
  };

  const handleGenerateWeights = async (requirement: Requirement) => {
    setAiLoading(true);
    try {
      const details = await getRequirementsDetails(
        [{ title: requirement.nombrerequerimiento }],
        requirement.cuerpo || ""
      );
      if (details && details.length > 0) {
        const weights = details[0];
        setWeightFormData({
          tablas: weights.tablas,
          triggersSP: weights.triggersSP,
          interfacesAplicativos: weights.interfacesAplicativos,
          formularios: weights.formularios,
          subrutinasComplejas: weights.subrutinasComplejas,
          interfacesBD: weights.interfacesBD,
          reportes: weights.reportes,
          componentes: weights.componentes,
          javascript: weights.javascript,
          componentesConfigPruebas: weights.componentesConfigPruebas,
          despliegueAppMovil: weights.despliegueAppMovil,
          qa: weights.qa,
          pf: weights.pf
        });
      }
    } catch (error) {
      console.error("Error generating weights:", error);
      setError("Error generating weights");
    } finally {
      setAiLoading(false);
    }
  };

  const handleOpenEmptyForm = () => {
    setWeightFormData(emptyWeightForm);
  };

  const handleExtractRequirements = async () => {
    if (!need?.cuerpo) {
      setError("No text available to extract requirements from");
      return;
    }

    setAiLoading(true);
    setError(null);
    setProgress(0);

    try {
      const titles = await getRequirementsTitles(need.cuerpo);
      setProgress(20);

      const descriptions: DescriptionItem[] = [];
      const totalTitles = titles.length;
      for (let i = 0; i < totalTitles; i++) {
        const item = titles[i];
        const description = await getRequirementDescription(
          item.title,
          need.cuerpo
        );
        descriptions.push({
          titulo: item.title,
          description,
        });
        setProgress(20 + Math.round(((i + 1) / totalTitles) * 80));
      }

      const newRequirements = descriptions.map((item, index) => ({
        codigorequerimiento: `REQ-${String(index + 1).padStart(3, "0")}`,
        nombrerequerimiento: item.titulo,
        cuerpo: item.description,
        necesidadid: Number(id),
        tiporequerimientoid: 1,
        fechacreacion: new Date().toISOString(),
      }));

      const { error } = await supabase
        .from("requerimiento")
        .insert(newRequirements);
      if (error) throw error;

      await fetchRequirements();
      setProgress(100);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Error extracting requirements"
      );
    } finally {
      setAiLoading(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  if (loading && !need) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <p>Loading...</p>
      </div>
    );
  }

  if (error || !need) {
    return (
      <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md">
        {error || "Need not found"}
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <Button
            variant="ghost"
            size="sm"
            className="mb-4"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <h1 className="text-3xl font-bold">{need.nombrenecesidad}</h1>
          <p className="text-muted-foreground">Code: {need.codigonecesidad}</p>

          {need.url && (
            <a
              href={need.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline mt-1 block"
            >
              {need.url.includes(".pdf") ? "View PDF" : "Reference Link"}
            </a>
          )}
        </div>
        <div className="flex gap-2">
          {need.cuerpo && (
            <Button
              variant="outline"
              onClick={handleExtractRequirements}
              disabled={aiLoading}
            >
              <Wand2 className="mr-2 h-4 w-4" />
              {aiLoading ? "Extracting..." : "Extract Requirements with AI"}
            </Button>
          )}
          <Button onClick={() => setShowForm(true)}>Add Requirement</Button>
        </div>
      </div>

      {aiLoading && (
        <div className="mb-4">
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div
              className="bg-blue-600 h-4 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-sm text-center mt-1">{progress}% Completo</p>
        </div>
      )}

      {error && (
        <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md mb-4">
          {error}
        </div>
      )}

      {showForm && (
        <div className="mb-8 p-4 rounded-lg border bg-card">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Input
                placeholder="Requirement Code"
                value={formData.codigorequerimiento}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    codigorequerimiento: e.target.value,
                  })
                }
                required
              />
              <Input
                placeholder="Requirement Name"
                value={formData.nombrerequerimiento}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    nombrerequerimiento: e.target.value,
                  })
                }
                required
              />
              <Input
                placeholder="Description"
                value={formData.cuerpo}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    cuerpo: e.target.value,
                  })
                }
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading
                  ? "Saving..."
                  : editingRequirement
                  ? "Update Requirement"
                  : "Add Requirement"}
              </Button>
            </div>
          </form>
        </div>
      )}

      <div className="grid gap-4">
        {requirements.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">
            No requirements found for this need
          </p>
        ) : (
          requirements.map((requirement) => (
            <div
              key={requirement.requerimientoid}
              className="p-4 rounded-lg border bg-card text-card-foreground"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">
                    {requirement.nombrerequerimiento}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Code: {requirement.codigorequerimiento}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Created:{" "}
                    {new Date(requirement.fechacreacion).toLocaleDateString()}
                  </p>
                  {requirement.cuerpo && (
                    <p className="text-sm mt-2">{requirement.cuerpo}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedRequirement(requirement);
                          handleGenerateWeights(requirement);
                        }}
                      >
                        Generate Weights
                      </Button>
                    </SheetTrigger>
                    <SheetContent>
                      <SheetHeader>
                        <SheetTitle>
                          Weights for {selectedRequirement?.nombrerequerimiento}
                        </SheetTitle>
                      </SheetHeader>
                      <WeightsForm
                        weightFormData={weightFormData}
                        onWeightChange={(key, value) =>
                          setWeightFormData((prev) => ({
                            ...prev,
                            [key]: value,
                          }))
                        }
                        loading={aiLoading}
                      />
                    </SheetContent>
                  </Sheet>
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedRequirement(requirement);
                          handleOpenEmptyForm();
                        }}
                      >
                        Empty Form
                      </Button>
                    </SheetTrigger>
                    <SheetContent>
                      <SheetHeader>
                        <SheetTitle>
                          Empty Form for{" "}
                          {selectedRequirement?.nombrerequerimiento}
                        </SheetTitle>
                      </SheetHeader>
                      <WeightsForm
                        weightFormData={weightFormData}
                        onWeightChange={(key, value) =>
                          setWeightFormData((prev) => ({
                            ...prev,
                            [key]: value,
                          }))
                        }
                        loading={false}
                      />
                    </SheetContent>
                  </Sheet>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(requirement)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(requirement.requerimientoid)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
