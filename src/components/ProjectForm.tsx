import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";

interface ProjectFormProps {
  projectId?: number;
  onSuccess: () => void;
  onCancel: () => void;
}

export function ProjectForm({
  projectId,
  onSuccess,
  onCancel,
}: ProjectFormProps) {
  const [nombreproyecto, setNombreproyecto] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProject = async () => {
      if (!projectId) {
        setNombreproyecto("");
        return;
      }

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("proyecto")
          .select("*")
          .eq("proyectoid", projectId)
          .single();

        if (error) throw error;
        if (data) {
          setNombreproyecto(data.nombreproyecto);
        }
      } catch (error) {
        setError(
          error instanceof Error ? error.message : "Error fetching project"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [projectId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (projectId) {
        // Update existing project
        const { error } = await supabase
          .from("proyecto")
          .update({
            nombreproyecto,
            fase_proyectoid: 1,
          })
          .eq("proyectoid", projectId);

        if (error) throw error;
      } else {
        // Create new project
        const { error } = await supabase.from("proyecto").insert([
          {
            nombreproyecto,
            fase_proyectoid: 1,
          },
        ]);

        if (error) throw error;
      }

      onSuccess();
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md">
          {error}
        </div>
      )}
      <div>
        <Input
          placeholder="Project name"
          value={nombreproyecto}
          onChange={(e) => setNombreproyecto(e.target.value)}
          required
        />
      </div>
      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading
            ? "Saving..."
            : projectId
            ? "Update Project"
            : "Create Project"}
        </Button>
      </div>
    </form>
  );
}
