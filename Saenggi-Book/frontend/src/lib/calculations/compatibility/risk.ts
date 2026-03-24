import {
  COMPATIBILITY_MAIN_SUBJECT_RISK_WEIGHTS,
  COMPATIBILITY_SUBJECT_NOT_TAKEN_RISK_SCORES,
  COMPATIBILITY_SUBJECT_RISK_WEIGHTS,
  COMPATIBILITY_UNIVERSITY_LEVEL_RECOMMENDED_GRADES,
} from "./constants";
import { ICompatibilityRange } from "./types";

/**
 * * 교과 과목(확통, 미적분 등)의 계열 적합성 위험도를 계산
 * @param universityLevel 대학 레벨 (1-7)
 * @param studentGrade 학생의 과목 등급
 * @returns 계열 적합성 위험도 점수
 */
/**
 * * 교과 과목(확통, 미적분 등)의 계열 적합성 위험도를 계산
 * @param universityLevel 대학 레벨 (1-7)
 * @param studentGrade 학생의 과목 등급
 * @returns 계열 적합성 위험도 점수
 */
export function calculateSubjectCompatibilityRisk(
  universityLevel: number,
  studentGrade: number | null | undefined,
): number {
  if (universityLevel < 1 || universityLevel > 7) return -5;

  const recommendedGrade =
    COMPATIBILITY_UNIVERSITY_LEVEL_RECOMMENDED_GRADES[universityLevel];

  if (studentGrade === null || studentGrade === undefined) {
    return COMPATIBILITY_SUBJECT_NOT_TAKEN_RISK_SCORES[universityLevel];
  }

  const gradeDifference = recommendedGrade - studentGrade;
  return calculateRiskScore(
    gradeDifference,
    COMPATIBILITY_SUBJECT_RISK_WEIGHTS[universityLevel],
  );
}

/**
 * * 주요 과목(국어, 수학, 영어 등)의 계열 적합성 위험도를 계산
 * @param universityLevel 대학 레벨 (1-7)
 * @param studentGrade 학생의 과목 등급
 * @returns 계열 적합성 위험도 점수
 */
export function calculateMainSubjectCompatibilityRisk(
  universityLevel: number,
  studentGrade: number | null | undefined,
): number {
  if (universityLevel < 1 || universityLevel > 7) return 5;
  if (studentGrade === null || studentGrade === undefined) {
    return -5;
  }
  const recommendedGrade =
    COMPATIBILITY_UNIVERSITY_LEVEL_RECOMMENDED_GRADES[universityLevel];
  const gradeDifference = recommendedGrade - studentGrade;

  return calculateRiskScore(
    gradeDifference,
    COMPATIBILITY_MAIN_SUBJECT_RISK_WEIGHTS[
    universityLevel === 7 ? "7" : "default"
    ],
  );
}

/**
 * * 점수 차이와 위험도 범위를 받아 해당하는 위험도 점수를 반환
 */
export function calculateRiskScore(
  gradeDifference: number,
  riskRanges: ICompatibilityRange[],
): number {
  for (const range of riskRanges) {
    if (gradeDifference >= range.min) {
      return range.score;
    }
  }
  return -5; // 기본 위험도 점수 (모든 범위에 해당하지 않을 경우)
}
