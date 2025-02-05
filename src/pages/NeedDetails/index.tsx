import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Wand2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import { emptyWeightForm, NeedDetailsState, FormData } from "./types";
import { RequirementWithId } from "./componentTypes";
import { RequirementForm } from "./components/RequirementForm";
import { RequirementCard } from "./components/RequirementCard";
import * as api from "./api";
import { extractRequirements, generateWeights } from "./aiHelpers";

export default function NeedDetails() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { id } = useParams();
  const [state, setState] = useState<NeedDetailsState>({
    need: null,
    requirements: [],
    loading: true,
    error: null,
    showForm: false,
    editingRequirement: null,
    formData: {
      codigorequerimiento: "",
      nombrerequerimiento: "",
      cuerpo: "",
    },
    aiLoading: false,
    progress: 0,
    weightFormData: emptyWeightForm,
    selectedRequirement: null,
    requirementPuntosFuncion: [],
    saveLoading: false,
  });

  const fetchData = async () => {
    try {
      if (!id) throw new Error("No need ID provided");
      const [need, requirements, puntosFuncion] = await Promise.all([
        api.fetchNeed(id),
        api.fetchRequirements(id),
        api.fetchPuntosFuncion(),
      ]);

      setState((prev) => ({
        ...prev,
        need,
        requirements,
        requirementPuntosFuncion: puntosFuncion,
        loading: false,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : "Error fetching data",
        loading: false,
      }));
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
    fetchData();
  }, [id, navigate]);

  useEffect(() => {
    if (state.editingRequirement) {
      setState((prev) => ({
        ...prev,
        formData: {
          codigorequerimiento: state.editingRequirement!.codigorequerimiento,
          nombrerequerimiento: state.editingRequirement!.nombrerequerimiento,
          cuerpo: state.editingRequirement!.cuerpo || "",
        },
      }));
    }
  }, [state.editingRequirement]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      if (!id) throw new Error("No need ID provided");
      await api.saveRequirement(
        state.formData,
        id,
        state.editingRequirement?.requerimientoid
      );

      setState((prev) => ({
        ...prev,
        formData: {
          codigorequerimiento: "",
          nombrerequerimiento: "",
          cuerpo: "",
        },
        showForm: false,
        editingRequirement: null,
      }));

      await fetchData();
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error:
          error instanceof Error ? error.message : "Error saving requirement",
      }));
    } finally {
      setState((prev) => ({ ...prev, loading: false }));
    }
  };

  const handleDelete = async (requirementId: number) => {
    if (!window.confirm("Are you sure you want to delete this requirement?"))
      return;

    setState((prev) => ({ ...prev, loading: true }));
    try {
      await api.deleteRequirement(requirementId);
      await fetchData();
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error:
          error instanceof Error ? error.message : "Error deleting requirement",
      }));
    } finally {
      setState((prev) => ({ ...prev, loading: false }));
    }
  };

  const handleGenerateWeights = async (requirement: RequirementWithId) => {
    setState((prev) => ({ ...prev, aiLoading: true }));
    try {
      const weights = await generateWeights(
        requirement.nombrerequerimiento,
        requirement.cuerpo || ""
      );
      setState((prev) => ({ ...prev, weightFormData: weights }));
    } catch (error) {
      console.error("Error generating weights:", error);
      setState((prev) => ({
        ...prev,
        error: "Error generating weights",
      }));
    } finally {
      setState((prev) => ({ ...prev, aiLoading: false }));
    }
  };

  const handleExtractRequirements = async () => {
    if (!state.need?.cuerpo) {
      setState((prev) => ({
        ...prev,
        error: "No text available to extract requirements from",
      }));
      return;
    }

    setState((prev) => ({ ...prev, aiLoading: true, error: null }));
    try {
      await extractRequirements(id!, state.need.cuerpo, (progress) =>
        setState((prev) => ({ ...prev, progress }))
      );
      await fetchData();
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error:
          error instanceof Error
            ? error.message
            : "Error extracting requirements",
      }));
    } finally {
      setState((prev) => ({ ...prev, aiLoading: false }));
      setTimeout(() => setState((prev) => ({ ...prev, progress: 0 })), 1000);
    }
  };

  const handleOpenWeightForm = (requirement: RequirementWithId) => {
    setState((prev) => ({ ...prev, selectedRequirement: requirement }));
    const existingPoints = state.requirementPuntosFuncion.filter(
      (pf) => pf.requerimientoid === requirement.requerimientoid
    );

    if (existingPoints.length > 0) {
      const newWeightFormData = { ...emptyWeightForm };
      existingPoints.forEach((pf) => {
        const value = pf.cantidad_estimada || pf.cantidad_estim || 0;
        switch (pf.tipo_elemento_afectado_id) {
          case 1:
            newWeightFormData.Tablas = value;
            break;
          case 2:
            newWeightFormData["Triggers/SP"] = value;
            break;
          case 3:
            newWeightFormData["Interfaces c/aplicativos"] = value;
            break;
          case 4:
            newWeightFormData.Formularios = value;
            break;
          case 5:
            newWeightFormData["Subrutinas complejas"] = value;
            break;
          case 6:
            newWeightFormData["Interfaces con BD"] = value;
            break;
          case 7:
            newWeightFormData.Reportes = value;
            break;
          case 8:
            newWeightFormData.Componentes = value;
            break;
          case 9:
            newWeightFormData.Javascript = value;
            break;
          case 10:
            newWeightFormData["Componentes Config. y Pruebas"] = value;
            break;
          case 11:
            newWeightFormData["Despliegue app movil"] = value;
            break;
          case 12:
            newWeightFormData.QA = value;
            break;
          case 13:
            newWeightFormData.PF = value;
            break;
        }
      });
      setState((prev) => ({ ...prev, weightFormData: newWeightFormData }));
    } else {
      setState((prev) => ({ ...prev, weightFormData: emptyWeightForm }));
    }
  };

  if (state.loading && !state.need) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <p>Loading...</p>
      </div>
    );
  }

  if (state.error || !state.need) {
    return (
      <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md">
        {state.error || "Need not found"}
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
          <h1 className="text-3xl font-bold">{state.need.nombrenecesidad}</h1>
          <p className="text-muted-foreground">
            Code: {state.need.codigonecesidad}
          </p>

          {state.need.url && (
            <a
              href={state.need.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline mt-1 block"
            >
              {state.need.url.includes(".pdf") ? "View PDF" : "Reference Link"}
            </a>
          )}
        </div>
        <div className="flex gap-2">
          {state.need.cuerpo && (
            <Button
              variant="outline"
              onClick={handleExtractRequirements}
              disabled={state.aiLoading}
            >
              <Wand2 className="mr-2 h-4 w-4" />
              {state.aiLoading
                ? "Extracting..."
                : "Extract Requirements with AI"}
            </Button>
          )}
          <Button
            onClick={() => setState((prev) => ({ ...prev, showForm: true }))}
          >
            Add Requirement
          </Button>
        </div>
      </div>

      {state.aiLoading && (
        <div className="mb-4">
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div
              className="bg-blue-600 h-4 rounded-full transition-all duration-300"
              style={{ width: `${state.progress}%` }}
            ></div>
          </div>
          <p className="text-sm text-center mt-1">{state.progress}% Complete</p>
        </div>
      )}

      {state.error && (
        <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md mb-4">
          {state.error}
        </div>
      )}

      {state.showForm && (
        <RequirementForm
          formData={state.formData}
          loading={state.loading}
          isEditing={!!state.editingRequirement}
          onSubmit={handleSubmit}
          onCancel={() =>
            setState((prev) => ({
              ...prev,
              showForm: false,
              editingRequirement: null,
              formData: {
                codigorequerimiento: "",
                nombrerequerimiento: "",
                cuerpo: "",
              },
            }))
          }
          onChange={(field: keyof FormData, value: string) =>
            setState((prev) => ({
              ...prev,
              formData: {
                ...prev.formData,
                [field]: value,
              },
            }))
          }
        />
      )}

      <div className="grid gap-4">
        {state.requirements.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">
            No requirements found for this need
          </p>
        ) : (
          state.requirements.map((requirement) => {
            const hasFunctionPoints = state.requirementPuntosFuncion.some(
              (pf) => pf.requerimientoid === requirement.requerimientoid
            );

            return (
              <RequirementCard
                key={requirement.requerimientoid}
                requirement={requirement as RequirementWithId}
                hasFunctionPoints={hasFunctionPoints}
                weightFormData={state.weightFormData}
                saveLoading={state.saveLoading}
                puntosFuncion={state.requirementPuntosFuncion
                  .filter((pf) => pf.requerimientoid === requirement.requerimientoid)
                  .map((pf) => ({
                    cantidad_estimada: pf.cantidad_estimada || pf.cantidad_estim || 0,
                    tipo_elemento_afectado_id: pf.tipo_elemento_afectado_id,
                    cantidad_real: pf.cantidad_real
                  }))
                }
                onGenerateWeights={() => handleGenerateWeights(requirement as RequirementWithId)}
                onWeightChange={(key: string, value: number) =>
                  setState((prev) => ({
                    ...prev,
                    weightFormData: {
                      ...prev.weightFormData,
                      [key]: value,
                    },
                  }))
                }
                onSaveRealWeights={async (weights) => {
                  setState((prev) => ({ ...prev, saveLoading: true }));
                  try {
                    await api.saveRealPuntosFuncion(weights, requirement.requerimientoid);
                    toast({
                      title: "Success",
                      description: "Real quantities saved successfully",
                    });
                    await fetchData();
                  } catch (error) {
                    console.error("Error saving real quantities:", error);
                    toast({
                      title: "Error",
                      description: "Error saving real quantities",
                      variant: "destructive",
                    });
                  } finally {
                    setState((prev) => ({ ...prev, saveLoading: false }));
                  }
                }}
                onSaveWeights={async () => {
                  setState((prev) => ({ ...prev, saveLoading: true }));
                  try {
                    if (!state.selectedRequirement?.requerimientoid) {
                      throw new Error("No requirement selected");
                    }
                    await api.savePuntosFuncion(
                      state.weightFormData as unknown as Record<string, number>,
                      state.selectedRequirement.requerimientoid
                    );
                    toast({
                      title: "Success",
                      description: "Weights saved successfully",
                    });
                    await fetchData();
                  } catch (error) {
                    console.error("Error saving weights:", error);
                    toast({
                      title: "Error",
                      description: "Error saving weights",
                      variant: "destructive",
                    });
                  } finally {
                    setState((prev) => ({ ...prev, saveLoading: false }));
                  }
                }}
                onOpenWeightForm={() =>
                  handleOpenWeightForm(requirement as RequirementWithId)
                }
                onEdit={() =>
                  setState((prev) => ({
                    ...prev,
                    editingRequirement: requirement,
                    showForm: true,
                  }))
                }
                onDelete={() => handleDelete(requirement.requerimientoid)}
              />
            );
          })
        )}
      </div>
    </div>
  );
}
