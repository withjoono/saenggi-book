import { makeApiCall } from "@/stores/server/common-utils";
import { IAiEvaluation } from "./interfaces";

/**
 * AI 평가 내역 조회 API
 * GET /schoolrecord/eval/history
 */
export const fetchAiEvaluationHistoryAPI = async (): Promise<IAiEvaluation[]> => {
  const res = await makeApiCall<void, IAiEvaluation[]>(
    "GET",
    `/schoolrecord/eval/history`,
    undefined,
  );
  if (res.success) {
    return res.data;
  }
  return [];
};

export const AI_EVALUATION_APIS = {
  fetchAiEvaluationHistoryAPI,
};
