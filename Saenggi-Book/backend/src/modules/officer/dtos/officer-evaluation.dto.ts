export interface OfficerEvaluationBodyDto {
  studentId: string;
  series: string;
  scores: { surveyId: number; score: number }[];
  comments: { comment: string; mainSurveyType: string }[];
  saveType: number; // 0: 임시저장, 1: 저장
}
