import { createMutation } from "@/stores/server/common-utils";
import { IOfficerListItem } from "./interfaces";
import { BaseResponse } from "@/stores/server/common-interface";

/**
 * 티켓 사용 (평가 신청)
 */
export const useConsumeTicket = () => {
  return createMutation<{ officerId: string; series: string }, void>(
    "POST",
    "/officer-evaluation/ticket",
  );
};

/**
 * 자가 평가
 */
export const useSelfEvaluation = () => {
  return createMutation<
    {
      series: string;
      scores: { surveyId: number; score: number }[];
    },
    void
  >("POST", "/officer-evaluation/self");
};

/**
 * 사정관 평가
 */
export const useEvaluationByOfficer = () => {
  return createMutation<
    {
      studentId: string;
      series: string;
      scores: { surveyId: number; score: number }[];
      comments: { comment: string; mainSurveyType: string }[];
      saveType: number; // 0: 임시저장, 1: 저장
    },
    void
  >("POST", "/officer-evaluation/add");
};

// 사정관 프로필 업데이트
export const useUpdateOfficerProfile = () => {
  return createMutation<
    {
      name: string;
      education: string;
      university: string;
    },
    BaseResponse<IOfficerListItem>
  >("PATCH", "/officer/profile");
};
