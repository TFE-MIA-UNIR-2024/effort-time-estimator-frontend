import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Need, Requirement } from "@/types/need";
import { useNavigate } from "react-router-dom";

export function useNeedDetails(id: string | undefined) {
  const navigate = useNavigate();
  const [need, setNeed] = useState<Need | null>(null);
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  return {
    need,
    requirements,
    loading,
    error,
    fetchRequirements,
  };
}
