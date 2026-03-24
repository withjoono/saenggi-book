import { makeApiCall } from "@/stores/server/common-utils";
import {
  IOfficerEvaluationComment,
  IOfficerEvaluationItem,
  IOfficerEvaluationScore,
  IOfficerEvaluationSurvey,
  IOfficerListItem,
  IOfficerProfile,
} from "./interfaces";

/**
 * 사정관 목록 조회 API
 */
const fetchOfficerListAPI = async (): Promise<IOfficerListItem[]> => {
  const res = await makeApiCall<void, IOfficerListItem[]>(
    "GET",
    `/officer-evaluation/officer`,
    undefined,
  );
  if (res.success) {
    return res.data;
  }
  return [];
};

/**
 * 평가 목록 조회 API (학생용 - 학생이 신청한 평가 목록)
 */
const fetchOfficerEvaluationListAPI = async ({
  userId,
}: {
  userId: string;
}): Promise<IOfficerEvaluationItem[]> => {
  const res = await makeApiCall<void, IOfficerEvaluationItem[]>(
    "GET",
    `/officer-evaluation/member/${userId}`,
    undefined,
  );
  if (res.success) {
    return res.data;
  }
  return [];
};

/**
 * 사정관용 평가 목록 조회 API (사정관에게 할당된 평가 목록)
 */
const fetchOfficerPendingEvaluationsAPI = async (): Promise<any[]> => {
  const res = await makeApiCall<void, any[]>(
    "GET",
    `/officer-evaluation/pending`,
    undefined,
  );
  if (res.success) {
    return res.data;
  }
  return [];
};

/**
 * 평가에 대한 코멘트 조회 API
 */
const fetchOfficerEvaluationCommentsAPI = async ({
  evaluationId,
}: {
  evaluationId: number;
}): Promise<IOfficerEvaluationComment[]> => {
  const res = await makeApiCall<void, IOfficerEvaluationComment[]>(
    "GET",
    `/officer-evaluation/${evaluationId}/comments`,
    undefined,
  );
  if (res.success) {
    return res.data;
  }
  return [];
};

/**
 * 평가에 대한 점수 조회 API
 */
const fetchOfficerEvaluationScoresAPI = async ({
  evaluationId,
}: {
  evaluationId: number;
}): Promise<IOfficerEvaluationScore[]> => {
  const res = await makeApiCall<void, IOfficerEvaluationScore[]>(
    "GET",
    `/officer-evaluation/${evaluationId}/scores`,
    undefined,
  );
  if (res.success) {
    return res.data;
  }
  return [];
};

/**
 * 평가 질문 목록 조회 API
 */
const fetchOfficerEvaluationSurveyAPI = async (): Promise<
  IOfficerEvaluationSurvey[]
> => {
  const res = await makeApiCall<void, IOfficerEvaluationSurvey[]>(
    "GET",
    `/officer-evaluation/survey`,
    undefined,
  );
  if (res.success) {
    return res.data;
  }
  return [];
};

/**
 * 평가 티켓 갯수 조회 API
 */
const fetchTicketCountAPI = async (): Promise<{ count: number }> => {
  const res = await makeApiCall<void, { count: number }>(
    "GET",
    `/officer-evaluation/ticket`,
    undefined,
  );
  if (res.success) {
    return res.data;
  }
  return {
    count: 0,
  };
};

/**
 * 사정관인지 체크 API
 */
const fetchCheckOfficerAPI = async (): Promise<boolean> => {
  const res = await makeApiCall<void, boolean>(
    "GET",
    `/officer/check`,
    undefined,
  );
  if (res.success) {
    return res.data;
  }
  return false;
};

/**
 * 사정관 프로필 조회 API
 */
const fetchOfficerProfileAPI = async (): Promise<IOfficerProfile | null> => {
  const res = await makeApiCall<void, IOfficerProfile | null>(
    "GET",
    `/officer/profile`,
    undefined,
  );
  if (res.success) {
    return res.data;
  }
  return null;
};

export const EVALUATION_APIS = {
  fetchOfficerListAPI,
  fetchOfficerEvaluationListAPI,
  fetchOfficerPendingEvaluationsAPI,
  fetchOfficerEvaluationCommentsAPI,
  fetchOfficerEvaluationScoresAPI,
  fetchOfficerEvaluationSurveyAPI,
  fetchTicketCountAPI,
  fetchCheckOfficerAPI,
  fetchOfficerProfileAPI,
};
