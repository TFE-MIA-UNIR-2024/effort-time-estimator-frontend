
interface NeedsEmptyStateProps {
  loading: boolean;
}

const NeedsEmptyState = ({ loading }: NeedsEmptyStateProps) => {
  if (loading) {
    return <div className="py-8 text-center">Cargando necesidades...</div>;
  }
  
  return (
    <div className="py-8 text-center border rounded-lg bg-gray-50">
      No hay necesidades registradas para este proyecto
    </div>
  );
};

export default NeedsEmptyState;
