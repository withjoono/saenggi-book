import React, { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Label,
  Legend,
  ReferenceLine,
  XAxis,
  YAxis,
} from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
} from "@/components/custom/chart";
import { cn } from "@/lib/utils";
import { reverseGrade } from "@/lib/utils/common/format";

interface RecentGradeCutChartProps {
  data: {
    year: number;
    ranking: number;
  }[];
  myGrade?: number | null;
  className?: string;
}

const chartConfig = {
  grade: {
    label: "등급",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

export const RecentGradeCutChart: React.FC<RecentGradeCutChartProps> = ({
  data,
  myGrade,
  className,
}) => {
  const processedData = useMemo(
    () =>
      data.map((item) => ({
        ...item,
        displayRanking: 10 - item.ranking,
        originalRanking: item.ranking,
      })),
    [data],
  );

  const reversedMyGrade = myGrade !== undefined ? reverseGrade(myGrade) : null;

  return (
    <ChartContainer
      config={chartConfig}
      className={cn("h-[400px] min-h-[300px] w-full", className)}
    >
      <BarChart
        data={processedData}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid vertical={false} horizontal={true} z={1} />
        <Legend content={<CustomLegend />} verticalAlign="top" />
        <XAxis
          dataKey="year"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          tick={<TickX />}
          height={120}
          interval={0}
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
        <ChartTooltip cursor={false} content={<CustomTooltip />} />
        <Bar
          dataKey="displayRanking"
          fill="var(--color-grade)"
          name="등급"
          radius={[8, 8, 0, 0]}
          barSize={50}
        />

        {reversedMyGrade !== null && (
          <ReferenceLine y={reversedMyGrade} strokeWidth={3}>
            <Label value="내 등급" content={<LabelRender />} />
          </ReferenceLine>
        )}
      </BarChart>
    </ChartContainer>
  );
};

const TickX = ({ x, y, payload }: { x?: number; y?: number; payload?: { value: string | number } }) => {
  return (
    <g transform={`translate(${x},${y})`}>
      <text x={0} y={0} dy={16} textAnchor="middle" fill="#666">
        {payload?.value ?? 0}
      </text>
    </g>
  );
};

const TickY = ({ x, y, payload }: { x?: number; y?: number; payload?: { value: number } }) => {
  const grade = reverseGrade(payload?.value ?? 0);
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
        {grade !== null ? `${grade.toFixed(2)}등급` : "N/A"}
      </text>
    </g>
  );
};
const CustomLegend = () => {
  return (
    <div className="flex items-center space-x-4 px-4 py-2 pb-4">
      <div className="flex items-center">
        <div className="mr-2 h-3 w-3 bg-[hsl(var(--primary))]"></div>
        <span className="text-xs font-semibold">등급</span>
      </div>
    </div>
  );
};

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ payload: { originalRanking: number } }>; label?: string | number }) => {
  if (active && payload && payload.length) {
    const originalRanking = payload[0].payload.originalRanking;
    const grade = reverseGrade(originalRanking);
    return (
      <div className="rounded-lg border bg-background p-2 shadow-sm">
        <p className="text-sm font-medium">{`${label}년도`}</p>
        <p className="text-sm">
          {`등급: ${
            grade !== null
              ? grade === 9
                ? "데이터 없음"
                : grade.toFixed(2)
              : "N/A"
          }`}
        </p>
      </div>
    );
  }

  return null;
};

const LabelRender = (props: { viewBox?: { x?: number; y?: number; width?: number; height?: number } }) => {
  const { viewBox } = props;
  const x = viewBox?.x ?? 0;
  const y = viewBox?.y ?? 0 - 30;

  return (
    <text
      x={x + 7}
      y={y + 48}
      textAnchor="start"
      className="fill-blue-500"
      fontSize={13}
    >
      내 등급
    </text>
  );
};
