import { useQuery } from "@tanstack/react-query";
import { IAiEvaluation } from "./interfaces";
import { AI_EVALUATION_APIS } from "./apis";
import { useGetCurrentUser } from "../me/queries";

export const aiEvaluationQueryKeys = {
  all: ["ai-evaluation"] as const,
  history: () => [...aiEvaluationQueryKeys.all, "history"] as const,
};

/**
 * AI 평가 내역 조회 (최신순 20개)
 */
export const useGetAiEvaluationHistory = () => {
  const { data: currentUser } = useGetCurrentUser();
  return useQuery<IAiEvaluation[]>({
    queryKey: aiEvaluationQueryKeys.history(),
    queryFn: AI_EVALUATION_APIS.fetchAiEvaluationHistoryAPI,
    enabled: !!currentUser,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
