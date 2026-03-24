import { cn } from "@/lib/utils";
import { reverseGrade } from "@/lib/utils/common/format";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Label,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface MyGradeUnivChartProps {
  myGrade: number;
}

export const MyGradeUnivChart = ({ myGrade }: MyGradeUnivChartProps) => {
  const preprocessed = [
    {
      name: "의치한약수서, 카포",
      grade: [1.0, 2.5],
    },
    {
      name: "연고서성한, 지유디",
      grade: [1.2, 3.5],
    },
    {
      name: "중경외시건동홍, 부산",
      grade: [1.8, 4.7],
    },
    {
      name: "국숭세광, 인아단가명에, 경북",
      grade: [2.0, 5.5],
    },
    {
      name: "서울하위, 경기중위, 지거국",
      grade: [3.0, 5.9],
    },
    {
      name: "경기하위, 지방국립하위",
      grade: [4.0, 6.9],
    },
    {
      name: "지방사립하위",
      grade: [5.0, 9],
    },
  ].map((item, index) => {
    const reversedGrade1 = reverseGrade(item.grade[1]);
    const reversedGrade0 = reverseGrade(item.grade[0]);
    return {
      ...item,
      index,
      range: [
        reversedGrade1 !== null ? Number(reversedGrade1.toFixed(2)) : null,
        reversedGrade0 !== null ? Number(reversedGrade0.toFixed(2)) : null,
      ],
      xLabelData: item.name,
    };
  });
  const barSize = 70;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={preprocessed}
        barCategoryGap="20px"
        barSize={barSize - 20}
        margin={{ right: 5, bottom: 5 }}
        className="cursor-pointer"
      >
        <XAxis
          tickLine={false}
          height={100}
          dataKey="xLabelData"
          tick={(props) => <TickX {...props} />}
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
        <CartesianGrid
          vertical={false}
          z={1}
          className="stroke-foreground/20"
        />
        <Tooltip
          cursor={{ fill: "transparent" }}
          content={({ payload }) => {
            const range = payload?.[0]?.payload?.range ?? [];
            const name = payload?.[0]?.payload?.name ?? "";

            const minGrade = reverseGrade(range[1] ?? 0);
            const maxGrade = reverseGrade(range[0] ?? 0);

            return (
              <div className="space-y-2 rounded-md bg-background px-4 py-4 text-foreground shadow-lg">
                <p>{name}</p>
                <p className="text-sm font-semibold text-primary">
                  등급컷{" "}
                  {minGrade !== null && maxGrade !== null
                    ? `${minGrade.toFixed(2)} ~ ${maxGrade.toFixed(2)}`
                    : "정보 없음"}
                </p>
              </div>
            );
          }}
        />
        <Legend
          verticalAlign="top"
          layout="horizontal"
          align="left"
          wrapperStyle={{
            paddingLeft: "10px",
            paddingBottom: "30px",
            fontSize: 14,
            fontWeight: 700,
          }}
        />
        <Bar
          dataKey="range"
          radius={[4, 4, 4, 4]}
          barSize={barSize}
          name="등급컷"
          fill={"hsl(var(--primary))"}
        />

        <defs>
          <filter x="-0.15" y="-0.1" width="1.3" height="1.1" id="solid">
            <feFlood floodColor="hsl(var(--primary))" />
            <feMerge>
              <feMergeNode in="bg" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <ReferenceLine
          y={reverseGrade(myGrade) ?? 0}
          stroke="hsl(var(--primary))"
          strokeWidth={2}
        >
          <Label
            value="내 등급"
            offset={6}
            position="insideTopLeft"
            fill="#ffffff"
            filter="url(#solid)"
            className="text-xs font-semibold"
          />
        </ReferenceLine>
      </BarChart>
    </ResponsiveContainer>
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
        {grade !== null ? `${grade.toFixed(2)}등급` : "N/A"}
      </text>
    </g>
  );
};

const TickX = ({ x, y, payload }: { x?: number; y?: number; payload?: { value: string | number } }) => {
  const splitedName: string[] = payload?.value?.split(",") || [""];
  const width = 110;

  return (
    <g transform={`translate(${x},${y})`}>
      <foreignObject
        className="node"
        x={-width / 2}
        y="0"
        width={width}
        height="100%"
      >
        <div
          className={cn(
            "flex flex-col items-center space-y-1 text-xs font-semibold text-foreground/60",
          )}
        >
          {splitedName.map((n) => (
            <p key={n}>{n}</p>
          ))}
        </div>
      </foreignObject>
    </g>
  );
};
