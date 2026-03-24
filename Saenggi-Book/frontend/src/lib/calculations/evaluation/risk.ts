/**
 * 평가 점수의 위험도를 계산
 * @param myScore 내 평가 점수
 * @param universityLevel 대학 레벨 (1-7)
 * @returns 계산된 위험도 (10: 매우 안정 ~ 1: 불안정, -15: 최대 위험)
 */
export function calculateEvaluationRisk(
  myScore: number,
  universityLevel: number,
): number {
  const quartile = 0.1666;
  const reversedLevel = 7 - universityLevel;

  const riskLevels = [
    { risk: 5, threshold: reversedLevel },
    { risk: 4, threshold: reversedLevel - quartile },
    { risk: 3, threshold: reversedLevel - quartile * 2 },
    { risk: 2, threshold: reversedLevel - quartile * 3 },
    { risk: 1, threshold: reversedLevel - quartile * 4 },
    { risk: 0, threshold: reversedLevel - quartile * 5 },
    { risk: -1, threshold: reversedLevel - quartile * 6 },
    { risk: -2, threshold: reversedLevel - quartile * 7 },
    { risk: -3, threshold: reversedLevel - quartile * 8 },
  ];

  for (const { risk, threshold } of riskLevels) {
    if (myScore >= threshold) {
      return risk;
    }
  }

  return -5; // 최대 위험
}
