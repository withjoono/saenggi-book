import React, { useMemo, useState } from "react";
import {
  CartesianGrid,
  LabelList,
  Line,
  LineChart,
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
import { Button } from "@/components/custom/button";

const SUBJECT_CODES = {
  ALL: { code: "ALL", name: "전과목" },
  KOREAN: { code: "HH1", name: "국어" },
  MATH: { code: "HH2", name: "수학" },
  ENGLISH: { code: "HH3", name: "영어" },
  SOCIETY: { code: "HH4", name: "사회" },
  SCIENCE: { code: "HH5", name: "과학" },
};

const SUBJECT_COLORS = {
  ALL: "#6B7280",
  HH1: "#FF6B6B",
  HH2: "#4ECDC4",
  HH3: "#45B7D1",
  HH4: "#FFA07A",
  HH5: "#98D8C8",
};

interface PerformanceAnalysis4Props {
  subjects: ISchoolRecordSubject[];
  className?: string;
}

const calculateWeightedAverage = (
  grades: number[],
  units: number[],
): number | null => {
  if (grades.length === 0 || units.length === 0) return null;
  const totalWeightedGrade = grades.reduce(
    (acc, grade, index) => acc + grade * units[index],
    0,
  );
  const totalUnits = units.reduce((acc, unit) => acc + unit, 0);
  return parseFloat((totalWeightedGrade / totalUnits).toFixed(2));
};

export const PerformanceAnalysis4: React.FC<PerformanceAnalysis4Props> = ({
  subjects,
  className,
}) => {
  const [selectedSubject, setSelectedSubject] = useState(
    SUBJECT_CODES.ALL.code,
  );

  const gradeData = useMemo(() => {
    if (!subjects || subjects.length === 0) return null;

    const data: {
      [key: string]: { [key: string]: { grades: number[]; units: number[] } };
    } = {
      "1-1": {},
      "1-2": {},
      "2-1": {},
      "2-2": {},
      "3-1": {},
      "3-2": {},
    };

    subjects.forEach((subject) => {
      if (
        subject.grade &&
        subject.semester &&
        subject.mainSubjectCode &&
        subject.ranking &&
        subject.unit
      ) {
        const key = `${subject.grade}-${subject.semester}`;
        if (
          data[key] &&
          Object.values(SUBJECT_CODES)
            .map((n) => n.code)
            .includes(subject.mainSubjectCode)
        ) {
          if (!data[key][subject.mainSubjectCode]) {
            data[key][subject.mainSubjectCode] = { grades: [], units: [] };
          }
          data[key][subject.mainSubjectCode].grades.push(
            parseFloat(subject.ranking),
          );
          data[key][subject.mainSubjectCode].units.push(
            parseFloat(subject.unit),
          );
        }
      }
    });

    return data;
  }, [subjects]);

  const chartData = useMemo(() => {
    if (!gradeData) return [];

    return ["1", "2", "3"]
      .map((grade) => {
        let semester1, semester2;

        if (selectedSubject === SUBJECT_CODES.ALL.code) {
          const allGrades1 = Object.values(gradeData[`${grade}-1`]).flatMap(
            (data) => data.grades,
          );
          const allUnits1 = Object.values(gradeData[`${grade}-1`]).flatMap(
            (data) => data.units,
          );
          semester1 = calculateWeightedAverage(allGrades1, allUnits1);

          const allGrades2 = Object.values(gradeData[`${grade}-2`]).flatMap(
            (data) => data.grades,
          );
          const allUnits2 = Object.values(gradeData[`${grade}-2`]).flatMap(
            (data) => data.units,
          );
          semester2 = calculateWeightedAverage(allGrades2, allUnits2);
        } else {
          const subjectData1 = gradeData[`${grade}-1`][selectedSubject];
          semester1 = subjectData1
            ? calculateWeightedAverage(subjectData1.grades, subjectData1.units)
            : null;

          const subjectData2 = gradeData[`${grade}-2`][selectedSubject];
          semester2 = subjectData2
            ? calculateWeightedAverage(subjectData2.grades, subjectData2.units)
            : null;
        }

        let average;
        if (semester1 !== null && semester2 !== null) {
          average = (semester1 + semester2) / 2;
        } else if (semester1 !== null) {
          average = semester1;
        } else if (semester2 !== null) {
          average = semester2;
        } else {
          average = null;
        }

        return {
          grade: `${grade}학년`,
          average: average !== null ? Number(average.toFixed(2)) : null,
        };
      })
      .filter((data) => data.average !== null);
  }, [gradeData, selectedSubject]);

  const chartConfig = {
    average: {
      label: "평균 등급",
      color: SUBJECT_COLORS[selectedSubject as keyof typeof SUBJECT_COLORS],
    },
  } satisfies ChartConfig;

  const CustomTooltip: React.FC<{
    active?: boolean;
    payload?: Array<{
      payload: {
        grade: string;
        average: number | null;
      };
    }>;
  }> = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="rounded-lg bg-background p-2 shadow-md">
          <p className="font-semibold">{data.grade}</p>
          <p>{`평균 등급: ${data.average?.toFixed(2)}등급`}</p>
        </div>
      );
    }
    return null;
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
          {payload?.value.toFixed(2)}등급
        </text>
      </g>
    );
  };

  if (!gradeData) return null;

  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <CardTitle>4. 학년별 교과 성적 추이</CardTitle>
        <div className="flex flex-wrap gap-2 pt-4">
          {Object.entries(SUBJECT_CODES).map(([code, item]) => (
            <Button
              key={code}
              variant={selectedSubject === item.code ? "default" : "outline"}
              onClick={() => setSelectedSubject(item.code)}
            >
              {item.name}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={chartConfig}
          className={cn("h-[350px] min-h-[300px] w-full")}
        >
          <LineChart
            data={chartData}
            margin={{
              top: 30,
              right: 50,
              left: 50,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="grade" padding={{ left: 30, right: 30 }} />
            <YAxis
              reversed
              domain={[1, 9]}
              ticks={[1, 2, 3, 4, 5, 6, 7, 8, 9]}
              tick={<TickY />}
            />
            <ChartTooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="average"
              stroke={
                SUBJECT_COLORS[selectedSubject as keyof typeof SUBJECT_COLORS]
              }
              strokeWidth={2}
              dot={{
                fill: SUBJECT_COLORS[
                  selectedSubject as keyof typeof SUBJECT_COLORS
                ],
                r: 4,
              }}
              activeDot={{
                r: 6,
              }}
            >
              <LabelList
                dataKey="average"
                position="top"
                offset={15}
                className="fill-foreground"
                fontSize={12}
                formatter={(value: number) => `${value.toFixed(2)}등급`}
              />
            </Line>
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};
