/**
 * ============================================
 * Spring 백엔드 쿼리 (더 이상 사용하지 않음)
 * 2024-12 NestJS로 완전 마이그레이션 완료
 * ============================================
 *
 * 이 파일의 모든 쿼리 훅은 비활성화되었습니다.
 * NestJS 백엔드의 해당 API를 사용하세요.
 */

import { useQuery } from "@tanstack/react-query";
import {
  IEvaluationStudentInfo,
  IOfficerEvaluationResponse,
  SPRING_API,
} from "./apis";
import { useGetCurrentUser } from "../me/queries";

export const springQueryKeys = {
  all: ["spring"] as const,
  officerApplyList: () =>
    [...springQueryKeys.all, "officer-apply-list"] as const,
  officerCompleteEvaluationList: () =>
    [...springQueryKeys.all, "officer-complete-evaluation-list"] as const,
  officerEvaluationStudentInfo: (studentId: string | undefined | null) =>
    [...springQueryKeys.all, "student-info", studentId] as const,
  officerEvaluationInfo: (studentId: string | undefined | null) =>
    [...springQueryKeys.all, "evaluation-info", studentId] as const,
};

/**
 * @deprecated Spring 백엔드는 더 이상 사용하지 않습니다.
 * 평가자가 평가 목록 조회
 */
export const useGetOfficerApplyList = () => {
  const { data: _currentUser } = useGetCurrentUser();
  return useQuery({
    queryKey: springQueryKeys.officerApplyList(),
    queryFn: SPRING_API.fetchOfficerApplyListAPI,
    enabled: false, // 비활성화됨
    staleTime: 60 * 60 * 1000,
  });
};

/**
 * @deprecated Spring 백엔드는 더 이상 사용하지 않습니다.
 * 평가자가 평가 완료 목록 조회
 */
export const useGetCompleteEvaluationList = () => {
  const { data: _currentUser } = useGetCurrentUser();
  return useQuery({
    queryKey: springQueryKeys.officerCompleteEvaluationList(),
    queryFn: SPRING_API.fetchCompleteEvaluationList,
    enabled: false, // 비활성화됨
    staleTime: 60 * 60 * 1000,
  });
};

/**
 * @deprecated Spring 백엔드는 더 이상 사용하지 않습니다.
 * 평가자가 평가의 유저 정보 조회
 */
export const useGetEvaluationStudnetInfo = (
  studentId: string | undefined | null,
) => {
  const { data: _currentUser } = useGetCurrentUser();
  return useQuery<IEvaluationStudentInfo>({
    queryKey: springQueryKeys.officerEvaluationStudentInfo(studentId),
    queryFn: () => SPRING_API.fetchStudentInfo(studentId),
    enabled: false, // 비활성화됨
    staleTime: 60 * 60 * 1000,
  });
};

/**
 * @deprecated Spring 백엔드는 더 이상 사용하지 않습니다.
 * 평가자가 평가 내역 조회
 */
export const useGetEvaluationInfo = (studentId: string | undefined | null) => {
  const { data: _currentUser } = useGetCurrentUser();
  return useQuery<IOfficerEvaluationResponse>({
    queryKey: springQueryKeys.officerEvaluationInfo(studentId),
    queryFn: () => SPRING_API.fetchSurveyScoreList(studentId),
    enabled: false, // 비활성화됨
    staleTime: 60 * 60 * 1000,
  });
};
