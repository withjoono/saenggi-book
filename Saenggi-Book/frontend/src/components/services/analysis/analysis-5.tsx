import React, { useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ISchoolRecordSelectSubject } from "@/stores/server/features/me/interfaces";
import { cn } from "@/lib/utils";

interface PerformanceAnalysis5Props {
  selectSubjects: ISchoolRecordSelectSubject[];
  className?: string;
}

const SUBJECT_CODES = {
  KOREAN: "HH1",
  MATH: "HH2",
  ENGLISH: "HH3",
  SOCIETY: "HH4",
  SCIENCE: "HH5",
};

const SUBJECT_NAMES = {
  HH1: "국어",
  HH2: "수학",
  HH3: "영어",
  HH4: "사회",
  HH5: "과학",
};

export const PerformanceAnalysis5: React.FC<PerformanceAnalysis5Props> = ({
  selectSubjects,
  className,
}) => {
  const achievementData = useMemo(() => {
    const data: { [key: string]: { A: number; B: number; C: number } } = {};

    // Initialize data for all subject codes
    Object.values(SUBJECT_CODES).forEach((code) => {
      data[code] = { A: 0, B: 0, C: 0 };
    });

    selectSubjects.forEach((subject) => {
      if (subject.mainSubjectCode && subject.achievement) {
        const achievement = subject.achievement.toUpperCase();
        if (
          ["A", "B", "C"].includes(achievement) &&
          data[subject.mainSubjectCode]
        ) {
          data[subject.mainSubjectCode][achievement as "A" | "B" | "C"]++;
        }
      }
    });

    return data;
  }, [selectSubjects]);

  const totals = useMemo(() => {
    return Object.values(achievementData).reduce(
      (acc, curr) => ({
        A: acc.A + curr.A,
        B: acc.B + curr.B,
        C: acc.C + curr.C,
      }),
      { A: 0, B: 0, C: 0 },
    );
  }, [achievementData]);

  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <CardTitle>5. (진로선택) 교과별 성취도</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>구분</TableHead>
              {Object.values(SUBJECT_CODES).map((code) => (
                <TableHead key={code}>
                  {SUBJECT_NAMES[code as keyof typeof SUBJECT_NAMES]}
                </TableHead>
              ))}
              <TableHead>합계</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {["A", "B", "C"].map((grade) => (
              <TableRow key={grade}>
                <TableCell>{grade}</TableCell>
                {Object.values(SUBJECT_CODES).map((code) => (
                  <TableCell key={code}>
                    {achievementData[code]?.[grade as "A" | "B" | "C"] || 0}
                  </TableCell>
                ))}
                <TableCell>{totals[grade as "A" | "B" | "C"]}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
