import { Bar, BarChart, CartesianGrid, Legend, XAxis, YAxis } from "recharts";

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
} from "@/components/custom/chart";
import { cn } from "@/lib/utils";
import { reverseGrade } from "@/lib/utils/common/format";

interface SubjectRiskChartProps {
  middleGrade: number;
  stableGrade: number;
  myGrade?: number | null;
  className?: string;
}

const chartConfig = {
  middleGrade: {
    label: "소신",
    color: "#3b82f6",
  },
  stableGrade: {
    label: "안정",
    color: "#16a34a",
  },
  myGrade: {
    label: "내 등급",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

export const SubjectRiskChart = ({
  middleGrade,
  stableGrade,
  myGrade,
  className,
}: SubjectRiskChartProps) => {
  const preprocessed = [
    {
      name: "소신/내 등급/안전",
      middleGrade: reverseGrade(middleGrade),
      stableGrade: reverseGrade(stableGrade),
      myGrade: reverseGrade(myGrade),
      originalMiddleGrade: middleGrade,
      originalStableGrade: stableGrade,
      originalMyGrade: myGrade,
    },
  ];

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
          tickFormatter={(value) => value.slice(0, 10)}
        />
        <YAxis
          stroke="#888888"
          interval={0}
          type="number"
          tickCount={9}
          axisLine={false}
          tickLine={false}
          domain={[1, 9]}
          tick={(props) => <TickY {...props} />}
        />
        <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
        <Bar
          dataKey="middleGrade"
          fill="var(--color-middleGrade)"
          radius={8}
          barSize={50}
          name={"소신"}
        />
        <Bar
          dataKey="myGrade"
          fill="var(--color-myGrade)"
          radius={8}
          barSize={50}
          name={"내 등급"}
        />
        <Bar
          dataKey="stableGrade"
          fill="var(--color-stableGrade)"
          radius={8}
          barSize={50}
          name={"안정"}
        />
      </BarChart>
    </ChartContainer>
  );
};

const TickY = ({ x, y, payload }: { x?: number; y?: number; payload?: { value: number } }) => {
  const grade = reverseGrade(payload?.value ?? 0);
  return (
    <g transform={`translate(${x},${y})`}>
      <text
        fontSize={12}
        fill="#9A9A9A"
        textAnchor="end"
        fontWeight={400}
        fontFamily="Roboto"
      >
        {grade !== null ? `${grade.toFixed(2)} 등급` : "N/A"}
      </text>
    </g>
  );
};

const CustomLegend = () => {
  return (
    <div className="flex items-center space-x-4 px-4 py-2 pb-8">
      <div className="flex items-center">
        <div className="mr-2 h-3 w-3 bg-blue-500"></div>
        <span className="text-xs font-semibold">소신</span>
      </div>
      <div className="flex items-center">
        <div className="mr-2 h-3 w-3 bg-[hsl(var(--primary))]"></div>
        <span className="text-xs font-semibold">내 등급</span>
      </div>
      <div className="flex items-center">
        <div className="mr-2 h-3 w-3 bg-green-600"></div>
        <span className="text-xs font-semibold">안정</span>
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
            : reverseGrade(entry.value);
          return (
            <div key={`item-${index}`} className="flex items-center space-x-2">
              <div
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-sm font-medium">{entry.name}:</span>
              <span className="text-sm font-medium">
                {value !== null ? `${value.toFixed(2)} 등급` : "N/A"}
              </span>
            </div>
          );
        })}
      </div>
    );
  }

  return null;
};
