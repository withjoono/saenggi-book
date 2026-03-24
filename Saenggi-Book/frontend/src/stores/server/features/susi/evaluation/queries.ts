import { useQueries, useQuery } from "@tanstack/react-query";
import {
  IEvaluationFactorScore,
  IOfficerEvaluationComment,
  IOfficerEvaluationItem,
  IOfficerEvaluationQuery,
  IOfficerEvaluationScore,
  IOfficerEvaluationSurvey,
  IOfficerListItem,
  IOfficerPendingEvaluation,
  IOfficerProfile,
} from "./interfaces";
import { EVALUATION_APIS } from "./apis";
import { useGetCurrentUser } from "../../me/queries";
import { EVALUATION_FACTORS } from "@/constants/evaluation-factors";

export const officerQueryKeys = {
  all: ["officer"] as const,
  lists: (userId?: string) => [...officerQueryKeys.all, "list", userId] as const,
  officers: () => [...officerQueryKeys.all, "officers"] as const,
  pending: () => [...officerQueryKeys.all, "pending"] as const,
  comments: (evaluationId: number) =>
    [...officerQueryKeys.all, "comments", evaluationId] as const,
  scores: (evaluationId: number) =>
    [...officerQueryKeys.all, "scores", evaluationId] as const,
  evaluation: (evaluationId: number) =>
    [...officerQueryKeys.all, "evaluation", evaluationId] as const,
  survey: () => [...officerQueryKeys.all, "survey"] as const,
  ticket: () => [...officerQueryKeys.all, "ticket"] as const,
  isOfficer: () => [...officerQueryKeys.all, "isOfficer"] as const,
  profile: () => [...officerQueryKeys.all, "profile"] as const,
  multipleEvaluations: (evaluationIds: number[]) =>
    [...officerQueryKeys.all, "evaluations", evaluationIds] as const,
};

/**
 * 사정관 목록 조회
 */
export const useGetOfficerList = () =>
  useQuery<IOfficerListItem[]>({
    queryKey: officerQueryKeys.officers(),
    queryFn: EVALUATION_APIS.fetchOfficerListAPI,
    staleTime: 60 * 60 * 1000, // 60 minutes
  });

/**
 * 평가 목록 조회 (학생용 - 학생이 신청한 평가)
 */
export const useGetOfficerEvaluationList = () => {
  const { data: currentUser } = useGetCurrentUser();
  return useQuery<IOfficerEvaluationItem[]>({
    queryKey: officerQueryKeys.lists(currentUser?.id),
    queryFn: () => {
      return EVALUATION_APIS.fetchOfficerEvaluationListAPI({
        userId: currentUser!.id,
      });
    },
    enabled: !!currentUser,
    staleTime: 60 * 60 * 1000, // 60 minutes
  });
};

/**
 * 사정관용 평가 요청 목록 조회
 */
export const useGetOfficerPendingEvaluations = () => {
  const { data: currentUser } = useGetCurrentUser();
  return useQuery<IOfficerPendingEvaluation[]>({
    queryKey: officerQueryKeys.pending(),
    queryFn: EVALUATION_APIS.fetchOfficerPendingEvaluationsAPI,
    enabled: !!currentUser,
    staleTime: 60 * 60 * 1000, // 60 minutes
  });
};

/**
 * 평가에 대한 코멘트 조회
 */
export const useGetOfficerEvaluationComments = ({
  evaluationId,
}: {
  evaluationId: number;
}) => {
  const { data: currentUser } = useGetCurrentUser();
  return useQuery<IOfficerEvaluationComment[]>({
    queryKey: officerQueryKeys.comments(evaluationId),
    queryFn: () =>
      EVALUATION_APIS.fetchOfficerEvaluationCommentsAPI({ evaluationId }),
    enabled: !!currentUser,
    staleTime: 60 * 60 * 1000, // 60 minutes
  });
};

/**
 * 평가에 대한 점수 조회
 */
