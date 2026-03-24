import { Bar, BarChart, CartesianGrid, Legend, XAxis, YAxis } from "recharts";

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/custom/chart";
import { cn } from "@/lib/utils";

interface EvaluationScoreChartProps {
  data: {
    name: string;
    score: number;
  }[];
  className?: string;
}

const chartConfig = {
  score: {
    label: "내 점수",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

export const EvaluationScoreChart = ({
  data,
  className,
}: EvaluationScoreChartProps) => {
  return (
    <ChartContainer
      config={chartConfig}
      className={cn("h-[400px] min-h-[300px] w-full", className)}
    >
      <BarChart accessibilityLayer data={data}>
        <Legend content={<CustomLegend />} verticalAlign="top" />
        <CartesianGrid vertical={false} horizontal={true} z={1} className="" />
        <XAxis
          dataKey="name"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          tickFormatter={(value) => value.slice(0, 10)}
        />
        <YAxis
          type="number"
          domain={[0, 100]}
          ticks={[0, 14.28, 28.57, 42.85, 57.14, 71.42, 85.71, 100]}
          axisLine={false}
          tickLine={false}
          tick={(props) => <TickY {...props} />}
        />
        <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
        <Bar
          dataKey="score"
          fill="var(--color-score)"
          radius={8}
          barSize={70}
        />
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

const CustomLegend = () => {
  return (
    <div className="flex items-center space-x-4 px-4 py-2 pb-4">
      <div className="flex items-center">
        <div className="mr-2 h-3 w-3 bg-[hsl(var(--primary))]"></div>
        <span className="text-xs font-semibold">내 점수</span>
      </div>
    </div>
  );
};
