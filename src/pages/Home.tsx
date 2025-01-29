import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { ProjectForm } from "@/components/ProjectForm";

interface Project {
  proyectoid: number;
  nombreproyecto: string;
}

export default function Home() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState<number | undefined>();

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase.from("proyecto").select("*");

      if (error) throw error;

      setProjects(data || []);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Error fetching projects"
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
    fetchProjects();
  }, [navigate]);

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this project?")) return;

    try {
      const { error } = await supabase
        .from("proyecto")
        .delete()
        .eq("proyectoid", id);

      if (error) throw error;

      await fetchProjects();
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Error deleting project"
      );
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingProjectId(undefined);
    fetchProjects();
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingProjectId(undefined);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Projects</h1>
          <div className="flex gap-4">
            <Button
              onClick={() => {
                setEditingProjectId(undefined);
                setShowForm(true);
              }}
            >
              New Project
            </Button>
            <button
              onClick={handleSignOut}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Sign out
            </button>
          </div>
        </div>

        {showForm && (
          <div className="mb-8 p-4 rounded-lg border bg-card">
            <ProjectForm
              projectId={editingProjectId}
              onSuccess={handleFormSuccess}
              onCancel={handleFormCancel}
            />
          </div>
        )}

        {error && (
          <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md mb-4">
            {error}
          </div>
        )}

        <div className="grid gap-4">
          {projects.map((project) => (
            <div
              key={project.proyectoid}
              className="p-4 rounded-lg border bg-card text-card-foreground shadow-sm"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-semibold">
                    {project.nombreproyecto}
                  </h2>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/project/${project.proyectoid}`)}
                  >
                    View Details
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setShowForm(true);
                      setTimeout(() => {
                        setEditingProjectId(project.proyectoid);
                      }, 0);
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(project.proyectoid)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
