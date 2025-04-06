
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface EffortInputFormProps {
  estimatedHours: number;
  formatNumber: (num: number) => string;
  realEffort: string;
  onRealEffortChange: (value: string) => void;
}

export const EffortInputForm = ({
  estimatedHours,
  formatNumber,
  realEffort,
  onRealEffortChange
}: EffortInputFormProps) => {
  // Convert workdays to hours (8 hours per workday)
  const workdayToHours = (workdays: number) => workdays * 8;
  const estimatedHoursInHrs = workdayToHours(estimatedHours);
  const realEffortNum = parseFloat(realEffort) || 0;
  const realEffortInHrs = workdayToHours(realEffortNum);

  return (
    <div className="grid gap-4 py-4">
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="estimatedHours" className="text-right">
          Estimado:
        </Label>
        <div className="col-span-3">
          <Input
            id="estimatedHours"
            value={formatNumber(estimatedHours)}
            readOnly
            className="mb-1 bg-muted"
          />
          <div className="text-sm text-muted-foreground">
            {formatNumber(estimatedHoursInHrs)} hrs
          </div>
        </div>
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="realEffort" className="text-right">
          Real:
        </Label>
        <div className="col-span-3">
          <Input
            id="realEffort"
            value={realEffort}
            onChange={(e) => onRealEffortChange(e.target.value)}
            type="number"
            min="0"
            step="0.1"
            className="mb-1"
          />
          {realEffortNum > 0 && (
            <div className="text-sm text-muted-foreground">
              {formatNumber(realEffortInHrs)} hrs
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
