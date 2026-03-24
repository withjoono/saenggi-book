import { cn } from "@/lib/utils";
import { reverseGrade } from "@/lib/utils/common/format";
import {
  IExploreSusiKyokwaStep1Item,
  IExploreSusiKyokwaStep1Response,
} from "@/stores/server/features/explore/susi-kyokwa/interfaces";
import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Label,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface Step1Props {
  myGrade?: number | null;
  data: IExploreSusiKyokwaStep1Response;
  onClickItem: (item: IExploreSusiKyokwaStep1Item | string) => void;
  checkSelectedItem: (item: IExploreSusiKyokwaStep1Item | string) => boolean;
}

// Tooltip 컴포넌트를 별도로 분리하여 렌더링 경고 방지
const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload || !payload.length) {
    return null;
  }

  const minCut = payload?.[0]?.payload?.minCut ?? null;
  const maxCut = payload?.[0]?.payload?.maxCut ?? null;
  const region = payload?.[0]?.payload?.university?.region ?? "";
  const university_name = payload?.[0]?.payload?.university?.name ?? "";
  const department = payload?.[0]?.payload?.generalType?.name ?? "";
  const admissionName = payload?.[0]?.payload?.name ?? "";

  const formatRange = () => {
    if (minCut === null || maxCut === null) return "정보 없음";
    if (minCut === maxCut) return `${Number(minCut).toFixed(2)}등급`;
    return `${Number(minCut).toFixed(2)} ~ ${Number(maxCut).toFixed(2)}등급`;
  };

  return (
    <div className="rounded-md bg-background px-4 py-4 text-foreground shadow-lg">
      <p className="font-medium">{`${university_name}(${region})`}</p>
      <p className="text-sm text-foreground/70">{`${admissionName} - ${department}`}</p>
      <p className="text-sm font-semibold text-primary mt-1">
        {formatRange()}
      </p>
      <p className="pt-1 text-xs text-foreground/60">선택하려면 클릭해주세요.</p>
    </div>
  );
};

export const Step1Chart = ({
  myGrade,
  data,
  onClickItem,
  checkSelectedItem,
}: Step1Props) => {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  const mapped = data.items.map((item, index) => {
    // minCut과 maxCut을 사용하여 최초컷 범위 표시
    const minCutReversed = reverseGrade(item.minCut);
    const maxCutReversed = reverseGrade(item.maxCut);

    // minCut과 maxCut 범위로 바 표시 (reversed이므로 min/max가 뒤바뀜)
    const range = minCutReversed !== null && maxCutReversed !== null
      ? [Math.min(minCutReversed, maxCutReversed), Math.max(minCutReversed, maxCutReversed)]
      : [];

    return {
      ...item,
      index,
      range,
      xLabelData: `${item.university.region}\n${item.university.name}\n${item.name}`,
    };
  });

  const preprocessed = mapped.filter((item) => {
    if (item.range.length !== 2) return false;
    const [min, max] = item.range;
    return (
      min <= 9 &&
      min >= 1 &&
      max <= 9 &&
      max >= 1 &&
      min <= max
    );
  });

  const barSize = 120;

  return (
    <ResponsiveContainer
      width={Math.max(1188, barSize * preprocessed.length)}
      height="100%"
    >
      <BarChart
        data={preprocessed}
        onClick={({ activePayload }) => {
          if (
            activePayload &&
            activePayload.length > 0 &&
            activePayload[0].payload.university.name
          ) {
            onClickItem(activePayload[0].payload);
          }
        }}
        className="cursor-pointer"
      >
        <XAxis
          tickLine={false}
          height={100}
          dataKey="xLabelData"
          tick={(props) => (
            <TickX
              {...props}
              checkSelectedItem={checkSelectedItem}
              onClickItem={onClickItem}
            />
          )}
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
          content={CustomTooltip}
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
          barSize={barSize - 50}
          name=""
          onMouseMove={(data: any) => {
            if (data && data.index !== undefined) {
              setHoverIdx(data.index);
            }
          }}
          onMouseLeave={() => {
            setHoverIdx(null);
          }}
        >
          {preprocessed.map((entry) => (
            <Cell
              key={`cell-${entry.index}`}
              fill={
                entry.index === hoverIdx || checkSelectedItem(entry)
                  ? "hsl(var(--primary))"
                  : ""
              }
            />
          ))}
        </Bar>

        <defs>
          <filter x="-0.15" y="-0.1" width="1.3" height="1.1" id="solid">
            <feFlood floodColor="hsl(var(--primary))" />
            <feMerge>
              <feMergeNode in="bg" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {myGrade !== null && myGrade !== undefined && (
          <ReferenceLine
            y={reverseGrade(myGrade) ?? undefined}
            stroke="hsl(var(--primary))"
            strokeWidth={3}
            strokeDasharray="5 5"
          >
            <Label
              value={`내 등급: ${myGrade.toFixed(2)}`}
              offset={10}
              position="insideTopLeft"
              fill="#ffffff"
              filter="url(#solid)"
              className="text-xs font-semibold"
            />
          </ReferenceLine>
        )}
      </BarChart>
    </ResponsiveContainer>
  );
};

const TickY = ({ x, y, payload }: any) => {
  const grade = reverseGrade(payload.value ?? 0);
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

const TickX = ({ x, y, payload, checkSelectedItem, onClickItem }: any) => {
  const [region, university_name, name] =
    payload.value.split("\n");
  const width = 110;
  const isSelected = checkSelectedItem(
    `${region}-${university_name}-${name}`,
  );

  const handleClick = () => {
    onClickItem(`${region}-${university_name}-${name}`);
  };

  return (
    <g transform={`translate(${x},${y})`} onClick={handleClick}>
      <foreignObject
        className="node"
        x={-width / 2}
        y="0"
        width={width}
        height="100%"
      >
        <div
          className={cn(
            "flex cursor-pointer flex-col items-center space-y-1 text-xs font-semibold text-foreground/60 hover:text-primary",
            isSelected ? "text-primary" : "text-foreground/60",
          )}
        >
          <p>
            {university_name}({region})
          </p>
          <p>{name}</p>
        </div>
      </foreignObject>
    </g>
  );
};
