export interface IEvaluationScore {
  text: string; // "진로역량"
  score: number; // 6 (범위: 1 ~ 7)
}

export interface ICalculatedEvaluationScore {
  text: string; // "진로역량"
  score: number; // 6 (범위: 1 ~ 7)
  adjustedScore: number;
  ratio: number; // 총
}
