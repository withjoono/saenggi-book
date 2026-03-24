import {
  IEachSubjectAverage,
  ISchoolRecordSubject,
  ISubjectSumInfo,
} from "@/stores/server/features/me/interfaces";

// 상수 정의
const SUBJECT_CODES = {
  KOREAN: "HH1",
  MATH: "HH2",
  ENGLISH: "HH3",
  SOCIETY: "HH4",
  SCIENCE: "HH5",
} as const;

// 에러 메시지 상수
const ERROR_MESSAGES = {
  NO_MAJOR:
    "내 등급 표시를 위해 사용자 정보에서 문과/이과 정보를 등록해 주세요.",
  NO_GRADES:
    "성적 정보가 존재하지 않아 내 등급을 계산할 수 없습니다. 입력과 분석 탭에서 생기부를 등록해주세요.",
};

/**
 * 내 평균등급 계산
 */
export const calculateMyAverageRating = (
  data: ISchoolRecordSubject[],
  major?: string | null,
): string => {
  if (!major) {
    throw new Error(ERROR_MESSAGES.NO_MAJOR);
  }

  const processedData = processSchoolRecordSubjectData(data);

  if (processedData.length === 0) {
    throw new Error(ERROR_MESSAGES.NO_GRADES);
  }

  const eachSubjectAverage = calculateEachSubjectAverage(processedData);
  const relevantSubjects = getRelevantSubjects(major);
  const { sum, totalUnits } = calculateSubjectSumAndCount(
    eachSubjectAverage,
    relevantSubjects,
  );

  return totalUnits > 0 ? (sum / totalUnits).toFixed(2) : "0.00";
};

/**
 * 교과 성적 학년, 학기, 과목별로 단위별 계산
 */
export const processSchoolRecordSubjectData = (
  data: ISchoolRecordSubject[],
): ISubjectSumInfo[] => {
  const groupedData = groupSchoolRecordData(data);
  return calculateTotalRankings(groupedData);
};

/**
 * 학교 기록 데이터 그룹화
 */
const groupSchoolRecordData = (data: ISchoolRecordSubject[]) => {
  return data.reduce(
    (acc, curr) => {
      if (curr.mainSubjectCode && curr.grade && curr.semester) {
        const key = `${curr.mainSubjectCode}-${curr.grade}-${curr.semester}`;
        if (!acc[key]) {
          acc[key] = {
            subject: curr.mainSubjectCode,
            grade: curr.grade,
            semester: curr.semester,
            totalRanking: 0,
            totalUnits: 0,
          };
        }
        if (!curr.ranking || !curr.unit) return acc;
        const ranking = parseFloat(curr.ranking);
        const unit = parseFloat(curr.unit);
        acc[key].totalRanking += ranking * unit;
        acc[key].totalUnits += unit;
      }
      return acc;
    },
    {} as Record<string, ISubjectSumInfo & { totalUnits: number }>,
  );
};

/**
 * 총 랭킹 계산
 */
const calculateTotalRankings = (
  groupedData: ReturnType<typeof groupSchoolRecordData>,
) => {
  return Object.values(groupedData).map((item) => ({
    subject: item.subject,
    grade: item.grade,
    semester: item.semester,
    totalRanking: item.totalUnits
      ? parseFloat((item.totalRanking / item.totalUnits).toFixed(2))
      : 0,
    totalUnits: item.totalUnits,
  }));
};

/**
 * 각 과목별 평균 계산
 */
export const calculateEachSubjectAverage = (
  sumInfoList: ISubjectSumInfo[],
): IEachSubjectAverage => {
  const subjectTotals = {
    korean: { sum: 0, totalUnits: 0 },
    english: { sum: 0, totalUnits: 0 },
    science: { sum: 0, totalUnits: 0 },
    society: { sum: 0, totalUnits: 0 },
    math: { sum: 0, totalUnits: 0 },
  };

  sumInfoList.forEach((sumInfo) => {
    const units = sumInfo.totalUnits;
    switch (sumInfo.subject) {
      case SUBJECT_CODES.MATH:
        subjectTotals.math.sum += sumInfo.totalRanking * units;
        subjectTotals.math.totalUnits += units;
        break;
      case SUBJECT_CODES.SOCIETY:
        subjectTotals.society.sum += sumInfo.totalRanking * units;
        subjectTotals.society.totalUnits += units;
        break;
      case SUBJECT_CODES.SCIENCE:
        subjectTotals.science.sum += sumInfo.totalRanking * units;
        subjectTotals.science.totalUnits += units;
        break;
      case SUBJECT_CODES.ENGLISH:
        subjectTotals.english.sum += sumInfo.totalRanking * units;
        subjectTotals.english.totalUnits += units;
        break;
      case SUBJECT_CODES.KOREAN:
        subjectTotals.korean.sum += sumInfo.totalRanking * units;
        subjectTotals.korean.totalUnits += units;
        break;
    }
  });

  return Object.entries(subjectTotals).reduce(
    (acc, [key, { sum, totalUnits }]) => {
      acc[key as keyof IEachSubjectAverage] = {
        average: totalUnits ? (sum / totalUnits).toFixed(2) : "0.00",
        totalUnits,
      };
      return acc;
    },
    {} as IEachSubjectAverage,
  );
};

/**
 * 전공에 따른 관련 과목 반환
 */
const getRelevantSubjects = (major: string): (keyof IEachSubjectAverage)[] => {
  return major === "LiberalArts"
    ? ["korean", "english", "math", "society"]
    : ["korean", "english", "math", "science"];
};

/**
 * 과목별 합계와 개수 계산
 */
const calculateSubjectSumAndCount = (
  eachSubjectAverage: IEachSubjectAverage,
  relevantSubjects: (keyof IEachSubjectAverage)[],
) => {
  return relevantSubjects.reduce(
    (acc, subject) => {
      const { average, totalUnits } = eachSubjectAverage[subject];
      const value = parseFloat(average);
      if (value !== 0 && totalUnits > 0) {
        acc.sum += value * totalUnits;
        acc.totalUnits += totalUnits;
      }
      return acc;
    },
    { sum: 0, totalUnits: 0 },
  );
};
