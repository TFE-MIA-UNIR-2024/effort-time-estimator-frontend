
import React from "react";
import { InfoIcon } from "lucide-react";

interface EffortDeviationInfoProps {
  estimatedHours: number;
  realEffortNum: number;
  formatNumber: (num: number) => string;
}

export const EffortDeviationInfo = ({
  estimatedHours,
  realEffortNum,
  formatNumber
}: EffortDeviationInfoProps) => {
  // Calculate deviation if real effort exists
  const deviation = realEffortNum > 0 ? realEffortNum - estimatedHours : 0;
  const deviationPercentage = estimatedHours > 0
    ? ((realEffortNum - estimatedHours) / estimatedHours) * 100
    : 0;

  // Convert workdays to hours (8 hours per workday)
  const workdayToHours = (workdays: number) => workdays * 8;
  const deviationInHrs = workdayToHours(deviation);

  return (
    <>
      <div className="grid grid-cols-4 items-center gap-4">
        <span className="text-right font-medium">Desviación:</span>
        <div className="col-span-3 flex flex-col">
          <div className="flex items-center gap-2">
            <span className={`font-medium ${deviation < 0 ? 'text-green-600' : deviation > 0 ? 'text-red-600' : 'text-gray-600'}`}>
              {deviation < 0 ? '-' : deviation > 0 ? '+' : ''}{formatNumber(Math.abs(deviation))} jornada
            </span>
            <span className={`text-sm ${deviation < 0 ? 'text-green-600' : deviation > 0 ? 'text-red-600' : 'text-gray-600'}`}>
              ({deviationPercentage < 0 ? '-' : deviationPercentage > 0 ? '+' : ''}{formatNumber(Math.abs(deviationPercentage))}%)
            </span>
          </div>
          <span className={`text-sm ${deviation < 0 ? 'text-green-600' : deviation > 0 ? 'text-red-600' : 'text-gray-600'}`}>
            {deviation < 0 ? '-' : deviation > 0 ? '+' : ''}{formatNumber(Math.abs(deviationInHrs))} hrs
          </span>
        </div>
      </div>

      <div className="bg-muted p-4 rounded-lg mt-2">
        <div className="flex items-start gap-2">
          <InfoIcon className="h-5 w-5 text-blue-500 mt-0.5 shrink-0" />
          <div className="text-sm">
            <p className="font-medium mb-1">Cálculo de la desviación:</p>
            <ul className="space-y-1 list-disc pl-5">
              <li><span className="font-medium">Desviación (jornada):</span> Esfuerzo Real - Esfuerzo Estimado = {formatNumber(realEffortNum)} - {formatNumber(estimatedHours)} = {formatNumber(deviation)}</li>
              <li><span className="font-medium">Desviación (%):</span> (Esfuerzo Real - Esfuerzo Estimado) / Esfuerzo Estimado × 100% = {formatNumber(deviationPercentage)}%</li>
              <li><span className="font-medium">Desviación (horas):</span> Desviación en jornada × 8 = {formatNumber(deviation)} × 8 = {formatNumber(deviationInHrs)}</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
};
