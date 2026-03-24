import { useQuery } from "@tanstack/react-query";
import { useGetCurrentUser } from "../../me/queries";
import { INTEREST_UNIV_API } from "./apis";

export const interestUnivQueryKeys = {
  all: ["interest-univ"] as const,
  subject: () => [...interestUnivQueryKeys.all, "subject"] as const,
  comprehensive: () => [...interestUnivQueryKeys.all, "comprehensive"] as const,
  recruitmentUnits: (admissionType: string) =>
    [...interestUnivQueryKeys.all, "recruitmentUnits", admissionType] as const,
};

/**
 * [관심대학] 교과 전형 조회
 */
export const useGetInterestSusiSubject = () => {
  const { data: currentUser } = useGetCurrentUser();
  return useQuery({
    queryKey: interestUnivQueryKeys.subject(),
    queryFn: () =>
      INTEREST_UNIV_API.fetchInterestSusiSubjectAPI(currentUser?.id || ""),
    enabled: !!currentUser,
    staleTime: 60 * 60 * 1000, // 60 minutes
  });
};

/**
 * [관심대학] 학종 전형 조회
 */
export const useGetInterestSusiComprehensive = () => {
  const { data: currentUser } = useGetCurrentUser();
  return useQuery({
    queryKey: interestUnivQueryKeys.comprehensive(),
    queryFn: () =>
      INTEREST_UNIV_API.fetchInterestSusiComprehensiveAPI(
        currentUser?.id || "",
      ),
    enabled: !!currentUser,
    staleTime: 60 * 60 * 1000, // 60 minutes
  });
};

/**
 * [관심대학] 모집단위 조회
 */
export const useGetInterestRecruitmentUnits = (
  admissionType:
    | "susi_subject_tb"
    | "susi_comprehensive_tb"
    | "early_subject"
    | "early_comprehensive",
) => {
  const { data: currentUser } = useGetCurrentUser();
  return useQuery({
    queryKey: interestUnivQueryKeys.recruitmentUnits(admissionType),
    queryFn: () =>
      INTEREST_UNIV_API.fetchInterestRecruitmentAPI(
        currentUser?.id || "",
        admissionType,
      ),
    enabled: !!currentUser,
    staleTime: 60 * 60 * 1000, // 60 minutes
  });
};
