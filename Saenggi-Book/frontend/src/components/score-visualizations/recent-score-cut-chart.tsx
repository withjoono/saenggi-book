import React from "react";
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

interface RecentScoreCutChartProps {
  data: {
    year: number;
    cut50: number | null;
    cut70: number | null;
    myScore?: number | null;
  }[];
  myScore?: number | null;
  className?: string;
  totalScore?: number;
}

const chartConfig = {
  cut50: {
    label: "50%컷",
    color: "#22c55e", // 초록색
  },
  cut70: {
    label: "70%컷",
    color: "#f97316", // 주황색
  },
} satisfies ChartConfig;

export const RecentScoreCutChart: React.FC<RecentScoreCutChartProps> = ({
  data,
  myScore,
  className,
  totalScore,
}) => {
  // 디버깅: 차트에 전달된 데이터 확인
  console.log("[RecentScoreCutChart] data:", data);
  console.log("[RecentScoreCutChart] myScore:", myScore);
  console.log("[RecentScoreCutChart] totalScore:", totalScore);

  // 데이터에서 최소/최대값 계산하여 Y축 범위 결정
  const allValues = data.flatMap(d => [d.cut50, d.cut70, myScore]).filter((v): v is number => v !== null && v !== undefined);
  const minValue = allValues.length > 0 ? Math.min(...allValues) : 0;
  const maxValue = allValues.length > 0 ? Math.max(...allValues) : totalScore || 1000;
  const padding = (maxValue - minValue) * 0.1;
  const yMin = Math.max(0, Math.floor((minValue - padding) / 10) * 10);
  const yMax = Math.ceil((maxValue + padding) / 10) * 10;

  return (
    <ChartContainer
      config={chartConfig}
      className={cn("h-[400px] min-h-[300px] w-full", className)}
    >
      <BarChart
        data={data}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid vertical={false} horizontal={true} z={1} />
        <Legend content={<CustomLegend myScore={myScore} />} verticalAlign="top" />
        <XAxis
          dataKey="year"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          tick={<TickX />}
          height={60}
          interval={0}
        />

        <YAxis
          stroke="#888888"
          interval={0}
          type="number"
          axisLine={false}
          tickLine={false}
          domain={[yMin, yMax]}
          tick={(props) => <TickY {...props} />}
        />
        <ChartTooltip cursor={false} content={<CustomTooltip />} />

        {/* 70%컷 막대 - 주황색 */}
        <Bar
          dataKey="cut70"
          fill="#f97316"
          name="70%컷"
          radius={[8, 8, 0, 0]}
          barSize={35}
        />

        {/* 50%컷 막대 - 초록색 */}
        <Bar
          dataKey="cut50"
          fill="#22c55e"
          name="50%컷"
          radius={[8, 8, 0, 0]}
          barSize={35}
        />

        {/* 내 점수 청색 가로선 */}
        {myScore !== null && myScore !== undefined && (
          <ReferenceLine
            y={myScore}
            stroke="#3b82f6"
            strokeWidth={3}
            strokeDasharray="none"
          >
            <Label value="(내점수)" content={<LabelRender myScore={myScore} />} />
          </ReferenceLine>
        )}
      </BarChart>
    </ChartContainer>
  );
};

const TickX = ({ x, y, payload }: { x?: number; y?: number; payload?: { value: string | number } }) => {
  return (
    <g transform={`translate(${x},${y})`}>
      <text x={0} y={0} dy={16} textAnchor="middle" fill="#666" fontWeight={600}>
        {payload?.value ?? 0}
      </text>
    </g>
  );
};

const TickY = ({ x, y, payload }: { x?: number; y?: number; payload?: { value: number } }) => {
  const score = payload?.value ?? 0;
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
        {score !== null ? `${score.toFixed(0)}` : "N/A"}
      </text>
    </g>
  );
};

const CustomLegend = ({ myScore }: { myScore?: number | null }) => {
  return (
    <div className="flex items-center justify-center space-x-4 px-4 py-2 pb-4">
      <div className="flex items-center">
        <div className="mr-2 h-3 w-3 rounded-sm bg-[#f97316]"></div>
        <span className="text-xs font-semibold">70%컷</span>
      </div>
      <div className="flex items-center">
        <div className="mr-2 h-3 w-3 rounded-sm bg-[#22c55e]"></div>
        <span className="text-xs font-semibold">50%컷</span>
      </div>
      {myScore !== null && myScore !== undefined && (
        <div className="flex items-center">
          <div className="mr-2 h-0.5 w-4 bg-[#3b82f6]"></div>
          <span className="text-xs font-semibold">내 점수</span>
        </div>
      )}
    </div>
  );
};

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ payload?: { myScore?: number | null }; dataKey?: string; value?: number }>; label?: string | number }) => {
  if (active && payload && payload.length) {
    const myScore = payload[0]?.payload?.myScore;
    const cut50 = payload.find((p) => p.dataKey === "cut50")?.value;
    const cut70 = payload.find((p) => p.dataKey === "cut70")?.value;

    return (
      <div className="rounded-lg border bg-background p-2 shadow-sm">
        <p className="text-sm font-medium">{`${label}년도`}</p>
        <p className="text-sm text-[#22c55e]">
          {`50%컷: ${cut50 !== null && cut50 !== undefined ? cut50.toFixed(2) : "N/A"}`}
        </p>
        <p className="text-sm text-[#f97316]">
          {`70%컷: ${cut70 !== null && cut70 !== undefined ? cut70.toFixed(2) : "N/A"}`}
        </p>
        {myScore !== null && myScore !== undefined && (
          <p className="text-sm text-[#3b82f6]">
            {`내 점수: ${myScore.toFixed(2)}`}
          </p>
        )}
      </div>
    );
  }

  return null;
};

const LabelRender = (props: { viewBox?: { x?: number; y?: number; width?: number; height?: number } }) => {
  const { viewBox } = props;
  const x = viewBox?.width ?? 0 + viewBox?.x ?? 0 - 60;
  const y = viewBox?.y ?? 0;

  return (
    <text
      x={x}
      y={y + 15}
      textAnchor="start"
      fill="#3b82f6"
      fontSize={12}
      fontWeight={600}
    >
      (내점수)
    </text>
  );
};
