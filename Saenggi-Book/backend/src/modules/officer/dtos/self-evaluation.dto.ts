export interface SelfEvaluationBodyDto {
  series: string;
  scores: { surveyId: number; score: number }[];
}
