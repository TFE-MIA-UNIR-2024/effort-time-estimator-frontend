import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { NeedsList } from "@/components/NeedsList";
import { ArrowLeft } from "lucide-react";
import { EstimationsModal } from "@/components/EstimationsModal";

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
  const [showEstimations, setShowEstimations] = useState(false);

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
        setError(
          error instanceof Error ? error.message : "Error fetching project"
        );
      } finally {
        setLoading(false);
      }
    };

    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        navigate("/login");
      }
    };

    checkUser();
    fetchProject();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <p>Loading...</p>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md">
        {error || "Project not found"}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <div className="flex items-center gap-4 p-4 border-b bg-background sticky top-0 z-10">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <h1 className="text-3xl font-bold">{project.nombreproyecto}</h1>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowEstimations(true)}
        >
          Estimations
        </Button>
      </div>

      <div className="flex-1 overflow-auto p-4">
        <div className="rounded-lg border bg-card">
          <NeedsList projectId={project.proyectoid} onClose={() => {}} />
        </div>
      </div>

      <EstimationsModal
        isOpen={showEstimations}
        onClose={() => setShowEstimations(false)}
        projectId={project.proyectoid}
      />
    </div>
  );
}
