import { Bar, BarChart, CartesianGrid, Legend, XAxis, YAxis } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/custom/chart";
import { cn } from "@/lib/utils";
import { IRecruitmentUnitPassFailRecord } from "@/stores/server/features/susi/pass-record/interfaces";

interface PassRecordChartProps {
  data: IRecruitmentUnitPassFailRecord[];
  className?: string;
}

const chartConfig = {
  pass: {
    label: "합격",
    color: "#16a34a",
  },
  fail: {
    label: "불합격",
    color: "#dc2626",
  },
} satisfies ChartConfig;

export const PassRecordChart = ({ data, className }: PassRecordChartProps) => {
  const { categories: processedData, maxCount } = processData(data);

  return (
    <ChartContainer
      config={chartConfig}
      className={cn("h-[400px] min-h-[300px] w-full", className)}
    >
      <BarChart
        data={processedData}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <Legend content={<CustomLegend />} verticalAlign="top" />
        <CartesianGrid vertical={false} horizontal={true} z={1} />
        <XAxis
          dataKey="range"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          tickFormatter={(value) => value}
        />
        <YAxis
          type="number"
          domain={[0, Math.max(4, maxCount)]}
          axisLine={false}
          tickLine={false}
          tick={(props) => <TickY {...props} />}
        />
        <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
        <Bar dataKey="pass" stackId="a" fill="var(--color-pass)" />
        <Bar dataKey="fail" stackId="a" fill="var(--color-fail)" />
      </BarChart>
    </ChartContainer>
  );
};

const TickY = ({ x, y, payload }: { x?: number; y?: number; payload?: { value: number } }) => (
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
      {payload?.value ?? 0}
    </text>
  </g>
);

const CustomLegend = () => {
  return (
    <div className="flex items-center space-x-4 px-4 py-2 pb-4">
      <div className="flex items-center">
        <div className="mr-2 h-3 w-3 bg-green-600"></div>
        <span className="text-xs font-semibold">합격</span>
      </div>
      <div className="flex items-center">
        <div className="mr-2 h-3 w-3 bg-red-600"></div>
        <span className="text-xs font-semibold">불합격</span>
      </div>
    </div>
  );
};

const processData = (data: IRecruitmentUnitPassFailRecord[]) => {
  const categories = [
    { range: "1.0-1.5", pass: 0, fail: 0 },
    { range: "1.5-2.0", pass: 0, fail: 0 },
    { range: "2.0-2.5", pass: 0, fail: 0 },
    { range: "2.5-3.0", pass: 0, fail: 0 },
    { range: "3.0-3.5", pass: 0, fail: 0 },
    { range: "3.5-4.0", pass: 0, fail: 0 },
    { range: "4.0-4.5", pass: 0, fail: 0 },
    { range: "4.5-5.0", pass: 0, fail: 0 },
    { range: "5.0-5.5", pass: 0, fail: 0 },
    { range: "5.5-6.0", pass: 0, fail: 0 },
    { range: "6.0-6.5", pass: 0, fail: 0 },
    { range: "6.5-7.0", pass: 0, fail: 0 },
    { range: "7.0-7.5", pass: 0, fail: 0 },
    { range: "7.5-8.0", pass: 0, fail: 0 },
  ];

  data.forEach((item) => {
    const rankingAll = parseFloat(item.avg_grade_all || "0");
    const isPass = item.final_result === "합";

    for (const category of categories) {
      const [min, max] = category.range.split("-").map(parseFloat);
      if (rankingAll >= min && rankingAll < max) {
        if (isPass) {
          category.pass += 1;
        } else {
          category.fail += 1;
        }
        break;
      }
    }
  });

  const maxCount = Math.max(...categories.map((c) => c.pass + c.fail));

  return { categories, maxCount };
};
