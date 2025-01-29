import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { NeedsList } from "@/components/NeedsList";

interface Project {
  proyectoid: number;
  nombreproyecto: string;
}

export default function ProjectDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        if (!id) throw new Error("No project ID provided");

        const { data, error } = await supabase
          .from("proyecto")
          .select("*")
          .eq("proyectoid", id)
          .single();

        if (error) throw error;
        if (!data) throw new Error("Project not found");

        setProject(data);
      } catch (error) {
        setError(error instanceof Error ? error.message : "Error fetching project");
      } finally {
        setLoading(false);
      }
    };

    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        navigate("/");
      }
    };

    checkUser();
    fetchProject();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md mb-4">
            {error || "Project not found"}
          </div>
          <Button onClick={() => navigate("/home")}>Back to Projects</Button>
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
              onClick={() => navigate("/home")}
            >
              Back to Projects
            </Button>
            <h1 className="text-3xl font-bold">{project.nombreproyecto}</h1>
          </div>
        </div>

        <div className="p-4 rounded-lg border bg-card">
          <NeedsList projectId={project.proyectoid} onClose={() => {}} />
        </div>
      </div>
    </div>
  );
}
