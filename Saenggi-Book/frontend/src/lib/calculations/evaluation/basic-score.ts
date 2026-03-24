import { IOfficerEvaluationQuery } from "@/stores/server/features/susi/evaluation/interfaces";

export interface ICalculatedEvaluationBasicScore {
  jinroAvg1: number;
  jinroAvg2: number;
  jinroAvg3: number;
  jinroAvg: number;
  hakupAvg: number;
  hakupAvg1: number;
  hakupAvg2: number;
  hakupAvg3: number;
  gongdongAvg: number;
  gongdongAvg1: number;
  gongdongAvg2: number;
  gongdongAvg3: number;
  gongdongAvg4: number;
  etcAvg: number;
  etcAvg1: number;
  etcAvg2: number;
  etcAvg3: number;
  etcAvg4: number;
  etcAvg5: number;
}

/**
 * 3,4대 평가에 사용되는 평균점수 계산
 *
 * ⚠️ IMPORTANT: This function expects scores to be keyed by orderNum (1-40)
 * The mapping from database IDs to orderNum is done in queries.ts
 * See: src/stores/server/features/susi/evaluation/queries.ts
 *      useGetOfficerEvaluation function for the mapping logic
 *
 * Score keys used:
 * - 진로 영역: scores[1-7]
 * - 학업 영역: scores[8-15]
 * - 공동체 영역: scores[16-25]
 * - 기타 영역: scores[26-40]
 */
export function calculateEvaluationBasicScore(
  evaluation?: IOfficerEvaluationQuery,
): ICalculatedEvaluationBasicScore {
  if (!evaluation) {
    return {
      jinroAvg1: 0,
      jinroAvg2: 0,
      jinroAvg3: 0,
      jinroAvg: 0,
      hakupAvg1: 0,
      hakupAvg2: 0,
      hakupAvg3: 0,
      hakupAvg: 0,
      gongdongAvg1: 0,
      gongdongAvg2: 0,
      gongdongAvg3: 0,
      gongdongAvg4: 0,
      gongdongAvg: 0,
      etcAvg1: 0,
      etcAvg2: 0,
      etcAvg3: 0,
      etcAvg4: 0,
      etcAvg5: 0,
      etcAvg: 0,
    };
  }

  const scores = evaluation.scores;

  // 진로 영역 평균 계산
  const jinroAvg1 =
    ((scores["1"] || 0) + (scores["2"] || 0) + (scores["3"] || 0)) / 3;
  const jinroAvg2 = ((scores["4"] || 0) + (scores["5"] || 0)) / 2;
  const jinroAvg3 = ((scores["6"] || 0) + (scores["7"] || 0)) / 2;
  const jinroAvg = (jinroAvg1 + jinroAvg2 + jinroAvg3) / 3;

  // 학업 영역 평균 계산
  const hakupAvg1 = ((scores["8"] || 0) + (scores["9"] || 0)) / 2;
  const hakupAvg2 =
    ((scores["10"] || 0) + (scores["11"] || 0) + (scores["12"] || 0)) / 3;
  const hakupAvg3 =
    ((scores["13"] || 0) + (scores["14"] || 0) + (scores["15"] || 0)) / 3;
  const hakupAvg = (hakupAvg1 + hakupAvg2 + hakupAvg3) / 3;

  // 공동체 영역 평균 계산
  const gongdongAvg1 =
    ((scores["16"] || 0) + (scores["17"] || 0) + (scores["18"] || 0)) / 3;
  const gongdongAvg2 =
    ((scores["19"] || 0) + (scores["20"] || 0) + (scores["21"] || 0)) / 3;
  const gongdongAvg3 = ((scores["22"] || 0) + (scores["23"] || 0)) / 2;
  const gongdongAvg4 = ((scores["24"] || 0) + (scores["25"] || 0)) / 2;
  const gongdongAvg =
    (gongdongAvg1 + gongdongAvg2 + gongdongAvg3 + gongdongAvg4) / 4;

  // 기타 영역 평균 계산
  const etcAvg1 =
    ((scores["26"] || 0) + (scores["27"] || 0) + (scores["28"] || 0)) / 3;
  const etcAvg2 =
    ((scores["29"] || 0) +
      (scores["30"] || 0) +
      (scores["31"] || 0) +
      (scores["32"] || 0)) /
    4;
  const etcAvg3 =
    ((scores["33"] || 0) + (scores["34"] || 0) + (scores["35"] || 0)) / 3;
  const etcAvg4 =
    ((scores["36"] || 0) + (scores["37"] || 0) + (scores["38"] || 0)) / 3;
  const etcAvg5 = ((scores["39"] || 0) + (scores["40"] || 0)) / 2;
  const etcAvg = (etcAvg1 + etcAvg2 + etcAvg3 + etcAvg4 + etcAvg5) / 5;

  return {
    jinroAvg1,
    jinroAvg2,
    jinroAvg3,
    jinroAvg,
    hakupAvg1,
    hakupAvg2,
    hakupAvg3,
    hakupAvg,
    gongdongAvg1,
    gongdongAvg2,
    gongdongAvg3,
    gongdongAvg4,
    gongdongAvg,
    etcAvg1,
    etcAvg2,
    etcAvg3,
    etcAvg4,
    etcAvg5,
    etcAvg,
  };
}
