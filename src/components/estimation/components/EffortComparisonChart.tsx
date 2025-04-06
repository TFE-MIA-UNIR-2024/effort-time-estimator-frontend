
import React from "react";
import { ChartContainer } from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, Legend, Tooltip, XAxis, YAxis } from "recharts";

interface EffortComparisonChartProps {
  estimatedHours: number;
  realEffortNum: number;
  formatNumber: (num: number) => string;
}

export const EffortComparisonChart = ({
  estimatedHours,
  realEffortNum,
  formatNumber
}: EffortComparisonChartProps) => {
  // Convert workdays to hours (8 hours per workday)
  const workdayToHours = (workdays: number) => workdays * 8;
  const estimatedHoursInHrs = workdayToHours(estimatedHours);
  const realEffortInHrs = workdayToHours(realEffortNum);

  // Prepare chart data
  const chartData = [
    {
      name: "Jornada",
      Estimado: estimatedHours,
      Real: realEffortNum > 0 ? realEffortNum : 0,
    },
    {
      name: "Horas",
      Estimado: estimatedHoursInHrs,
      Real: realEffortNum > 0 ? realEffortInHrs : 0,
    }
  ];

  return (
    <ChartContainer className="h-[250px]" config={{
      Estimado: { color: "#4f46e5" },
      Real: { color: "#ef4444" }
    }}>
      <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip formatter={(value) => formatNumber(Number(value))} />
        <Legend />
        <Bar dataKey="Estimado" name="Estimado" fill="#4f46e5" />
        <Bar dataKey="Real" name="Real" fill="#ef4444" />
      </BarChart>
    </ChartContainer>
  );
};
