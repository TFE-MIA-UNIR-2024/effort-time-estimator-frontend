import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { NeedsList } from "@/components/NeedsList";
import { ArrowLeft } from "lucide-react";

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
    <div>
      <div className="mb-8">
        <Button
          variant="ghost"
          size="sm"
          className="mb-4"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <h1 className="text-3xl font-bold">{project.nombreproyecto}</h1>
      </div>

      <div className="rounded-lg border bg-card">
        <NeedsList projectId={project.proyectoid} onClose={() => {}} />
      </div>
    </div>
  );
}
