
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import { MoreVertical } from "lucide-react";

interface Need {
  necesidadid: number;
  nombrenecesidad: string;
  codigonecesidad: string;
  fechacreacion: string;
  cuerpo: string;
}

const NeedsList = ({ projectId }: { projectId: number }) => {
  const [needs, setNeeds] = useState<Need[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchNeeds() {
      try {
        const { data, error } = await supabase
          .from('necesidad')
          .select('*')
          .eq('proyectoid', projectId);

        if (error) {
          throw error;
        }

        setNeeds(data || []);
      } catch (error) {
        console.error('Error fetching needs:', error);
        toast({
          title: "Error",
          description: "No se pudieron cargar las necesidades del cliente",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }

    fetchNeeds();
  }, [projectId, toast]);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Necesidades del Cliente</h2>
        <div className="flex gap-2">
          <Button>Agregar Necesidad</Button>
          <Button variant="outline">Cerrar</Button>
        </div>
      </div>

      {loading ? (
        <div className="py-8 text-center">Cargando necesidades...</div>
      ) : needs.length > 0 ? (
        <div className="space-y-4">
          {needs.map((need) => (
            <Card key={need.necesidadid} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="p-5">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="text-lg font-medium">{need.nombrenecesidad}</h3>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        Ver Detalles
                      </Button>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    <p>Código: {need.codigonecesidad || 'N/A'}</p>
                    <p>Creado: {formatDate(need.fechacreacion) || 'Fecha no disponible'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="py-8 text-center border rounded-lg bg-gray-50">
          No hay necesidades registradas para este proyecto
        </div>
      )}
    </div>
  );
};

export default NeedsList;
