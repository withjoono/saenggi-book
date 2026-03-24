import { EVALUATION_FACTORS } from "@/constants/evaluation-factors";

/**
 * * 평가 요소 코드로 질문 목록 조회 (ex. AE)
 */
export const getEvaluationFactorsByCode = (
  code: string,
): { text: string; surveyIds: number[] } | null => {
  const result = EVALUATION_FACTORS[code];
  return result ? result : null;
};

/**
 * * 평가 점수를 등급으로 변환 (6.2 -> "A+")
 */
export const convertEvaluationScoreToGrade = (data: number) => {
  if (data >= 6) {
    return "A+";
  } else if (data > 5) {
    return "A";
  } else if (data > 4) {
    return "B+";
  } else if (data > 3) {
    return "B";
  } else if (data > 2) {
    return "C+";
  } else if (data > 1) {
    return "C";
  } else if (data > 0) {
    return "D";
  } else {
    return null;
  }
};
