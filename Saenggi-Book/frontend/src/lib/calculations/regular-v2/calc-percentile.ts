import 누백대입표 from "@/constants/백분위/누백대입표.json";
import { IEnrichedMockExamScore } from "@/lib/utils/services/mock-exam";

// 누백대입표의 타입 정의
type I누백대입표 = {
  [key: string]: string;
};

// 표준점수 합계 계산 (국어 + 수학 + 탐구 상위 2과목)
export const calc표점합 = (
  mockExamScores: IEnrichedMockExamScore[],
): number => {
  let koreanScore = 0;
  let mathScore = 0;
  const electiveScores: number[] = [];

  mockExamScores.forEach((score) => {
    const standardScoreValue = parseInt(score.standardScore);

    switch (score.subjectCategory) {
      case "kor":
        koreanScore = standardScoreValue;
        break;
      case "math":
        mathScore = standardScoreValue;
        break;
      case "society":
      case "science":
        electiveScores.push(standardScoreValue);
        break;
    }
  });

  const topTwoElectiveScores = electiveScores.sort((a, b) => b - a).slice(0, 2);

  const totalScore =
    koreanScore +
    mathScore +
    topTwoElectiveScores.reduce((sum, score) => sum + score, 0);

  return totalScore;
};

export const calculateUserPercentile = (
  mockExamScores: IEnrichedMockExamScore[],
): number => {
  const 표점합 = calc표점합(mockExamScores);
  // 표점합을 소수점 둘째 자리까지 반올림
  const roundedScore = Math.round(표점합 * 100) / 100;

  // 누백대입표의 키를 숫자로 변환하여 내림차순으로 정렬
  const sortedScores = Object.keys(누백대입표)
    .map((score) => parseFloat(score))
    .sort((a, b) => b - a);

  // 사용자의 표점합보다 작거나 같은 첫 번째 점수를 찾음
  const matchingScore = sortedScores.find((score) => roundedScore >= score);

  if (matchingScore === undefined) {
    // 사용자의 표점합이 모든 점수보다 낮은 경우
    return 100;
  }

  // 찾은 점수에 해당하는 백분위를 반환
  const scoreKey = matchingScore.toFixed(2);
  const percentile = parseFloat((누백대입표 as I누백대입표)[scoreKey]);
  return percentile;
};
