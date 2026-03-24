import { getCompatibilityWithSubject } from "@/lib/utils/services/compatibility";
import { ISchoolRecord } from "@/stores/server/features/me/interfaces";
import { IMainSubject, ISubject } from "@/types/subject.type";
import {
  calculateMainSubjectCompatibilityRisk,
  calculateSubjectCompatibilityRisk,
} from "./risk";
import { ICalculatedCompatibility, ISeries } from "@/types/compatibility.type";
import { ITransformedStaticData } from "@/stores/server/features/static-data/queries";

export const calculateSubjectGradeAverage = (
  schoolRecord: ISchoolRecord,
  subject: ISubject,
) => {
  const normalRecords = schoolRecord.subjects
    .filter((n) => n.subjectCode === subject.code)
    .filter(
      (n) =>
        !Number.isNaN(Number(n.ranking)) ||
        ["A", "B", "C", "D", "E"].includes(n.achievement || ""),
    );
  const normalTotalCount = normalRecords.length;
  const normalTotalSum = normalRecords.reduce((acc: number, n) => {
    if (n.ranking) {
      return acc + Number(n.ranking);
    }
    let grade = 0;
    if (n.achievement === "A") grade = 1;
    else if (n.achievement === "B") grade = 3;
    else if (n.achievement === "C") grade = 5;
    else if (n.achievement === "D") grade = 7;
    else grade = 9;

    return acc + grade;
  }, 0);

  const selectRecords = schoolRecord.selectSubjects.filter(
    (n) =>
      n.subjectCode === subject.code &&
      ["A", "B", "C", "D", "E"].includes(n.achievement || ""),
  );
  const selectTotalCount = selectRecords.length;
  const selectTotalSum = selectRecords
    .map((n) => {
      if (n.achievement === "A") return 1;
      else if (n.achievement === "B") return 3;
      else if (n.achievement === "C") return 5;
      else if (n.achievement === "D") return 7;
      else return 9;
    })
    .reduce((acc, n) => acc + n, 0);

  const totalCount = normalTotalCount + selectTotalCount;
  const totalSum = normalTotalSum + selectTotalSum;

  return 0 < totalCount ? totalSum / totalCount : undefined;
};

export const calculateMainSubjectGradeAverage = (
  schoolRecord: ISchoolRecord,
  subject: IMainSubject,
) => {
  const normalRecords = schoolRecord.subjects
    .filter((n) => n.mainSubjectCode === subject.code)
    .filter(
      (n) =>
        !Number.isNaN(Number(n.ranking)) ||
        ["A", "B", "C", "D", "E"].includes(n.achievement || ""),
    );
  const normalTotalCount = normalRecords.length;
  const normalTotalSum = normalRecords.reduce((acc: number, n) => {
    if (n.ranking) {
      return acc + Number(n.ranking);
    }
    let grade = 0;
    if (n.achievement === "A") grade = 1;
    else if (n.achievement === "B") grade = 3;
    else if (n.achievement === "C") grade = 5;
    else if (n.achievement === "D") grade = 7;
    else grade = 9;

    return acc + grade;
  }, 0);

  const selectRecords = schoolRecord.selectSubjects.filter(
    (n) =>
      n.mainSubjectCode === subject.code &&
      ["A", "B", "C", "D", "E"].includes(n.achievement || ""),
  );
  const selectTotalCount = selectRecords.length;
  const selectTotalSum = selectRecords
    .map((n) => {
      if (n.achievement === "A") return 1;
      else if (n.achievement === "B") return 3;
      else if (n.achievement === "C") return 5;
      else if (n.achievement === "D") return 7;
      else return 9;
    })
    .reduce((acc, n) => acc + n, 0);

  const totalCount = normalTotalCount + selectTotalCount;
  const totalSum = normalTotalSum + selectTotalSum;

  return 0 < totalCount ? totalSum / totalCount : undefined;
};

export const calculateCompatibility = ({
  schoolRecord,
  series,
  univLevel,
  staticData,
}: {
  schoolRecord?: ISchoolRecord;
  series: ISeries;
  univLevel: number;
  staticData?: ITransformedStaticData;
}): ICalculatedCompatibility => {
  if (!schoolRecord || !staticData) {
    return {
      requiredSubjects: [],
      encouragedSubjects: [],
      mainSubjects: [],
      referenceSubjects: [],
      totalRisk: 10,
      isEmpty: true,
    };
  }
  const seriesCompatibility = getCompatibilityWithSubject(
    series,
    staticData.subjects,
  );
  const newRequiredSubjects = seriesCompatibility.requiredSubjects.map(
    (subject) => {
      const myGradeAvg = calculateSubjectGradeAverage(schoolRecord, subject);
      const risk = calculateSubjectCompatibilityRisk(univLevel, myGradeAvg);

      return {
        ...subject,
        myGradeAvg,
        risk: risk + (0 < risk ? 5 : 6),
      };
    },
  );
  const newEncouragedSubjects = seriesCompatibility.encouragedSubjects.map(
    (subject) => {
      const myGradeAvg = calculateSubjectGradeAverage(schoolRecord, subject);
      const risk = calculateSubjectCompatibilityRisk(univLevel, myGradeAvg);
      return {
        ...subject,
        myGradeAvg,
        risk: risk + (0 < risk ? 5 : 6),
      };
    },
  );
  const newMainSubjects = seriesCompatibility.mainSubjects.map((subject) => {
    const myGradeAvg = calculateMainSubjectGradeAverage(schoolRecord, subject);
    const risk = calculateMainSubjectCompatibilityRisk(univLevel, myGradeAvg);
    return {
      ...subject,
      myGradeAvg,
      risk: risk + (0 < risk ? 5 : 6),
    };
  });
  const newReferenceSubjects = seriesCompatibility.referenceSubjects.map(
    (subject) => {
      const myGradeAvg = calculateMainSubjectGradeAverage(
        schoolRecord,
        subject,
      );
      const risk = calculateMainSubjectCompatibilityRisk(univLevel, myGradeAvg);
      return {
        ...subject,
        myGradeAvg,
        risk: risk + (0 < risk ? 5 : 6),
      };
    },
  );

  const subjectTotalRisk =
    (newRequiredSubjects.reduce((acc, n) => acc + n.risk, 0) * 2 +
      newEncouragedSubjects.reduce((acc, n) => acc + n.risk, 0)) /
      (newRequiredSubjects.length * 2 + newEncouragedSubjects.length) || 0;

  const mainSubjectTotalRisk =
    (newMainSubjects.reduce((acc, n) => acc + n.risk, 0) +
      newReferenceSubjects.reduce((acc, n) => acc + n.risk, 0)) /
      (newMainSubjects.length + newReferenceSubjects.length) || 0;

  const totalRisk =
    (subjectTotalRisk + mainSubjectTotalRisk) /
      ((subjectTotalRisk ? 1 : 0) + (mainSubjectTotalRisk ? 1 : 0)) || 10;

  return {
    requiredSubjects: newRequiredSubjects,
    encouragedSubjects: newEncouragedSubjects,
    mainSubjects: newMainSubjects,
    referenceSubjects: newReferenceSubjects,
    totalRisk: totalRisk ? totalRisk : 10,
    isEmpty:
      newRequiredSubjects.length === 0 &&
      newEncouragedSubjects.length === 0 &&
      newMainSubjects.length === 0 &&
      newReferenceSubjects.length === 0,
  };
};
