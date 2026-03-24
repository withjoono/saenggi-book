import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useMemo } from "react";
import { IExploreSusiJonghapStep2ItemWithMyScores } from "./data-table";
import { cn } from "@/lib/utils";
import { getUnivLevelByCode } from "@/lib/utils/services/university";

interface Step2Props {
  data: IExploreSusiJonghapStep2ItemWithMyScores[];
}

export const Step2Chart = ({ data }: Step2Props) => {
  const preprocessed = useMemo(() => {
    return data.map((item, index) => {
      const universityLevel = getUnivLevelByCode(
        item.university.code || "",
        item.generalField.name || "",
      );
      return {
        ...item,
        value: item.myScores.totalScore,
        universityLevelScore:
          universityLevel === 0
            ? 0
            : Math.max(((7 - universityLevel) / 7) * 100, 5),
        index,
        xLabelData: `${item.university.region}\n${item.university.name}\n${item.admission.name}\n${item.name}`,
      };
    });
  }, [data]);

  const barSize = 120;

  return (
    <ResponsiveContainer
      width={Math.max(1188, barSize * preprocessed.length)}
      height="100%"
    >
      <BarChart
        data={preprocessed}
        barCategoryGap="20px"
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
          type="number"
          domain={[0, 100]}
          ticks={[0, 14.28, 28.57, 42.85, 57.14, 71.42, 85.71, 100]}
          axisLine={false}
          tickLine={false}
          tick={(props) => <TickY {...props} />}
        />
        <CartesianGrid
          vertical={false}
          horizontal={true}
          z={1}
          className="stroke-foreground/20"
        />

        <Tooltip
          cursor={{ fill: "transparent" }}
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              const value = payload[0].payload.value;
              const universityLevelScore =
                payload[0].payload.universityLevelScore;
              const university_name = payload[0].payload.university.name;
              const university_region = payload[0].payload.university.region;
              const admission_name = payload[0].payload.admission.name;
              const recruitment_unit_name = payload[0].payload.name;

              return (
                <div className="rounded-md bg-background px-4 py-4 text-foreground shadow-lg">
                  <p>{`${university_name}(${university_region})`}</p>
                  <p className="text-sm">{`${admission_name}`}</p>
                  <p className="text-sm">{`${recruitment_unit_name}`}</p>
                  <p className="text-sm font-semibold text-primary">
                    내 비교과 점수: {value.toFixed(2)}
                  </p>
                  <p className="text-sm font-semibold text-blue-500">
                    권장 점수: {universityLevelScore.toFixed(2)}
                  </p>
                </div>
              );
            }
            return null;
          }}
        />
        <Legend content={<CustomLegend />} verticalAlign="top" />

        <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={barSize - 50}>
          {preprocessed.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={
                entry.value >= entry.universityLevelScore
                  ? "hsl(var(--primary))"
                  : "#e11d48"
              }
            />
          ))}
        </Bar>
        <Bar
          dataKey="universityLevelScore"
          radius={[4, 4, 0, 0]}
          barSize={barSize - 50}
          fill={"#2196f3"}
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
      </BarChart>
    </ResponsiveContainer>
  );
};

const TickY = ({ x, y, payload }: any) => {
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
        {getGrade(payload.value)}
      </text>
    </g>
  );
};

const TickX = ({ x, y, payload }: any) => {
  const [
    university_region,
    university_name,
    admission_name,
    recruitment_unit_name,
  ] = payload.value.split("\n");
  const width = 140;

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
          <p>
            {university_name}({university_region})
          </p>
          <p>{admission_name}</p>
          <p>{recruitment_unit_name}</p>
        </div>
      </foreignObject>
    </g>
  );
};

const CustomLegend = () => {
  return (
    <div className="flex items-center space-x-4 px-4 py-2">
      <div className="flex items-center">
        <div className="mr-2 h-3 w-3 bg-[hsl(var(--primary))]"></div>
        <span className="text-xs font-semibold">내 비교과 점수(안정)</span>
      </div>
      <div className="flex items-center">
        <div className="mr-2 h-3 w-3 bg-[#e11d48]"></div>
        <span className="text-xs font-semibold">내 비교과 점수(미달)</span>
      </div>
      <div className="flex items-center">
        <div className="mr-2 h-3 w-3 bg-[#2196f3]"></div>
        <span className="text-xs font-semibold">권장 점수</span>
      </div>
    </div>
  );
};
