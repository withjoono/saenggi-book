import { cn } from "@/lib/utils";
import { reverseGrade } from "@/lib/utils/common/format";
import {
  ISusiKyokwaStep1Item,
  ISusiKyokwaStep1Response,
} from "@/stores/server/features/susi/kyokwa/interfaces";
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
  data: ISusiKyokwaStep1Response;
  onClickItem: (item: ISusiKyokwaStep1Item | string) => void;
  checkSelectedItem: (item: ISusiKyokwaStep1Item | string) => boolean;
}

// Tooltip 컴포넌트를 별도로 분리하여 렌더링 경고 방지
const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload || !payload.length) {
    return null;
  }

  const range = payload?.[0]?.payload?.range ?? [];
  const region = payload?.[0]?.payload?.university.region ?? "";
  const university_name = payload?.[0]?.payload?.university.name ?? "";
  const department = payload?.[0]?.payload?.general_type.name ?? "";

  const minGrade = reverseGrade(range[1] ?? 0);
  const maxGrade = reverseGrade(range[0] ?? 0);

  return (
    <div className="rounded-md bg-background px-4 py-4 text-foreground shadow-lg">
      <p>{`${region} - ${university_name} - ${department}`}</p>
      <p className="text-sm font-semibold text-primary">
        등급컷{" "}
        {minGrade !== null && maxGrade !== null
          ? `${minGrade.toFixed(2)} ~ ${maxGrade.toFixed(2)}`
          : "정보 없음"}
      </p>
      <p className="pt-1 text-xs">선택하려면 클릭해주세요.</p>
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
    const maxReversed = reverseGrade(item.max_cut);
    const minReversed = reverseGrade(item.min_cut);
    return {
      ...item,
      index,
      range:
        maxReversed !== null && minReversed !== null
          ? [maxReversed, minReversed]
          : [],
      xLabelData: `${item.university.region}\n${item.university.name}\n${item.name}\n${item.general_type.name}`,
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
      min < max &&
      max - min > 1e-3
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
        <Tooltip cursor={{ fill: "transparent" }} content={CustomTooltip} />
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
          name="등급컷"
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
        {/* 내 등급이 있을 때만 ReferenceLine 표시 */}
        {myGrade !== null && myGrade !== undefined && reverseGrade(myGrade) !== null && (
          <ReferenceLine
            y={reverseGrade(myGrade)}
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
  const [region, university_name, name, general_type_name] =
    payload.value.split("\n");
  const width = 110;
  const isSelected = checkSelectedItem(
    `${region}-${university_name}-${name}-${general_type_name}`
  );

  const handleClick = () => {
    onClickItem(`${region}-${university_name}-${name}-${general_type_name}`);
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
            isSelected ? "text-primary" : "text-foreground/60"
          )}
        >
          <p>
            {university_name}({region})
          </p>
          <p>{name}</p>
          <p>{general_type_name}</p>
        </div>
      </foreignObject>
    </g>
  );
};
