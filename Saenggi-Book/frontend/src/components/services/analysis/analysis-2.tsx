import React, { useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ISchoolRecordSubject } from "@/stores/server/features/me/interfaces";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const SUBJECT_CODES = {
  KOREAN: "HH1",
  MATH: "HH2",
  ENGLISH: "HH3",
  SOCIETY: "HH4",
  SCIENCE: "HH5",
};

interface PerformanceAnalysis2Props {
  subjects: ISchoolRecordSubject[];
  className?: string;
}

interface GradeData {
  [key: string]: {
    [key: string]: { grades: number[]; units: number[] };
  };
}

const calculateAverage = (grades: number[], units: number[]): string => {
  if (grades.length === 0 || units.length === 0) return "-";
  const totalWeightedGrade = grades.reduce(
    (acc, grade, index) => acc + grade * units[index],
    0,
  );
  const totalUnits = units.reduce((acc, unit) => acc + unit, 0);
  return (totalWeightedGrade / totalUnits).toFixed(2);
};

export const PerformanceAnalysis2: React.FC<PerformanceAnalysis2Props> = ({
  subjects,
  className,
}) => {
  const gradeData = useMemo(() => {
    if (!subjects || subjects.length === 0) return null;

    const data: GradeData = {
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
          Object.values(SUBJECT_CODES).includes(subject.mainSubjectCode)
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

  const averages = useMemo(() => {
    if (!gradeData) return null;

    const avgData: { [key: string]: string } = {};
    Object.entries(gradeData).forEach(([key, semesterData]) => {
      const allGrades = Object.values(semesterData).flatMap(
        (data) => data.grades,
      );
      const allUnits = Object.values(semesterData).flatMap(
        (data) => data.units,
      );
      avgData[key] = calculateAverage(allGrades, allUnits);
    });
    return avgData;
  }, [gradeData]);

  const totalAverages = useMemo(() => {
    if (!gradeData) return null;

    const totals: { [key: string]: { grades: number[]; units: number[] } } = {
      [SUBJECT_CODES.KOREAN]: { grades: [], units: [] },
      [SUBJECT_CODES.MATH]: { grades: [], units: [] },
      [SUBJECT_CODES.ENGLISH]: { grades: [], units: [] },
      [SUBJECT_CODES.SOCIETY]: { grades: [], units: [] },
      [SUBJECT_CODES.SCIENCE]: { grades: [], units: [] },
    };

    Object.values(gradeData).forEach((semesterData) => {
      Object.entries(semesterData).forEach(([subject, data]) => {
        if (totals[subject]) {
          totals[subject].grades.push(...data.grades);
          totals[subject].units.push(...data.units);
        }
      });
    });

    const avgTotals: { [key: string]: string } = {};
    Object.entries(totals).forEach(([subject, data]) => {
      avgTotals[subject] = calculateAverage(data.grades, data.units);
    });

    return avgTotals;
  }, [gradeData]);

  const overallAverage = useMemo(() => {
    if (!gradeData) return "-";

    const allGrades: number[] = [];
    const allUnits: number[] = [];

    Object.values(gradeData).forEach((semesterData) => {
      Object.values(semesterData).forEach((subjectData) => {
        allGrades.push(...subjectData.grades);
        allUnits.push(...subjectData.units);
      });
    });

    return calculateAverage(allGrades, allUnits);
  }, [gradeData]);

  if (!gradeData || !averages || !totalAverages) return null;

  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <CardTitle>2. (공통/일반) 교과별 성적</CardTitle>
      </CardHeader>
      <CardContent>
        <Table className="w-full">
          <TableHeader>
            <TableRow>
              <TableHead className="text-center" colSpan={2}>
                구분
              </TableHead>
              <TableHead>국어</TableHead>
              <TableHead>수학</TableHead>
              <TableHead>영어</TableHead>
              <TableHead>사회</TableHead>
              <TableHead>과학</TableHead>
              <TableHead>평균</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {["1", "2", "3"].map((grade) => (
              <React.Fragment key={grade}>
                <TableRow>
                  <TableCell rowSpan={2}>{grade}학년</TableCell>
                  <TableCell>1학기</TableCell>
                  {Object.values(SUBJECT_CODES).map((code) => (
                    <TableCell key={code}>
                      {gradeData[`${grade}-1`][code]
                        ? calculateAverage(
                            gradeData[`${grade}-1`][code].grades,
                            gradeData[`${grade}-1`][code].units,
                          )
                        : "-"}
                    </TableCell>
                  ))}
                  <TableCell>{averages[`${grade}-1`] || "-"}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>2학기</TableCell>
                  {Object.values(SUBJECT_CODES).map((code) => (
                    <TableCell key={code}>
                      {gradeData[`${grade}-2`][code]
                        ? calculateAverage(
                            gradeData[`${grade}-2`][code].grades,
                            gradeData[`${grade}-2`][code].units,
                          )
                        : "-"}
                    </TableCell>
                  ))}
                  <TableCell>{averages[`${grade}-2`] || "-"}</TableCell>
                </TableRow>
              </React.Fragment>
            ))}
            <TableRow>
              <TableCell colSpan={2}>평균</TableCell>
              {Object.values(SUBJECT_CODES).map((code) => (
                <TableCell key={code}>{totalAverages[code]}</TableCell>
              ))}
              <TableCell>{overallAverage}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