export const useGetOfficerEvaluationScores = ({
  evaluationId,
}: {
  evaluationId: number;
}) => {
  const { data: currentUser } = useGetCurrentUser();
  return useQuery<IOfficerEvaluationScore[]>({
    queryKey: officerQueryKeys.scores(evaluationId),
    queryFn: () =>
      EVALUATION_APIS.fetchOfficerEvaluationScoresAPI({ evaluationId }),
    enabled: !!currentUser,
    staleTime: 60 * 60 * 1000, // 60 minutes
  });
};

/**
 * 평가 질문 목록 조회
 */
export const useGetOfficerEvaluationSurvey = () => {
  const { data: currentUser } = useGetCurrentUser();
  return useQuery<IOfficerEvaluationSurvey[]>({
    queryKey: officerQueryKeys.survey(),
    queryFn: () => EVALUATION_APIS.fetchOfficerEvaluationSurveyAPI(),
    enabled: !!currentUser,
    staleTime: 60 * 60 * 1000, // 60 minutes
  });
};

/**
 * 평가에 대한 점수 및 코멘트 조회
 */
export const useGetOfficerEvaluation = (evaluationId?: number | null) => {
  const { data: currentUser } = useGetCurrentUser();
  return useQuery<IOfficerEvaluationQuery>({
    queryKey: officerQueryKeys.evaluation(evaluationId || 0),
    queryFn: async () => {
      if (!evaluationId) {
        return {
          comments: [],
          scores: {},
          factorScores: {},
        };
      }

      const [comments, scores, surveys] = await Promise.all([
        EVALUATION_APIS.fetchOfficerEvaluationCommentsAPI({ evaluationId }),
        EVALUATION_APIS.fetchOfficerEvaluationScoresAPI({ evaluationId }),
        EVALUATION_APIS.fetchOfficerEvaluationSurveyAPI(),
      ]);

      // ⚠️ CRITICAL: Create mapping from database ID to orderNum (1-40)
      // WHY THIS IS NEEDED:
      // - Backend returns scores with bottomSurveyId (e.g., 62, 63, 64... - actual DB IDs)
      // - But basic-score.ts and UI components expect scores[1], scores[2], scores[3]... (question order 1-40)
      // - Without this mapping, ALL scores will be undefined and charts will show zero
      // - Survey.orderNum provides the sequential question number (1-40)
      // DO NOT REMOVE THIS MAPPING - it's essential for score display!
      const idToOrderMap: Record<number, number> = {};
      surveys.forEach((survey) => {
        idToOrderMap[survey.id] = survey.orderNum;
      });

      // Map scores by orderNum instead of database ID
      const scoreRecord: Record<string, number> = {};
      scores.forEach((d) => {
        if (d.bottomSurveyId) {
          const orderNum = idToOrderMap[d.bottomSurveyId];
          if (orderNum) {
            scoreRecord[orderNum] = d.score;
          }
        }
      });

      const factorScores: Record<string, IEvaluationFactorScore> = {};
      Object.entries(EVALUATION_FACTORS).forEach(([key, value]) => {
        const totalScore = value.surveyIds.reduce(
          (acc: number, surveyId: number) => {
            return acc + (scoreRecord[surveyId] || 0);
          },
          0,
        );

        const averageScore = totalScore / value.surveyIds.length;
        const normalizedScore = (averageScore / 7) * 100; // 7점 만점 -> 100점 만점

        factorScores[key] = {
          code: key,
          text: value.text,
          surveyIds: value.surveyIds,
          score: normalizedScore || 0,
        };
      });
      const evaluation = {
        comments: comments || [],
        scores: scoreRecord,
        factorScores,
      };
      return evaluation;
    },
    enabled: !!currentUser,
    staleTime: 60 * 60 * 1000, // 60 minutes
  });
};

/**
 * 여러 평가에 대한 점수 및 코멘트 조회
 */
