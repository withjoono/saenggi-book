import { IPassRecord, IRecruitmentUnitPassFailRecord } from "./interfaces";
import { useQuery } from "@tanstack/react-query";
import { SUSI_PASSRECORD_APIS } from "./apis";
import { useGetCurrentUser } from "../../me/queries";

export const passrecodQueryKeys = {
  all: ["passrecord"] as const,
  subject: (params: { id: number }) =>
    [...passrecodQueryKeys.all, "subject", params] as const,
  comprehensive: (params: { id: number }) =>
    [...passrecodQueryKeys.all, "comprehensive", params] as const,
  records: (params: { recruitmentUnitId: number }) =>
    [...passrecodQueryKeys.all, "records", params] as const,
};

/**
 * 수시 교과 합불 사례 조회
 */
export const useGetSusiSubjectPassRecord = (params: { id: number }) => {
  const { data: currentUser } = useGetCurrentUser();
  return useQuery<IPassRecord[]>({
    queryKey: passrecodQueryKeys.subject(params),
    queryFn: () => SUSI_PASSRECORD_APIS.fetchSusiSubjectPassRecordAPI(params),
    enabled: !!currentUser,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

/**
 * 수시 학종 합불 사례 조회
 */
export const useGetSusiComprehensivePassRecord = (params: { id: number }) => {
  const { data: currentUser } = useGetCurrentUser();
  return useQuery<IPassRecord[]>({
    queryKey: passrecodQueryKeys.comprehensive(params),
    queryFn: () =>
      SUSI_PASSRECORD_APIS.fetchSusiComprehensivePassRecordAPI(params),
    enabled: !!currentUser,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

/**
 * 수시 합불 사례 조회
 */
export const useGetSusiPassRecord = (params: { recruitmentUnitId: number }) => {
  const { data: currentUser } = useGetCurrentUser();
  return useQuery<IRecruitmentUnitPassFailRecord[]>({
    queryKey: passrecodQueryKeys.records(params),
    queryFn: () => SUSI_PASSRECORD_APIS.fetchSusiPassRecordAPI(params),
    enabled: !!currentUser,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};
