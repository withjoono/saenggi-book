import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
} from "recharts";

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/custom/chart";
import { cn } from "@/lib/utils";

interface EvaluationScoreStackChartProps {
  data: {
    name: string;
    score: number;
    standard?: number;
  }[];
  className?: string;
}

const chartConfig = {
  score: {
    label: "내 점수",
    color: "hsl(var(--primary))",
  },
  standard: {
    label: "권장 점수",
    color: "#3b82f6",
  },
} satisfies ChartConfig;

export function EvaluationRadarChart({
  data,
  className,
}: EvaluationScoreStackChartProps) {
  return (
    <ChartContainer
      config={chartConfig}
      className={cn("aspect-square h-[400px] min-h-[300px] w-full", className)}
    >
      <RadarChart data={data}>
        <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
        <PolarGrid className="fill-[--color-score] opacity-20" />
        <PolarAngleAxis dataKey="name" />
        <PolarRadiusAxis domain={[0, 100]} axisLine={false} tick={false} />
        <Radar
          dataKey="score"
          fill="var(--color-score)"
          stroke="var(--color-score)"
          fillOpacity={0}
          strokeWidth={2}
        />
        <Radar
          dataKey="standard"
          fill="var(--color-standard)"
          fillOpacity={0.6}
        />
      </RadarChart>
    </ChartContainer>
  );
}
