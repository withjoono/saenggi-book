import { Bar, BarChart, CartesianGrid, YAxis } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/custom/chart";
import { useMemo } from "react";
import { cn } from "@/lib/utils";

interface EvaluationScoreStackChartProps {
  data: {
    name: string;
    score: number;
  }[];
  className?: string;
}

export const EvaluationScoreStackChart = ({
  data,
  className,
}: EvaluationScoreStackChartProps) => {
  const preprocessedData = useMemo(() => {
    const temp: Record<string, string> = {};
    data.forEach((item, idx) => {
      const key = `item${idx}`;
      temp[key] = (item.score / data.length).toFixed(2);
    });
    return temp;
  }, [data]);

  const barColors = [
    "#FFA07A",
    "#FF7F50",
    "#FF6347",
    "#FF4500",
    "#FF8C00",
    "#FFA500",
    "#FFD700",
    "#FFDAB9",
    "#FFE4B5",
    "#FFEFD5",
  ];

  const chartConfig = useMemo(() => {
    const temp: Record<string, { label: string; color: string }> = {};
    data.slice(0, 10).forEach((item, idx) => {
      const key = `item${idx}`;
      temp[key] = {
        label: item.name,
        color: barColors[idx],
      };
    });
    return temp satisfies ChartConfig;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  return (
    <ChartContainer
      config={chartConfig}
      className={cn("h-[400px] min-h-[300px] w-full", className)}
    >
      <BarChart
        accessibilityLayer
        data={[preprocessedData]}
        barSize={160}
        outerRadius={4}
      >
        <CartesianGrid vertical={false} />
        <YAxis
          type="number"
          domain={[0, 100]}
          ticks={[0, 14.28, 28.57, 42.85, 57.14, 71.42, 85.71, 100]}
          axisLine={false}
          tickLine={false}
          tick={(props) => <TickY {...props} />}
        />
        <ChartTooltip
          cursor={false}
          content={
            <ChartTooltipContent
              hideLabel
              subText={`평균: ${(data.reduce((acc, n) => acc + n.score, 0) / data.length).toFixed(2)}`}
            />
          }
        />
        <ChartLegend content={<ChartLegendContent />} />
        {Object.keys(preprocessedData).map((key) => (
          <Bar
            key={key}
            dataKey={key}
            stackId="a"
            fill={`var(--color-${key})`}
          />
        ))}
      </BarChart>
    </ChartContainer>
  );
};

const TickY = ({ x, y, payload }: { x?: number; y?: number; payload?: { value: number } }) => {
  const getGrade = (value: number) => {
    if (value >= 100) return "";
    if (value >= 85.71) return "A+";
    if (value >= 71.42) return "A";
    if (value >= 57.14) return "B+";
    if (value >= 42.85) return "B";
    if (value >= 28.57) return "C+";
    if (value >= 14.28) return "C";
    return "D";
  };

  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={-5}
        y={0}
        dy={4}
        fontSize={12}
        fill="#9A9A9A"
        textAnchor="end"
        fontWeight={400}
        fontFamily="Roboto"
      >
        {getGrade(payload?.value ?? 0)}
      </text>
    </g>
  );
};