export const useGetOfficerEvaluations = (
  evaluationIds: (number | null)[],
): Record<number, IOfficerEvaluationQuery> => {
  const { data: currentUser } = useGetCurrentUser();

  // Define queries
  const queries = useQueries({
    queries: evaluationIds.map((evaluationId) => ({
      queryKey: officerQueryKeys.evaluation(evaluationId || 0),
      queryFn: async () => {
        if (!evaluationId) {
          return {
            comments: [],
            scores: {},
            factorScores: {},
          };
        }

        const [comments, scores, surveys] = await Promise.all([
          EVALUATION_APIS.fetchOfficerEvaluationCommentsAPI({ evaluationId }),
          EVALUATION_APIS.fetchOfficerEvaluationScoresAPI({ evaluationId }),
          EVALUATION_APIS.fetchOfficerEvaluationSurveyAPI(),
        ]);

        // ⚠️ CRITICAL: Create mapping from database ID to orderNum (1-40)
        // Same mapping logic as useGetOfficerEvaluation - DO NOT REMOVE!
        // See detailed explanation in useGetOfficerEvaluation function above.
        const idToOrderMap: Record<number, number> = {};
        surveys.forEach((survey) => {
          idToOrderMap[survey.id] = survey.orderNum;
        });

        // Map scores by orderNum instead of database ID
        const scoreRecord: Record<string, number> = {};
        scores.forEach((d) => {
          if (d.bottomSurveyId) {
            const orderNum = idToOrderMap[d.bottomSurveyId];
            if (orderNum) {
              scoreRecord[orderNum] = d.score;
            }
          }
        });

        const factorScores: Record<string, IEvaluationFactorScore> = {};
        Object.entries(EVALUATION_FACTORS).forEach(([key, value]) => {
          const totalScore = value.surveyIds.reduce(
            (acc: number, surveyId: number) =>
              acc + (scoreRecord[surveyId] || 0),
            0,
          );

          const averageScore = totalScore / value.surveyIds.length;
          const normalizedScore = (averageScore / 7) * 100; // 7점 만점 -> 100점 만점

          factorScores[key] = {
            code: key,
            text: value.text,
            surveyIds: value.surveyIds,
            score: normalizedScore || 0,
          };
        });

        return {
          comments: comments || [],
          scores: scoreRecord,
          factorScores,
        };
      },
      enabled: !!currentUser,
      staleTime: 60 * 60 * 1000, // 60 minutes
    })),
  });

  // Combine results into an object with evaluationId as the key
  const evaluations: Record<number, IOfficerEvaluationQuery> = {};
  queries.forEach((result, index) => {
    const evaluationId = evaluationIds[index];
    if (evaluationId !== null) {
      evaluations[evaluationId] = result.data || {
        comments: [],
        scores: {},
        factorScores: {},
      };
    }
  });

  return evaluations;
};

/**
 * 티켓 갯수 조회
 */
export const useGetTicketCount = () => {
  const { data: currentUser } = useGetCurrentUser();
  return useQuery<{ count: number }>({
    queryKey: officerQueryKeys.ticket(),
    queryFn: EVALUATION_APIS.fetchTicketCountAPI,
    enabled: !!currentUser,
    staleTime: 60 * 60 * 1000, // 60 minutes
  });
};

/**
 * 사정관 체크
 */
export const useCheckOfficer = () => {
  const { data: currentUser } = useGetCurrentUser();
  return useQuery<boolean>({
    queryKey: officerQueryKeys.isOfficer(),
    queryFn: EVALUATION_APIS.fetchCheckOfficerAPI,
    enabled: !!currentUser,
    staleTime: 60 * 60 * 1000, // 60 minutes
  });
};

/**
 * 사정관 프로필 조회
 */
export const useOfficerProfile = () => {
  const { data: currentUser } = useGetCurrentUser();
  return useQuery<IOfficerProfile | null>({
    queryKey: officerQueryKeys.profile(),
    queryFn: EVALUATION_APIS.fetchOfficerProfileAPI,
    enabled: !!currentUser,
    staleTime: 60 * 60 * 1000, // 60 minutes
  });
};
