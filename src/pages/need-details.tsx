import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Need {
  necesidadid: number;
  codigonecesidad: string;
  nombrenecesidad: string;
  proyectoid: number;
  fechacreacion: string;
  texto: string;
  url: string;
}

interface Requirement {
  requerimientoid: number;
  codigorequerimiento: string;
  nombrerequerimiento: string;
  necesidadid: number;
  tiporequerimientoid: number;
  fechacreacion: string;
  texto: string;
}

export default function NeedDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [need, setNeed] = useState<Need | null>(null);
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingRequirement, setEditingRequirement] = useState<Requirement | null>(null);
  const [formData, setFormData] = useState({
    codigorequerimiento: "",
    nombrerequerimiento: "",
    texto: "",
  });

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
      setError(error instanceof Error ? error.message : "Error fetching requirements");
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
        texto: editingRequirement.texto || "",
      });
    } else {
      setFormData({
        codigorequerimiento: "",
        nombrerequerimiento: "",
        texto: "",
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
            texto: formData.texto,
          })
          .eq("requerimientoid", editingRequirement.requerimientoid);

        if (error) throw error;
      } else {
        const { error } = await supabase.from("requerimiento").insert([
          {
            codigorequerimiento: formData.codigorequerimiento,
            nombrerequerimiento: formData.nombrerequerimiento,
            texto: formData.texto,
            necesidadid: id,
            tiporequerimientoid: 1,
            fechacreacion: new Date().toISOString(),
          },
        ]);

        if (error) throw error;
      }

      setFormData({ codigorequerimiento: "", nombrerequerimiento: "", texto: "" });
      setShowForm(false);
      setEditingRequirement(null);
      await fetchRequirements();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Error saving requirement");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (requirementId: number) => {
    if (!window.confirm("Are you sure you want to delete this requirement?")) return;

    try {
      setLoading(true);
      const { error } = await supabase
        .from("requerimiento")
        .delete()
        .eq("requerimientoid", requirementId);

      if (error) throw error;
      await fetchRequirements();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Error deleting requirement");
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
    setFormData({ codigorequerimiento: "", nombrerequerimiento: "", texto: "" });
  };

  if (loading && !need) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (error || !need) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md mb-4">
            {error || "Need not found"}
          </div>
          <Button onClick={() => navigate(-1)}>Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <Button
              variant="outline"
              className="mb-4"
              onClick={() => navigate(-1)}
            >
              Go Back
            </Button>
            <h1 className="text-3xl font-bold">{need.nombrenecesidad}</h1>
            <p className="text-muted-foreground">Code: {need.codigonecesidad}</p>
            {need.texto && (
              <p className="text-muted-foreground mt-2">{need.texto}</p>
            )}
            {need.url && (
              <a
                href={need.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline mt-1 block"
              >
                Reference Link
              </a>
            )}
          </div>
          <Button onClick={() => setShowForm(true)}>Add Requirement</Button>
        </div>

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
                  value={formData.texto}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      texto: e.target.value,
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
                    <p className="font-medium">{requirement.nombrerequerimiento}</p>
                    <p className="text-sm text-muted-foreground">
                      Code: {requirement.codigorequerimiento}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Created:{" "}
                      {new Date(requirement.fechacreacion).toLocaleDateString()}
                    </p>
                    {requirement.texto && (
                      <p className="text-sm mt-2">{requirement.texto}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
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
    </div>
  );
}
