import { Bar, BarChart, CartesianGrid, Legend, XAxis, YAxis } from "recharts";

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
} from "@/components/custom/chart";
import { cn } from "@/lib/utils";
import { reverseScore } from "@/lib/utils/common/format";

interface ScoreRiskChartProps {
  middleScore: number;
  stableScore: number;
  myScore?: number | null;
  className?: string;
  totalScore: number;
}

const chartConfig = {
  middleScore: {
    label: "추합컷",
    color: "#3b82f6",
  },
  stableScore: {
    label: "최초컷",
    color: "#16a34a",
  },
  myScore: {
    label: "내 점수",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

export const ScoreRiskChart = ({
  middleScore,
  stableScore,
  myScore,
  className,
  totalScore,
}: ScoreRiskChartProps) => {
  const preprocessed = [
    {
      name: "추합컷/내 점수/최초컷",
      originalMiddleScore: middleScore,
      originalStableScore: stableScore,
      originalMyScore: myScore,
    },
  ];
  console.log(preprocessed);
  return (
    <ChartContainer
      config={chartConfig}
      className={cn("h-[400px] min-h-[300px] w-full", className)}
    >
      <BarChart accessibilityLayer data={preprocessed}>
        <Legend content={<CustomLegend />} verticalAlign="top" />
        <CartesianGrid vertical={false} horizontal={true} z={1} className="" />
        <XAxis
          dataKey="name"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          tickFormatter={(value) => value}
        />
        <YAxis
          stroke="#888888"
          interval={0}
          type="number"
          tickCount={11}
          domain={[0, totalScore || 1000]}
          axisLine={false}
          tickLine={false}
          tick={(props) => <TickY {...props} />}
        />
        <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
        <Bar
          dataKey="originalMiddleScore"
          fill="var(--color-middleScore)"
          radius={8}
          barSize={50}
          name={"추합컷"}
        />
        <Bar
          dataKey="originalMyScore"
          fill="var(--color-myScore)"
          radius={8}
          barSize={50}
          name={"내 점수"}
        />
        <Bar
          dataKey="originalStableScore"
          fill="var(--color-stableScore)"
          radius={8}
          barSize={50}
          name={"최초컷"}
        />
      </BarChart>
    </ChartContainer>
  );
};

const TickY = ({ x, y, payload }: { x?: number; y?: number; payload?: { value: number } }) => {
  const grade = payload?.value ?? 0;
  return (
    <g transform={`translate(${x},${y})`}>
      <text
        fontSize={12}
        fill="#9A9A9A"
        textAnchor="end"
        fontWeight={400}
        fontFamily="Roboto"
      >
        {grade !== null ? `${grade.toFixed(2)}점` : "N/A"}
      </text>
    </g>
  );
};

const CustomLegend = () => {
  return (
    <div className="flex items-center space-x-4 px-4 py-2 pb-8">
      <div className="flex items-center">
        <div className="mr-2 h-3 w-3 bg-blue-500"></div>
        <span className="text-xs font-semibold">추합컷</span>
      </div>
      <div className="flex items-center">
        <div className="mr-2 h-3 w-3 bg-[hsl(var(--primary))]"></div>
        <span className="text-xs font-semibold">내 점수</span>
      </div>
      <div className="flex items-center">
        <div className="mr-2 h-3 w-3 bg-green-600"></div>
        <span className="text-xs font-semibold">최초컷</span>
      </div>
    </div>
  );
};

const ChartTooltipContent = ({ active, payload }: { active?: boolean; payload?: Array<{ dataKey?: string; value?: number; color?: string; name?: string }> }) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-background p-2 shadow-sm">
        {payload.map((entry, index: number) => {
          const value = entry.dataKey?.startsWith("original")
            ? entry.value
            : reverseScore(entry.value);
          return (
            <div key={`item-${index}`} className="flex items-center space-x-2">
              <div
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-sm font-medium">{entry.name}:</span>
              <span className="text-sm font-medium">
                {value !== null ? `${value.toFixed(2)}점` : "N/A"}
              </span>
            </div>
          );
        })}
      </div>
    );
  }

  return null;
};
