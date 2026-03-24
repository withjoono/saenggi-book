import { MOCK_EXAM_SUBJECTS } from "@/constants/mock-exam-subject-codes";

/**
 * 모의고사 교과 코드로 과목명 가져오기 (ex. S6)
 */
export const getMockExamSubjectLabelByCode = (code: string): string => {
  return MOCK_EXAM_SUBJECTS[code as keyof typeof MOCK_EXAM_SUBJECTS] || "-";
};
