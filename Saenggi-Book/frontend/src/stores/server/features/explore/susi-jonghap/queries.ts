import { useQuery } from "@tanstack/react-query";
import {
  IExploreSusiJonghapDetailResponse,
  IExploreSusiJonghapStep1Response,
  IExploreSusiJonghapStep2Response,
  IExploreSusiJonghapStep3Response,
  IExploreSusiJonghapStep4Response,
} from "./interfaces";
import { EXPLORE_SUSI_JONGHAP_APIS } from "./apis";
import { useGetCurrentUser } from "../../me/queries";

export const exploreSusiJonghapQueryKeys = {
  all: ["explore-susi-jonghap"] as const,
  step1: (params: { year: number; basicType: string; subtypeIds?: number[] }) =>
    [...exploreSusiJonghapQueryKeys.all, "step-1", params] as const,
  step2: (recruitmentUnitIds: number[]) =>
    [
      ...exploreSusiJonghapQueryKeys.all,
      "step-2",
      recruitmentUnitIds,
    ] as const,
  step3: (recruitmentUnitIds: number[]) =>
    [
      ...exploreSusiJonghapQueryKeys.all,
      "step-3",
      recruitmentUnitIds,
    ] as const,
  step4: (recruitmentUnitIds: number[]) =>
    [
      ...exploreSusiJonghapQueryKeys.all,
      "step-4",
      recruitmentUnitIds,
    ] as const,
  detail: (recruitmentUnitId: number) =>
    [
      ...exploreSusiJonghapQueryKeys.all,
      "detail",
      recruitmentUnitId,
    ] as const,
};

export const useGetExploreSusiJonghapStep1 = (params: {
  year: number;
  basicType: string;
  minorFieldId: number | null;
  subtypeIds?: number[];
}) => {
  return useQuery<IExploreSusiJonghapStep1Response>({
    queryKey: exploreSusiJonghapQueryKeys.step1(params),
    queryFn: () =>
      EXPLORE_SUSI_JONGHAP_APIS.fetchExploreSusiJonghapStep1API(
        params,
      ),
    staleTime: 60 * 60 * 1000, // 60 minutes
    enabled: !!params.minorFieldId,
  });
};

export const useGetExploreSusiJonghapStep2 = (
  recruitmentUnitIds: number[],
) => {
  const { data: currentUser } = useGetCurrentUser();
  return useQuery<IExploreSusiJonghapStep2Response>({
    queryKey: exploreSusiJonghapQueryKeys.step2(recruitmentUnitIds),
    queryFn: () =>
      EXPLORE_SUSI_JONGHAP_APIS.fetchExploreSusiJonghapStep2API({
        ids: recruitmentUnitIds,
      }),
    staleTime: 60 * 60 * 1000, // 60 minutes
    enabled: !!currentUser && recruitmentUnitIds.length > 0, // 로그인중 && 선택된 recruitmentUnitIds가 있을 때만 쿼리 실행
  });
};

export const useGetExploreSusiJonghapStep3 = (
  recruitmentUnitIds: number[],
) => {
  const { data: currentUser } = useGetCurrentUser();
  return useQuery<IExploreSusiJonghapStep3Response>({
    queryKey: exploreSusiJonghapQueryKeys.step3(recruitmentUnitIds),
    queryFn: () =>
      EXPLORE_SUSI_JONGHAP_APIS.fetchExploreSusiJonghapStep3API({
        ids: recruitmentUnitIds,
      }),
    staleTime: 60 * 60 * 1000, // 60 minutes
    enabled: !!currentUser && recruitmentUnitIds.length > 0, // 로그인중 && 선택된 recruitmentUnitIds가 있을 때만 쿼리 실행
  });
};

export const useGetExploreSusiJonghapStep4 = (
  recruitmentUnitIds: number[],
) => {
  const { data: currentUser } = useGetCurrentUser();
  return useQuery<IExploreSusiJonghapStep4Response>({
    queryKey: exploreSusiJonghapQueryKeys.step4(recruitmentUnitIds),
    queryFn: () =>
      EXPLORE_SUSI_JONGHAP_APIS.fetchExploreSusiJonghapStep4API({
        ids: recruitmentUnitIds,
      }),
    staleTime: 60 * 60 * 1000, // 60 minutes
    enabled: !!currentUser && recruitmentUnitIds.length > 0, // 로그인중 && 선택된 recruitmentUnitIds가 있을 때만 쿼리 실행
  });
};

export const useGetExploreSusiJonghapDetail = (
  recruitmentUnitId: number,
) => {
  const { data: currentUser } = useGetCurrentUser();
  return useQuery<IExploreSusiJonghapDetailResponse | null>({
    queryKey: exploreSusiJonghapQueryKeys.detail(recruitmentUnitId),
    queryFn: () =>
      EXPLORE_SUSI_JONGHAP_APIS.fetchExploreSusiJonghapDetailAPI({
        id: recruitmentUnitId,
      }),
    staleTime: 60 * 60 * 1000, // 60 minutes
    enabled: !!currentUser,
  });
};
