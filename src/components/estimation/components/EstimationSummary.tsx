
interface EstimationSummaryProps {
  totalProjectHours: number;
  needsCount: number;
  formatNumber: (num: number) => string;
}

const EstimationSummary = ({ totalProjectHours, needsCount, formatNumber }: EstimationSummaryProps) => {
  // Convert workdays to hours (8 hours per workday)
  const totalProjectInHours = totalProjectHours * 8;

  return (
    <div className="mb-6 p-4 bg-muted/50 rounded-lg">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Esfuerzo Total</p>
          <p className="text-2xl font-semibold">{formatNumber(totalProjectHours)}</p>
          <p className="text-sm text-muted-foreground">
            {formatNumber(totalProjectInHours)} hrs
          </p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Necesidades</p>
          <p className="text-2xl font-semibold">{needsCount}</p>
        </div>
      </div>
    </div>
  );
};

export default EstimationSummary;
