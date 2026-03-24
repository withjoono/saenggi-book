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

interface RecentPercentCutChartProps {
  data: {
    year: number;
    cut50: number | null;
    cut70: number | null;
    myPercent?: number | null;
  }[];
  myPercent: number;
  className?: string;
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

export const RecentPercentCutChart: React.FC<RecentPercentCutChartProps> = ({
  data,
  myPercent,
  className,
}) => {
  // 디버깅: 차트에 전달된 데이터 확인
  console.log("[RecentPercentCutChart] data:", data);
  console.log("[RecentPercentCutChart] myPercent:", myPercent);

  // 상위누백은 낮을수록 좋음 (상위 1% = 최상위)
  // 그래프에서는 반전하여 표시 (100 - 값)
  const transformedData = data.map((item) => ({
    year: item.year,
    cut50: item.cut50 !== null ? 100 - item.cut50 : null,
    cut70: item.cut70 !== null ? 100 - item.cut70 : null,
    originalCut50: item.cut50,
    originalCut70: item.cut70,
    myPercent: item.myPercent,
  }));

  const displayMyPercent = myPercent !== null ? 100 - myPercent : null;

  return (
    <ChartContainer
      config={chartConfig}
      className={cn("h-[400px] min-h-[300px] w-full", className)}
    >
      <BarChart
        data={transformedData}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid vertical={false} horizontal={true} z={1} />
        <Legend content={<CustomLegend myPercent={myPercent} />} verticalAlign="top" />
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
          type="number"
          axisLine={false}
          tickLine={false}
          interval={0}
          domain={[0, 100]}
          ticks={[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]}
          tick={(props) => <TickY {...props} />}
        />
        <ChartTooltip cursor={false} content={<CustomTooltip myPercent={myPercent} />} />

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

        {/* 내 누백 청색 가로선 */}
        {displayMyPercent !== null && (
          <ReferenceLine
            y={displayMyPercent}
            stroke="#3b82f6"
            strokeWidth={3}
            strokeDasharray="none"
          >
            <Label value="(내점수)" content={<LabelRender />} />
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
  // 반전된 값을 다시 원래 값으로 표시
  const percent = 100 - payload?.value ?? 0;
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
        {`${percent}%`}
      </text>
    </g>
  );
};

const CustomLegend = ({ myPercent }: { myPercent?: number | null }) => {
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
      {myPercent !== null && myPercent !== undefined && (
        <div className="flex items-center">
          <div className="mr-2 h-0.5 w-4 bg-[#3b82f6]"></div>
          <span className="text-xs font-semibold">내 누백</span>
        </div>
      )}
    </div>
  );
};

const CustomTooltip = ({ active, payload, label, myPercent }: { active?: boolean; payload?: Array<{ payload?: { originalCut50?: number | null; originalCut70?: number | null } }>; label?: string | number; myPercent?: number | null }) => {
  if (active && payload && payload.length) {
    const originalCut50 = payload[0]?.payload?.originalCut50;
    const originalCut70 = payload[0]?.payload?.originalCut70;

    return (
      <div className="rounded-lg border bg-background p-2 shadow-sm">
        <p className="text-sm font-medium">{`${label}년도`}</p>
        <p className="text-sm text-[#22c55e]">
          {`50%컷: ${originalCut50 !== null && originalCut50 !== undefined ? originalCut50.toFixed(2) + "%" : "N/A"}`}
        </p>
        <p className="text-sm text-[#f97316]">
          {`70%컷: ${originalCut70 !== null && originalCut70 !== undefined ? originalCut70.toFixed(2) + "%" : "N/A"}`}
        </p>
        {myPercent !== null && myPercent !== undefined && (
          <p className="text-sm text-[#3b82f6]">
            {`내 누백: ${myPercent.toFixed(2)}%`}
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
