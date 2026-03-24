import {
  extractFirstNumber,
  parseEvaluationInput,
} from "@/lib/utils/common/format";
import { ICalculatedEvaluationScore } from "./types";
import { IEvaluationFactorScore } from "@/stores/server/features/susi/evaluation/interfaces";

/**
 * 평가 점수를 계산합니다.
 * @param myEvaluationFactorScore 내 평가 점수 ({"평가코드": {text, score}} 인 객체 (score는 1 ~ 7 사이))
 * @param codes 평가 코드 문자열 (예: "BA/C/D///")
 * @param ratios 평가 비율 문자열 (예: "30/20/50//")
 * @returns 계산된 평가 점수 결과
 */
export function calculateEvaluationScore({
  myEvaluationFactorScore,
  codes,
  ratios,
}: {
  myEvaluationFactorScore: Record<string, IEvaluationFactorScore>;
  codes: string;
  ratios: string;
}): {
  items: ICalculatedEvaluationScore[];
  totalScore: number;
} {
  // 평가 코드와 비율을 배열로 파싱
  const evaluationCodes = parseEvaluationInput(codes);
  const evaluationRatios = parseEvaluationInput(ratios).map(extractFirstNumber);

  // 전체 비율의 합계 계산
  const totalRatio = evaluationRatios.reduce((acc, ratio) => acc + ratio, 0);

  // 각 평가 항목에 대한 결과 계산
  const results: ICalculatedEvaluationScore[] = evaluationCodes.map(
    (code, idx) => {
      const item = myEvaluationFactorScore[code];
      const ratio = evaluationRatios[idx] || 0;
      const score = item?.score || 0;

      // adjustedScore 계산
      // 총 비율이 100이고 비율이 30이면 점수를 해당 비중에 맞춰 조정
      // 80 * (30/100) = 24
      const adjustedScore = score * (ratio / totalRatio);

      return {
        text: item?.text || "", // 평가 항목 설명
        score, // 원래 점수
        adjustedScore, // 비율에 따라 조정된 점수
        ratio, // 해당 항목의 비율
      };
    },
  );

  // 전체 조정된 점수의 합계 계산
  // 모든 adjustedScore를 더하면 7점 만점 기준의 최종 점수가 됨
  const totalAdjustedScore = results.reduce(
    (acc, item) => acc + item.adjustedScore,
    0,
  );

  return {
    // 결과 항목들을 비율이 높은 순으로 정렬
    items: results.sort((a, b) => b.ratio - a.ratio),
    // 최종 계산된 총점
    totalScore: totalAdjustedScore,
  };
}
