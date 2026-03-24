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
import { ISchoolRecordSelectSubject } from "@/stores/server/features/me/interfaces";
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

interface PerformanceAnalysis6Props {
  selectSubjects: ISchoolRecordSelectSubject[];
}

export const PerformanceAnalysis6: React.FC<PerformanceAnalysis6Props> = ({
  selectSubjects,
}) => {
  const [selectedSubject, setSelectedSubject] = useState(
    SUBJECT_CODES.ALL.code,
  );

  const achievementData = useMemo(() => {
    const data: { [key: string]: { A: number; B: number; C: number } } = {
      ALL: { A: 0, B: 0, C: 0 },
      HH1: { A: 0, B: 0, C: 0 },
      HH2: { A: 0, B: 0, C: 0 },
      HH3: { A: 0, B: 0, C: 0 },
      HH4: { A: 0, B: 0, C: 0 },
      HH5: { A: 0, B: 0, C: 0 },
    };

    selectSubjects.forEach((subject) => {
      if (subject.mainSubjectCode && subject.achievement) {
        const achievement = subject.achievement.toUpperCase();
        if (["A", "B", "C"].includes(achievement)) {
          if (data[subject.mainSubjectCode]) {
            data[subject.mainSubjectCode][achievement as "A" | "B" | "C"]++;
            data.ALL[achievement as "A" | "B" | "C"]++;
          }
        }
      }
    });

    return data;
  }, [selectSubjects]);

  const chartData = useMemo(() => {
    const subjectData = achievementData[selectedSubject];
    return [
      { achievement: "A", count: subjectData.A },
      { achievement: "B", count: subjectData.B },
      { achievement: "C", count: subjectData.C },
    ];
  }, [achievementData, selectedSubject]);

  const chartConfig = {
    count: {
      label: "성취도 개수",
      color: SUBJECT_COLORS[selectedSubject as keyof typeof SUBJECT_COLORS],
    },
  } satisfies ChartConfig;

  const CustomTooltip: React.FC<{
    active?: boolean;
    payload?: Array<{
      payload: {
        achievement: string;
        count: number;
      };
    }>;
  }> = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="rounded-lg bg-background p-2 shadow-md">
          <p className="font-semibold">성취도 {data.achievement}</p>
          <p>{`개수: ${data.count}`}</p>
        </div>
      );
    }
    return null;
  };

  const maxCount = Math.max(...chartData.map((d) => d.count));
  const yAxisMax = Math.max(5, Math.ceil(maxCount * 1.1));

  return (
    <Card>
      <CardHeader>
        <CardTitle>6. 과목별 성취도 개수</CardTitle>
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
              right: 60,
              left: 60,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="achievement" padding={{ left: 50, right: 50 }} />
            <YAxis domain={[0, yAxisMax]} allowDecimals={false} />
            <ChartTooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="count"
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
                dataKey="count"
                position="top"
                offset={15}
                className="fill-foreground"
                fontSize={12}
                formatter={(value: number) => `${value}개`}
              />
            </Line>
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};
