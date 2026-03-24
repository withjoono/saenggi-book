import { ISubjectRiskData } from "./types";

/**
 * 프론트엔드 공통 위험도 계산 (-5 ~ +5 단계)
 * Risk Logic Reference에 의거한 정규분포 백분위 추정 방식 적용
 * 내신(Grade)은 낮을수록 좋으므로 Z-Score 방향 정방향 적용 (Grade - Mean)
 */
export const calculateSubjectRisk = (
  myGrade: number,
  riskData: ISubjectRiskData,
): number => {
  // 기준점: risk_5 (50% 컷), risk_3 (70% 컷) check
  const cut50 = riskData.risk_5;
  const cut70 = riskData.risk_3;

  if (cut50 === undefined || cut70 === undefined || cut50 === null || cut70 === null) {
    return -5; // 데이터 부족 시 최저점
  }

  // 1. Sigma 추정
  // 내신(등급)은 70%컷 > 50%컷 (등급 숫자가 클수록 하위)
  // Gap은 절댓값으로 계산
  let gap = Math.abs(cut70 - cut50);
  if (gap < 0.1) gap = 0.1;

  const sigma = gap / 0.5244;

  // 2. Z-Score 산출 (Lower is Better)
  // 내 등급이 평균(50%)보다 높으면(Bad) Z > 0이어야 함
  // 식: (내등급 - 50%컷) / Sigma
  // 예: 평균 2.0, 내점수 2.5 -> (2.5 - 2.0)/Sigma = +Z (Bad)
  const zScore = (myGrade - cut50) / sigma;

  // 3. 백분위 추정
  const percentile = standardNormalCDF(zScore) * 100;

  // 4. 구간표 매핑 (11 Stage)
  if (percentile < 30) return 5;
  if (percentile < 50) return 4;
  if (percentile < 60) return 3;
  if (percentile < 70) return 2;
  if (percentile <= 73) return 1;
  if (percentile <= 76) return 0;
  if (percentile <= 79) return -1;
  if (percentile <= 84) return -2;
  if (percentile <= 90) return -3;
  if (percentile <= 97) return -4;
  return -5;
};

// Helper Functions
function standardNormalCDF(z: number): number {
  return 0.5 * (1 + erf(z / Math.sqrt(2)));
}

function erf(x: number): number {
  const sign = x >= 0 ? 1 : -1;
  x = Math.abs(x);

  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;

  const t = 1.0 / (1.0 + p * x);
  const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

  return sign * y;
}
