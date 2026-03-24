// 사정관 평가
export interface IOfficerEvaluation {
  id: number;
  member_id: number;
  series: string;
  status: string; // COMPLETE | READY
  student_id: number;
  update_dt: Date | null;
  create_dt: Date | null;
}

// 사정관 평가 점수
export interface IOfficerEvaluationScore {
  id: number;
  bottomSurveyId: number | null;
  officerRelationId: number; // OfficerEvaluation ID
  score: number; // D: 1, C: 2, C+: 3, B: 4, B+: 5, A: 6, A+: 7
}

// 사정관 평가 코멘트
export interface IOfficerEvaluationComment {
  id: number;
  comment: string;
  mainSurveyType: string; // HAKUP | JINRO | GONGDONG | ETC
  officerRelationId: number; // OfficerEvaluation ID
}

// 사정관 평가 질문
export interface IOfficerEvaluationSurvey {
  id: number;
  evaluateContent: string; // 소분류 (실제 질문 내용)
  orderNum: number; // 순서 (질문번호)
  mainCategory: string; // 대분류: 1. 진로역량, 2. 학업역량, 3. 공동체역량, 4. 기타 역량
  middleCategory: string; // 중분류
  mainSurveyType?: string; // 레거시 카테고리 (하위 호환용)
}

// 사정관 목록 조회 (camelCase로 변환됨)
export interface IOfficerListItem {
  officerId: number;
  officerName: string | null;
  officerProfileImage: string | null;
  officerUniversity: string | null;
  officerEducation: string | null;
  remainingEvaluations: number;
}

// 유저 평가목록 조회 (camelCase로 변환됨)
export interface IOfficerEvaluationItem {
  id: IOfficerEvaluation["id"];
  series: IOfficerEvaluation["series"];
  status: IOfficerEvaluation["status"];
  updateDt: IOfficerEvaluation["update_dt"];

  officerId: number;
  officerName: string;
  officerProfileImage: string;
  remainingEvaluations: number; // 남은 평가 수
}

export interface IOfficerEvaluationQuery {
  comments: IOfficerEvaluationComment[];
  scores: Record<string, number>;
  factorScores: Record<string, IEvaluationFactorScore>;
}

// 사정관 목록 조회
export interface IOfficerProfile {
  education: string;
  id: string;
  memberId: string;
  officerName: string;
  officerProfileImage: string;
  university: string;
}

// 평가요소별 계산된 내 점수
export interface IEvaluationFactorScore {
  code: string;
  text: string;
  surveyIds: number[];
  score: number;
}

// 사정관용 평가 요청 목록 (camelCase로 변환됨)
export interface IOfficerPendingEvaluation {
  studentId: number;
  studentName: string;
  series: string;
  progressStatus: string; // READY | COMPLETE
  readyCount: number;
  phone: string;
  email: string;
  evaluationId: number;
  updateDt: Date;
}
