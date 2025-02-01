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
import { useToast } from "@/components/ui/use-toast";

const emptyWeightForm: WeightFormData = {
  Tablas: 0,
  "Triggers/SP": 0,
  "Interfaces c/aplicativos": 0,
  Formularios: 0,
  "Subrutinas complejas": 0,
  "Interfaces con BD": 0,
  Reportes: 0,
  Componentes: 0,
  Javascript: 0,
  "Componentes Config. y Pruebas": 0,
  "Despliegue app movil": 0,
  QA: 0,
  PF: 0,
};

export default function NeedDetails() {
  const { toast } = useToast();
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
  const [requirementPuntosFuncion, setRequirementPuntosFuncion] = useState<
    any[]
  >([]);
  const [saveLoading, setSaveLoading] = useState(false);

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

  const fetchPuntosFuncion = async () => {
    try {
      // Consulta para obtener los puntos de función junto con el nombre del tipo de elemento afectado
      const { data, error } = await supabase.from("punto_funcion").select(
        "*, tipo_elemento_afectado(activo)" // Incluye el estado activo del tipo de elemento afectado en la respuesta
      );

      if (error) throw error;

      setRequirementPuntosFuncion(data);
    } catch (error) {
      console.error("Error fetching puntos funcion:", error);
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
    fetchPuntosFuncion();
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
          Tablas: weights.tablas,
          "Triggers/SP": weights.triggersSP,
          "Interfaces c/aplicativos": weights.interfacesAplicativos,
          Formularios: weights.formularios,
          "Subrutinas complejas": weights.subrutinasComplejas,
          "Interfaces con BD": weights.interfacesBD,
          Reportes: weights.reportes,
          Componentes: weights.componentes,
          Javascript: weights.javascript,
          "Componentes Config. y Pruebas": weights.componentesConfigPruebas,
          "Despliegue app movil": weights.despliegueAppMovil,
          QA: weights.qa,
          PF: weights.pf,
        });
      }
    } catch (error) {
      console.error("Error generating weights:", error);
      setError("Error generating weights");
    } finally {
      setAiLoading(false);
    }
  };

  // Función para abrir el formulario de puntos de función con datos existentes (si los hay)
  const handleOpenWeightForm = (requirement: Requirement) => {
    setSelectedRequirement(requirement);

    // Filtra los puntos de función para este requerimiento
    const existingPoints = requirementPuntosFuncion.filter(
      (pf) => pf.requerimientoid === requirement.requerimientoid
    );

    if (existingPoints.length > 0) {
      const newWeightFormData = { ...emptyWeightForm };

      existingPoints.forEach((pf) => {
        switch (pf.tipo_elemento_afectado_id) {
          case 1:
            newWeightFormData.Tablas =
              pf.cantidad_estimada || pf.cantidad_estim || 0;
            break;
          case 2:
            newWeightFormData["Triggers/SP"] =
              pf.cantidad_estimada || pf.cantidad_estim || 0;
            break;
          case 3:
            newWeightFormData["Interfaces c/aplicativos"] =
              pf.cantidad_estimada || pf.cantidad_estim || 0;
            break;
          case 4:
            newWeightFormData.Formularios =
              pf.cantidad_estimada || pf.cantidad_estim || 0;
            break;
          case 5:
            newWeightFormData["Subrutinas complejas"] =
              pf.cantidad_estimada || pf.cantidad_estim || 0;
            break;
          case 6:
            newWeightFormData["Interfaces con BD"] =
              pf.cantidad_estimada || pf.cantidad_estim || 0;
            break;
          case 7:
            newWeightFormData.Reportes =
              pf.cantidad_estimada || pf.cantidad_estim || 0;
            break;
          case 8:
            newWeightFormData.Componentes =
              pf.cantidad_estimada || pf.cantidad_estim || 0;
            break;
          case 9:
            newWeightFormData.Javascript =
              pf.cantidad_estimada || pf.cantidad_estim || 0;
            break;
          case 10:
            newWeightFormData["Componentes Config. y Pruebas"] =
              pf.cantidad_estimada || pf.cantidad_estim || 0;
            break;
          case 11:
            newWeightFormData["Despliegue app movil"] =
              pf.cantidad_estimada || pf.cantidad_estim || 0;
            break;
          case 12:
            newWeightFormData.QA =
              pf.cantidad_estimada || pf.cantidad_estim || 0;
            break;
          case 13:
            newWeightFormData.PF =
              pf.cantidad_estimada || pf.cantidad_estim || 0;
            break;
          default:
            break;
        }
      });
      setWeightFormData(newWeightFormData);
    } else {
      // Si no existen datos, se carga el formulario vacío
      setWeightFormData(emptyWeightForm);
    }
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
          requirements.map((requirement) => {
            // Verifica si existen puntos de función para este requerimiento
            const hasFunctionPoints = requirementPuntosFuncion.some(
              (pf) => pf.requerimientoid === requirement.requerimientoid
            );

            return (
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
                    {/* Solo muestra "Generate Weights" si NO hay puntos de función */}
                    {!hasFunctionPoints && (
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
                              Weights for{" "}
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
                            onSave={async () => {
                              setSaveLoading(true);
                              try {
                                const tipoElementoMap: Record<string, number> =
                                  {
                                    Tablas: 1,
                                    "Triggers/SP": 2,
                                    "Interfaces c/aplicativos": 3,
                                    Formularios: 4,
                                    "Subrutinas complejas": 5,
                                    "Interfaces con BD": 6,
                                    Reportes: 7,
                                    Componentes: 8,
                                    Javascript: 9,
                                    "Componentes Config. y Pruebas": 10,
                                    "Despliegue app movil": 11,
                                    QA: 12,
                                    PF: 13,
                                  };

                                const { error } = await supabase
                                  .from("punto_funcion")
                                  .insert(
                                    Object.entries(weightFormData).map(
                                      ([key, value]) => ({
                                        cantidad_estimada: value,
                                        tipo_elemento_afectado_id:
                                          tipoElementoMap[key],
                                        requerimientoid:
                                          selectedRequirement?.requerimientoid,
                                      })
                                    )
                                  );

                                if (error) throw error;

                                toast({
                                  title: "Success",
                                  description: "Weights saved successfully",
                                });
                                await fetchPuntosFuncion();
                              } catch (error) {
                                console.error("Error saving weights:", error);
                                toast({
                                  title: "Error",
                                  description: "Error saving weights",
                                  variant: "destructive",
                                });
                              } finally {
                                setSaveLoading(false);
                              }
                            }}
                            loading={aiLoading}
                            saveLoading={saveLoading}
                          />
                        </SheetContent>
                      </Sheet>
                    )}

                    {/* Botón para abrir el formulario de edición/creación vacío o con datos existentes */}
                    <Sheet>
                      <SheetTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenWeightForm(requirement)}
                        >
                          {hasFunctionPoints ? "Edit Form" : "Empty Form"}
                        </Button>
                      </SheetTrigger>
                      <SheetContent>
                        <SheetHeader>
                          <SheetTitle>
                            {hasFunctionPoints ? "Edit" : "Empty"} Form for{" "}
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
                          onSave={async () => {
                            setSaveLoading(true);
                            try {
                              const tipoElementoMap: Record<string, number> = {
                                Tablas: 1,
                                "Triggers/SP": 2,
                                "Interfaces c/aplicativos": 3,
                                Formularios: 4,
                                "Subrutinas complejas": 5,
                                "Interfaces con BD": 6,
                                Reportes: 7,
                                Componentes: 8,
                                Javascript: 9,
                                "Componentes Config. y Pruebas": 10,
                                "Despliegue app movil": 11,
                                QA: 12,
                                PF: 13,
                              };

                              const { error } = await supabase
                                .from("punto_funcion")
                                .insert(
                                  Object.entries(weightFormData).map(
                                    ([key, value]) => ({
                                      cantidad_estim: value,
                                      tipo_elemento: tipoElementoMap[key],
                                      requerimiento:
                                        selectedRequirement?.requerimientoid,
                                    })
                                  )
                                );

                              if (error) throw error;

                              toast({
                                title: "Success",
                                description: "Weights saved successfully",
                              });
                              await fetchPuntosFuncion();
                            } catch (error) {
                              console.error("Error saving weights:", error);
                              toast({
                                title: "Error",
                                description: "Error saving weights",
                                variant: "destructive",
                              });
                            } finally {
                              setSaveLoading(false);
                            }
                          }}
                          loading={false}
                          saveLoading={saveLoading}
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
            );
          })
        )}
      </div>
    </div>
  );
}
