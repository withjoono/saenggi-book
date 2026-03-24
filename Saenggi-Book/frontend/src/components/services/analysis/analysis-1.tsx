import React, { useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ISchoolRecordSubject } from "@/stores/server/features/me/interfaces";
import { cn } from "@/lib/utils";

const SUBJECT_CODES = {
  KOREAN: "HH1",
  MATH: "HH2",
  SOCIETY: "HH4",
  SCIENCE: "HH5",
  ENGLISH: "HH3",
};

const calculateAverageRanking = (
  subjects: ISchoolRecordSubject[],
  subjectCodes: string[],
): string => {
  let totalWeightedGrade = 0;
  let totalUnits = 0;

  subjects.forEach((subject) => {
    if (
      subject.mainSubjectCode &&
      subject.ranking &&
      subject.unit &&
      subjectCodes.includes(subject.mainSubjectCode)
    ) {
      const grade = parseFloat(subject.ranking);
      const units = parseFloat(subject.unit);
      if (!isNaN(grade) && !isNaN(units)) {
        totalWeightedGrade += grade * units;
        totalUnits += units;
      }
    }
  });

  if (totalUnits === 0) return "0.00";

  return (totalWeightedGrade / totalUnits).toFixed(2);
};

interface PerformanceAnalysis1Props {
  subjects: ISchoolRecordSubject[];
  className?: string;
}

export const PerformanceAnalysis1: React.FC<PerformanceAnalysis1Props> = ({
  subjects,
  className,
}) => {
  const averages = useMemo(() => {
    if (!subjects || subjects.length === 0) return null;

    return {
      all: calculateAverageRanking(subjects, Object.values(SUBJECT_CODES)),
      main5: calculateAverageRanking(subjects, Object.values(SUBJECT_CODES)),
      main4Society: calculateAverageRanking(subjects, [
        SUBJECT_CODES.KOREAN,
        SUBJECT_CODES.MATH,
        SUBJECT_CODES.ENGLISH,
        SUBJECT_CODES.SOCIETY,
      ]),
      main4Science: calculateAverageRanking(subjects, [
        SUBJECT_CODES.KOREAN,
        SUBJECT_CODES.MATH,
        SUBJECT_CODES.ENGLISH,
        SUBJECT_CODES.SCIENCE,
      ]),
    };
  }, [subjects]);

  if (!averages) return null;

  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <CardTitle>1. 조합별 등급 평균</CardTitle>
        <CardDescription>교과목 조합별 평균 등급</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>구분</TableHead>
              <TableHead>(전학년 100)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>전과목</TableCell>
              <TableCell>{averages.all}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>국어·수학·영어·사회·과학</TableCell>
              <TableCell>{averages.main5}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>국어·수학·영어·사회</TableCell>
              <TableCell>{averages.main4Society}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>국어·수학·영어·과학</TableCell>
              <TableCell>{averages.main4Science}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
