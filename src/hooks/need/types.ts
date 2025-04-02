
export interface Need {
  necesidadid: number;
  nombrenecesidad: string;
  codigonecesidad?: string;
  cuerpo?: string;
  url?: string;
  proyectoid: number;
  fechacreacion?: string;
}

export interface NeedFormProps {
  projectId: number;
  need?: Need | null;
  onSuccess: () => void;
  onCancel: () => void;
}
