import React, { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
} from "@/components/custom/chart";
import { ISchoolRecordSubject } from "@/stores/server/features/me/interfaces";
import { cn } from "@/lib/utils";

const SUBJECT_CODES = {
  KOREAN: "HH1",
  MATH: "HH2",
  ENGLISH: "HH3",
  SOCIETY: "HH4",
  SCIENCE: "HH5",
};

const SUBJECT_NAMES = {
  KOREAN: "국어",
  MATH: "수학",
  ENGLISH: "영어",
  SOCIETY: "사회",
  SCIENCE: "과학",
};

const SUBJECT_COLORS = {
  KOREAN: "#FF6B6B",
  MATH: "#4ECDC4",
  ENGLISH: "#45B7D1",
  SOCIETY: "#FFA07A",
  SCIENCE: "#98D8C8",
};

const calculateAverageRanking = (
  subjects: ISchoolRecordSubject[],
  subjectCode: string,
): number => {
  const relevantSubjects = subjects.filter(
    (subject) =>
      subject.mainSubjectCode === subjectCode &&
      subject.ranking &&
      subject.unit,
  );

  if (relevantSubjects.length === 0) return 0;

  const totalWeightedGrade = relevantSubjects.reduce((acc, subject) => {
    return acc + parseFloat(subject.ranking!) * parseFloat(subject.unit!);
  }, 0);

  const totalUnits = relevantSubjects.reduce((acc, subject) => {
    return acc + parseFloat(subject.unit!);
  }, 0);

  return parseFloat((totalWeightedGrade / totalUnits).toFixed(2));
};

function reverseGrade(grade?: number | string | null): number | null {
  if (grade === undefined || grade === null) return null;

  const numericGrade = Number(grade);

  if (isNaN(numericGrade) || numericGrade < 1 || numericGrade > 9) {
    return null;
  }

  const roundedGrade = Math.round(numericGrade * 100) / 100;
  return Number((10 - roundedGrade).toFixed(2));
}

interface PerformanceAnalysis3Props {
  subjects: ISchoolRecordSubject[];
}

export const PerformanceAnalysis3: React.FC<PerformanceAnalysis3Props> = ({
  subjects,
}) => {
  const averages = useMemo(() => {
    if (!subjects || subjects.length === 0) return null;

    return Object.entries(SUBJECT_CODES).map(([subjectKey, subjectCode]) => {
      const avgGrade = calculateAverageRanking(subjects, subjectCode);
      const reversedGrade = reverseGrade(avgGrade) || 0;
      return {
        subject: SUBJECT_NAMES[subjectKey as keyof typeof SUBJECT_NAMES],
        average: avgGrade,
        reversedGrade: reversedGrade,
        fill: SUBJECT_COLORS[subjectKey as keyof typeof SUBJECT_COLORS],
      };
    });
  }, [subjects]);

  const chartConfig = {
    average: {
      label: "평균 등급",
      color: "hsl(var(--chart-1))",
    },
  } satisfies ChartConfig;

  const CustomTooltip: React.FC<{
    active?: boolean;
    payload?: Array<{
      payload: {
        subject: string;
        average: number;
        reversedGrade: number;
        fill: string;
      };
    }>;
  }> = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="rounded-lg bg-background p-2 shadow-md">
          <p className="font-semibold">{data.subject}</p>
          <p>{`평균 등급: ${data.average.toFixed(2)}등급`}</p>
        </div>
      );
    }
    return null;
  };

  if (!averages) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>3. 교과별 평균 등급</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={chartConfig}
          className={cn("h-[350px] min-h-[300px] w-full")}
        >
          <BarChart
            data={averages}
            width={600}
            height={400}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="subject" />
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
            <Bar dataKey="reversedGrade" maxBarSize={60} radius={[4, 4, 4, 4]}>
              {averages.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
              <LabelList
                dataKey="average"
                position="top"
                className="fill-foreground"
                fontSize={12}
                formatter={(value: number) => `${value.toFixed(2)}등급`}
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

const TickY = ({
  x,
  y,
  payload,
}: {
  x?: number;
  y?: number;
  payload?: { value: number };
}) => {
  const grade = reverseGrade(payload?.value);
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
